const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const pool = require('../config/database');
const { scrapeAndUpdatePrices } = require('../services/costzoneScraper');
const { executeScraping } = require('../services/scrapingCron');

const router = express.Router();

// Middleware: Ensure user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    // Get material statistics
    const [materialStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_materials,
        AVG(cost_per_unit) as avg_cost,
        SUM(cost_per_unit) as total_value,
        COUNT(DISTINCT category) as total_categories
      FROM materials WHERE is_active = TRUE
    `);

    // Get recent updates
    const [recentUpdates] = await connection.query(`
      SELECT 
        m.name,
        m.cost_per_unit,
        m.updated_at,
        u.name as updated_by_name
      FROM materials m
      LEFT JOIN users u ON m.updated_by = u.id
      WHERE m.updated_at IS NOT NULL
      ORDER BY m.updated_at DESC
      LIMIT 10
    `);

    // Get category breakdown
    const [categoryBreakdown] = await connection.query(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(cost_per_unit) as avg_cost
      FROM materials 
      WHERE is_active = TRUE
      GROUP BY category
    `);

    connection.release();

    res.json({
      success: true,
      stats: {
        materials: materialStats[0],
        recentUpdates,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

// Bulk update material costs
router.put('/materials/bulk-update', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { updates } = req.body; // Array of {materialId, costPerUnit}

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const results = [];

      for (const update of updates) {
        const { materialId, costPerUnit } = update;

        if (!materialId || costPerUnit === undefined || costPerUnit < 0) {
          continue; // Skip invalid entries
        }

        await connection.query(
          'UPDATE materials SET cost_per_unit = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
          [costPerUnit, req.user.id, materialId]
        );

        results.push({ materialId, costPerUnit, success: true });
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `${results.length} materials updated successfully`,
        results
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// Add new material
router.post('/materials', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { name, category, costPerUnit, unit, description } = req.body;

    if (!name || !costPerUnit) {
      return res.status(400).json({ message: 'Name and cost are required' });
    }

    const connection = await pool.getConnection();

    // Check if material already exists
    const [existing] = await connection.query(
      'SELECT id FROM materials WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Material with this name already exists' });
    }

    // Insert new material
    const [result] = await connection.query(
      'INSERT INTO materials (name, category, cost_per_unit, unit, description, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category || 'other', costPerUnit, unit || 'sqm', description, req.user.id]
    );

    // Get the created material
    const [newMaterial] = await connection.query(
      'SELECT id, name, category, cost_per_unit, unit, description, created_at FROM materials WHERE id = ?',
      [result.insertId]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material: newMaterial[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete material (soft delete)
router.delete('/materials/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    // Check if material exists
    const [material] = await connection.query(
      'SELECT id FROM materials WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (material.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Material not found' });
    }

    // Soft delete
    await connection.query(
      'UPDATE materials SET is_active = FALSE, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Scrape prices from costzone.org (admin only)
router.post('/scrape-prices', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    console.log(`[API] Manual scraping initiated by user ${userId}`);
    
    // Run scraping in background and return immediately
    executeScraping('manual', userId)
      .then(result => {
        console.log('[API] Scraping completed:', {
          success: result.success,
          materialsUpdated: result.result?.totalUpdated || 0,
          logId: result.logId
        });
      })
      .catch(error => {
        console.error('[API] Scraping error:', error);
      });
    
    res.json({
      success: true,
      message: 'Scraping initiated. Prices will be updated shortly. Check scraping logs for details.'
    });
  } catch (error) {
    next(error);
  }
});

// Get scraping logs (admin only)
router.get('/scraping-logs', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const connection = await pool.getConnection();
    
    // Ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scraping_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        status ENUM('success', 'error', 'partial') NOT NULL,
        materials_updated INT DEFAULT 0,
        materials_inserted INT DEFAULT 0,
        total_materials INT DEFAULT 0,
        error_message TEXT,
        execution_time_ms INT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        triggered_by ENUM('cron', 'manual', 'startup') DEFAULT 'cron',
        triggered_by_user_id INT NULL,
        FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_started_at (started_at),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Get total count
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM scraping_logs'
    );
    const total = countResult[0].total;
    
    // Get logs with user info
    const [logs] = await connection.query(`
      SELECT 
        sl.*,
        u.name as triggered_by_user_name,
        u.email as triggered_by_user_email
      FROM scraping_logs sl
      LEFT JOIN users u ON sl.triggered_by_user_id = u.id
      ORDER BY sl.started_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    connection.release();
    
    console.log(`[API] Returning ${logs.length} scraping logs (page ${page}, total: ${total})`);
    
    res.json({
      success: true,
      logs: logs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get last scraping time and stats
router.get('/scraping-stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    
    // Ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scraping_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        status ENUM('success', 'error', 'partial') NOT NULL,
        materials_updated INT DEFAULT 0,
        materials_inserted INT DEFAULT 0,
        total_materials INT DEFAULT 0,
        error_message TEXT,
        execution_time_ms INT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        triggered_by ENUM('cron', 'manual', 'startup') DEFAULT 'cron',
        triggered_by_user_id INT NULL,
        FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_started_at (started_at),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Get last successful scraping
    const [lastSuccess] = await connection.query(`
      SELECT * FROM scraping_logs 
      WHERE status = 'success' 
      ORDER BY completed_at DESC 
      LIMIT 1
    `);
    
    // Get stats
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_runs,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_runs,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_runs,
        AVG(execution_time_ms) as avg_execution_time,
        SUM(materials_updated) as total_materials_updated,
        SUM(materials_inserted) as total_materials_inserted
      FROM scraping_logs
    `);
    
    // Get last scraped time from materials table
    const [lastScraped] = await connection.query(`
      SELECT MAX(last_scraped_at) as last_scraped_at 
      FROM materials 
      WHERE last_scraped_at IS NOT NULL
    `);
    
    connection.release();
    
    console.log(`[API] Scraping stats - lastScraping: ${lastSuccess[0] ? 'found' : 'none'}, stats:`, stats[0]);
    
    res.json({
      success: true,
      lastScraping: lastSuccess[0] || null,
      lastScrapedAt: lastScraped[0]?.last_scraped_at || null,
      stats: stats[0] || {
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        avg_execution_time: null,
        total_materials_updated: 0,
        total_materials_inserted: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all material prices (public endpoint)
router.get('/prices', async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Ensure materials table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        category ENUM('construction', 'finishing', 'other') DEFAULT 'construction',
        cost_per_unit DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'sqm',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by INT,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);

    // Add new columns if they don't exist (for existing tables)
    try {
      await connection.query(`ALTER TABLE materials ADD COLUMN source_url VARCHAR(255)`);
    } catch (e) {
      // Column already exists, ignore
    }
    
    try {
      await connection.query(`ALTER TABLE materials ADD COLUMN last_scraped_at TIMESTAMP`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Check which columns actually exist
    const [columnInfo] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'materials'
    `);
    
    const existingColumns = columnInfo.map(c => c.COLUMN_NAME);
    const hasSourceUrl = existingColumns.includes('source_url');
    const hasLastScraped = existingColumns.includes('last_scraped_at');
    
    // Build SELECT query based on available columns
    let selectFields = 'id, name, category, cost_per_unit, unit, description, updated_at';
    if (hasSourceUrl) selectFields += ', source_url';
    if (hasLastScraped) selectFields += ', last_scraped_at';
    
    const [materials] = await connection.query(
      `SELECT ${selectFields}
       FROM materials 
       WHERE is_active = TRUE 
       ORDER BY category, name`
    );
    
    // Ensure all materials have the expected fields (add nulls for missing columns)
    const normalizedMaterials = materials.map(m => ({
      ...m,
      source_url: m.source_url || null,
      last_scraped_at: m.last_scraped_at || null
    }));

    connection.release();

    res.json({
      success: true,
      materials: normalizedMaterials || [],
      count: normalizedMaterials?.length || 0
    });
  } catch (error) {
    if (connection) {
      connection.release();
    }
    console.error('[Materials API] Error fetching prices:', error);
    next(error);
  }
});

module.exports = router;
