const pool = require('../config/database');

// Update cost configuration (admin only)
const updateCosts = async (req, res, next) => {
  try {
    // Check if user is admin (middleware should have already verified this)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { baseCost, materialMarkup, laborCost } = req.body;

    // Validation
    if (!baseCost || !materialMarkup || !laborCost) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const connection = await pool.getConnection();

    // Create table if doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cost_config (
        id INT PRIMARY KEY DEFAULT 1,
        base_cost_per_sqm DECIMAL(10, 2),
        material_markup DECIMAL(5, 2),
        labor_cost_per_sqm DECIMAL(10, 2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by INT,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);

    // Check if config exists
    const [config] = await connection.query('SELECT * FROM cost_config WHERE id = 1');

    if (config.length === 0) {
      // Insert new config
      await connection.query(
        'INSERT INTO cost_config (id, base_cost_per_sqm, material_markup, labor_cost_per_sqm, updated_by) VALUES (1, ?, ?, ?, ?)',
        [baseCost, materialMarkup, laborCost, req.user.id]
      );
    } else {
      // Update existing config
      await connection.query(
        'UPDATE cost_config SET base_cost_per_sqm = ?, material_markup = ?, labor_cost_per_sqm = ?, updated_by = ? WHERE id = 1',
        [baseCost, materialMarkup, laborCost, req.user.id]
      );
    }

    connection.release();

    res.json({
      success: true,
      message: 'Cost configuration updated successfully',
      data: {
        baseCost,
        materialMarkup,
        laborCost
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get system statistics (admin only)
const getSystemStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const connection = await pool.getConnection();

    // Get total users
    const [userStats] = await connection.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as today FROM users'
    );

    // Get estimates stats
    const [estimateStats] = await connection.query(
      'SELECT COUNT(*) as total FROM cost_estimates'
    );

    // Get map generation stats
    const [mapStats] = await connection.query(`
      CREATE TABLE IF NOT EXISTS map_generations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      SELECT COUNT(*) as total FROM map_generations
    `);

    connection.release();

    res.json({
      success: true,
      stats: {
        totalUsers: userStats[0].total || 0,
        activeToday: userStats[0].today || 0,
        totalEstimates: estimateStats[0].total || 0,
        totalMaps: mapStats[0].total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    );
    connection.release();

    res.json({
      success: true,
      users: users || []
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId, role } = req.body;

    // Validation
    if (!userId || !role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user ID or role' });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    connection.release();

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all materials (admin only)
const getMaterials = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const connection = await pool.getConnection();

    // Create materials table if it doesn't exist
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

    // Check if materials exist, if not insert defaults (only materials from costzone.org)
    const [existingMaterials] = await connection.query('SELECT COUNT(*) as count FROM materials WHERE is_active = TRUE');
    
    if (existingMaterials[0].count === 0) {
      // Only insert materials that exist on costzone.org (Pakistan-specific)
      await connection.query(`
        INSERT INTO materials (name, category, cost_per_unit, unit, description) VALUES
        ('Cement', 'construction', 1235.00, 'bag', 'Cement (Maple Leaf, DG, Bestway, etc.)'),
        ('Steel', 'construction', 250000.00, 'ton', 'Steel bars/Sariya for reinforcement'),
        ('Bricks', 'construction', 17.00, 'piece', 'Red bricks/Clay bricks'),
        ('Sand', 'construction', 7000.00, 'truck', 'Sand/Rait for construction'),
        ('Gravel', 'construction', 8000.00, 'truck', 'Crush/Bajri for construction'),
        ('Tiles', 'finishing', 400.00, 'sqm', 'Ceramic tiles'),
        ('Paint', 'finishing', 2200.00, 'liter', 'Paint (Berger, Nippon, Dulux, etc.)')
      `);
    }

    const [materials] = await connection.query(
      'SELECT id, name, category, cost_per_unit, unit, description, is_active, updated_at FROM materials WHERE is_active = TRUE ORDER BY category, name'
    );

    connection.release();

    res.json({
      success: true,
      materials: materials || []
    });
  } catch (error) {
    next(error);
  }
};

// Update material cost (admin only)
const updateMaterialCost = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { materialId, costPerUnit } = req.body;

    // Validation
    if (!materialId || costPerUnit === undefined || costPerUnit < 0) {
      return res.status(400).json({ message: 'Invalid material ID or cost' });
    }

    const connection = await pool.getConnection();

    // Check if material exists
    const [material] = await connection.query(
      'SELECT id FROM materials WHERE id = ?',
      [materialId]
    );

    if (material.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Material not found' });
    }

    // Update material cost
    await connection.query(
      'UPDATE materials SET cost_per_unit = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [costPerUnit, req.user.id, materialId]
    );

    // Get updated material
    const [updatedMaterial] = await connection.query(
      'SELECT id, name, category, cost_per_unit, unit, description, updated_at FROM materials WHERE id = ?',
      [materialId]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Material cost updated successfully',
      material: updatedMaterial[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateCosts,
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getMaterials,
  updateMaterialCost
};
