const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const pool = require('../config/database');
const { scrapeAndUpdatePrices } = require('../services/costzoneScraper');

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
    
    // Run scraping in background and return immediately
    scrapeAndUpdatePrices(userId)
      .then(result => {
        console.log('[API] Scraping completed:', result);
      })
      .catch(error => {
        console.error('[API] Scraping error:', error);
      });
    
    res.json({
      success: true,
      message: 'Scraping initiated. Prices will be updated shortly.'
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
