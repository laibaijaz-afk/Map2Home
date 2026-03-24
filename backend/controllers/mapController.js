const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const SPEC_COLUMNS = [
  'bedrooms', 'bathrooms', 'kitchen', 'drawing_room',
  'dining_room', 'store_room', 'garage', 'servant_quarter', 'tv_lounge'
];

// Helper function to ensure maps table exists with room specification columns
const ensureMapsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS maps (
      id INT PRIMARY KEY AUTO_INCREMENT,
      room_type VARCHAR(50) NOT NULL DEFAULT 'house',
      title VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      description TEXT,
      bedrooms INT NOT NULL DEFAULT 0,
      bathrooms INT NOT NULL DEFAULT 0,
      kitchen INT NOT NULL DEFAULT 0,
      drawing_room INT NOT NULL DEFAULT 0,
      dining_room INT NOT NULL DEFAULT 0,
      store_room INT NOT NULL DEFAULT 0,
      garage INT NOT NULL DEFAULT 0,
      servant_quarter INT NOT NULL DEFAULT 0,
      tv_lounge INT NOT NULL DEFAULT 0,
      plot_length DECIMAL(10,2) DEFAULT NULL,
      plot_width DECIMAL(10,2) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_room_type (room_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Safely add columns that may not exist yet (ALTER TABLE on existing tables)
  const alterCols = [
    'bedrooms INT NOT NULL DEFAULT 0',
    'bathrooms INT NOT NULL DEFAULT 0',
    'kitchen INT NOT NULL DEFAULT 0',
    'drawing_room INT NOT NULL DEFAULT 0',
    'dining_room INT NOT NULL DEFAULT 0',
    'store_room INT NOT NULL DEFAULT 0',
    'garage INT NOT NULL DEFAULT 0',
    'servant_quarter INT NOT NULL DEFAULT 0',
    'tv_lounge INT NOT NULL DEFAULT 0',
    'plot_length DECIMAL(10,2) DEFAULT NULL',
    'plot_width DECIMAL(10,2) DEFAULT NULL'
  ];
  for (const col of alterCols) {
    try {
      await connection.query(`ALTER TABLE maps ADD COLUMN ${col}`);
    } catch (e) {
      // ER_DUP_FIELDNAME (1060) means column already exists — safe to ignore
      if (e.errno !== 1060) throw e;
    }
  }
};

// Stores per-user editable JSON for a base map id (does not modify DXF file).
const ensureMapEditsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS map_user_edits (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      map_id INT NOT NULL,
      map_data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_map (user_id, map_id),
      INDEX idx_user_map (user_id, map_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

// Helper function to get full URL for file path
const getFullUrl = (filePath, req) => {
  if (!filePath) return null;
  // If already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // Otherwise, construct full URL
  const protocol = req.protocol;
  const host = req.get('host');
  // Ensure file path starts with /uploads for static serving
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${protocol}://${host}${cleanPath}`;
};

// Create a new map
const createMap = async (req, res, next) => {
  try {
    const { room_type, title, file_path, description } = req.body;

    // Validation
    if (!room_type || !title || !file_path) {
      return res.status(400).json({ 
        success: false,
        message: 'room_type, title, and file_path are required' 
      });
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [result] = await connection.query(
      'INSERT INTO maps (room_type, title, file_path, description) VALUES (?, ?, ?, ?)',
      [room_type, title, file_path, description || null]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Map created successfully',
      map: {
        id: result.insertId,
        room_type,
        title,
        file_path: getFullUrl(file_path, req),
        description
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all maps
const getAllMaps = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [maps] = await connection.query(
      'SELECT * FROM maps ORDER BY created_at DESC'
    );

    connection.release();

    // Convert file_path to full URLs
    const mapsWithUrls = maps.map(map => ({
      ...map,
      file_path: getFullUrl(map.file_path, req)
    }));

    res.json({
      success: true,
      maps: mapsWithUrls
    });
  } catch (error) {
    next(error);
  }
};

// Get maps by room type
const getMapsByRoomType = async (req, res, next) => {
  try {
    const { room_type } = req.params;

    if (!room_type) {
      return res.status(400).json({ 
        success: false,
        message: 'room_type parameter is required' 
      });
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [maps] = await connection.query(
      'SELECT * FROM maps WHERE room_type = ? ORDER BY created_at DESC',
      [room_type]
    );

    connection.release();

    // Convert file_path to full URLs
    const mapsWithUrls = maps.map(map => ({
      ...map,
      file_path: getFullUrl(map.file_path, req)
    }));

    res.json({
      success: true,
      maps: mapsWithUrls
    });
  } catch (error) {
    next(error);
  }
};

// Get maps based on room specifications
const getMapsBySpecifications = async (req, res, next) => {
  try {
    const { roomSpecifications } = req.body;

    if (!roomSpecifications) {
      return res.status(400).json({ 
        success: false,
        message: 'roomSpecifications are required' 
      });
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    // Map room specification keys to room_type values
    const roomTypeMapping = {
      bedrooms: 'bedroom',
      bathrooms: 'bathroom',
      kitchen: 'kitchen',
      drawingRoom: 'drawing_room',
      diningRoom: 'dining_room',
      storeRoom: 'store_room',
      garage: 'garage',
      servantQuarter: 'servant_quarter',
      tvLounge: 'tv_lounge'
    };

    // Get room types that have count > 0
    const requestedRoomTypes = [];
    for (const [key, roomType] of Object.entries(roomTypeMapping)) {
      const count = roomSpecifications[key] || 0;
      if (count > 0) {
        requestedRoomTypes.push(roomType);
      }
    }

    if (requestedRoomTypes.length === 0) {
      connection.release();
      return res.json({
        success: true,
        maps: []
      });
    }

    // Build query with placeholders
    const placeholders = requestedRoomTypes.map(() => '?').join(',');
    const [maps] = await connection.query(
      `SELECT * FROM maps WHERE room_type IN (${placeholders}) ORDER BY room_type, created_at DESC`,
      requestedRoomTypes
    );

    connection.release();

    // Convert file_path to full URLs
    const mapsWithUrls = maps.map(map => ({
      ...map,
      file_path: getFullUrl(map.file_path, req)
    }));

    res.json({
      success: true,
      maps: mapsWithUrls
    });
  } catch (error) {
    next(error);
  }
};

// Generate 2D map — match maps from DB by room specifications using a scoring approach
const generate2DMap = async (req, res, next) => {
  try {
    const { length, width, roomSpecifications } = req.body;

    console.log('[generate2DMap] Request received:', { length, width, roomSpecifications });

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [allMaps] = await connection.query('SELECT * FROM maps ORDER BY created_at DESC');
    connection.release();

    if (allMaps.length === 0) {
      return res.json({ success: false, message: 'No maps have been added yet. Ask the admin to upload maps.' });
    }

    // Map camelCase keys from frontend to snake_case DB columns
    const keyMap = {
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      kitchen: 'kitchen',
      drawingRoom: 'drawing_room',
      diningRoom: 'dining_room',
      storeRoom: 'store_room',
      garage: 'garage',
      servantQuarter: 'servant_quarter',
      tvLounge: 'tv_lounge'
    };

    const specs = roomSpecifications || {};

    // Score each map: +1 for each spec that matches, -0.5 for each mismatch
    const scored = allMaps.map(map => {
      let score = 0;
      let totalChecked = 0;

      for (const [feKey, dbCol] of Object.entries(keyMap)) {
        const requested = parseInt(specs[feKey]) || 0;
        const mapVal = parseInt(map[dbCol]) || 0;

        if (requested > 0) {
          totalChecked++;
          if (mapVal === requested) {
            score += 2; // exact match
          } else if (mapVal >= requested) {
            score += 1; // map has more than requested
          } else {
            score -= 0.5;
          }
        }
      }

      // Optionally boost if plot dimensions are close
      if (length && width && map.plot_length && map.plot_width) {
        const areaReq = length * width;
        const areaMap = parseFloat(map.plot_length) * parseFloat(map.plot_width);
        const ratio = areaReq > 0 ? areaMap / areaReq : 0;
        if (ratio >= 0.8 && ratio <= 1.2) score += 1;
      }

      return { ...map, _score: score, _totalChecked: totalChecked };
    });

    // Sort by score descending; if no specs were provided, return all maps
    scored.sort((a, b) => b._score - a._score);

    // Build response — include file_path as full DXF URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const maps = scored.map(m => ({
      id: m.id,
      title: m.title,
      file_path: `${baseUrl}/api/maps/dxf/${path.basename(m.file_path)}`,
      filename: path.basename(m.file_path),
      description: m.description,
      room_type: m.room_type,
      bedrooms: m.bedrooms,
      bathrooms: m.bathrooms,
      kitchen: m.kitchen,
      drawing_room: m.drawing_room,
      dining_room: m.dining_room,
      store_room: m.store_room,
      garage: m.garage,
      servant_quarter: m.servant_quarter,
      tv_lounge: m.tv_lounge,
      plot_length: m.plot_length,
      plot_width: m.plot_width,
      score: m._score
    }));

    res.json({ success: true, maps });
  } catch (error) {
    console.error('[generate2DMap] Error:', error);
    next(error);
  }
};

// Generate partial map
const generateMap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address, zoomLevel, mapType, tools, layers } = req.body;

    // Validation
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const connection = await pool.getConnection();

    // Create table if doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS map_generations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        address VARCHAR(255),
        zoom_level INT,
        map_type VARCHAR(50),
        selection_tool VARCHAR(50),
        layers JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Save map generation record
    const [result] = await connection.query(
      'INSERT INTO map_generations (user_id, address, zoom_level, map_type, selection_tool, layers) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, address, zoomLevel || 15, mapType || 'satellite', tools || 'rectangle', JSON.stringify(layers || {})]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Map generated successfully',
      mapId: result.insertId,
      data: {
        address,
        zoomLevel: zoomLevel || 15,
        mapType: mapType || 'satellite',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's map generations
const getUserMaps = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS map_generations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        address VARCHAR(255),
        zoom_level INT,
        map_type VARCHAR(50),
        selection_tool VARCHAR(50),
        layers JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const [maps] = await connection.query(
      'SELECT * FROM map_generations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    connection.release();

    res.json({
      success: true,
      maps: maps || []
    });
  } catch (error) {
    next(error);
  }
};

// Get map details
const getMapDetails = async (req, res, next) => {
  try {
    const { mapId } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [maps] = await connection.query(
      'SELECT * FROM map_generations WHERE id = ? AND user_id = ?',
      [mapId, userId]
    );

    connection.release();

    if (maps.length === 0) {
      return res.status(404).json({ message: 'Map not found' });
    }

    res.json({
      success: true,
      map: maps[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get saved editable JSON for current user + base map id
const getMapEditedJson = async (req, res, next) => {
  let connection;
  try {
    const userId = req.user.id;
    const mapId = Number.parseInt(req.params.mapId, 10);
    if (!Number.isFinite(mapId) || mapId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid mapId' });
    }

    connection = await pool.getConnection();
    await ensureMapsTable(connection);
    await ensureMapEditsTable(connection);

    const [mapRows] = await connection.query('SELECT id FROM maps WHERE id = ?', [mapId]);
    if (!mapRows.length) {
      return res.status(404).json({ success: false, message: 'Map not found' });
    }

    const [rows] = await connection.query(
      'SELECT map_data, updated_at FROM map_user_edits WHERE user_id = ? AND map_id = ? LIMIT 1',
      [userId, mapId]
    );

    if (!rows.length) {
      return res.json({ success: true, map_data: null, updated_at: null });
    }

    let parsed = null;
    try {
      parsed = JSON.parse(rows[0].map_data);
    } catch (e) {
      parsed = null;
    }

    return res.json({
      success: true,
      map_data: parsed,
      updated_at: rows[0].updated_at || null
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// Save editable JSON for current user + base map id
const saveMapEditedJson = async (req, res, next) => {
  let connection;
  try {
    const userId = req.user.id;
    const mapId = Number.parseInt(req.params.mapId, 10);
    const { map_data } = req.body || {};

    if (!Number.isFinite(mapId) || mapId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid mapId' });
    }
    if (!map_data || typeof map_data !== 'object') {
      return res.status(400).json({ success: false, message: 'map_data is required' });
    }

    connection = await pool.getConnection();
    await ensureMapsTable(connection);
    await ensureMapEditsTable(connection);

    const [mapRows] = await connection.query('SELECT id FROM maps WHERE id = ?', [mapId]);
    if (!mapRows.length) {
      return res.status(404).json({ success: false, message: 'Map not found' });
    }

    const serialized = JSON.stringify(map_data);
    await connection.query(
      `INSERT INTO map_user_edits (user_id, map_id, map_data)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         map_data = VALUES(map_data),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, mapId, serialized]
    );

    return res.json({ success: true, message: 'Map edits saved successfully' });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// ──────────────────────────────────────────────
// Admin Map CRUD
// ──────────────────────────────────────────────

const adminAddMap = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const {
      title, description, room_type,
      bedrooms, bathrooms, kitchen, drawing_room,
      dining_room, store_room, garage, servant_quarter, tv_lounge,
      plot_length, plot_width
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'DXF file is required' });
    }

    const filePath = req.file.filename; // just the filename inside drawings/

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [result] = await connection.query(
      `INSERT INTO maps
        (title, description, room_type, file_path,
         bedrooms, bathrooms, kitchen, drawing_room,
         dining_room, store_room, garage, servant_quarter, tv_lounge,
         plot_length, plot_width)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        room_type || 'house',
        filePath,
        parseInt(bedrooms) || 0,
        parseInt(bathrooms) || 0,
        parseInt(kitchen) || 0,
        parseInt(drawing_room) || 0,
        parseInt(dining_room) || 0,
        parseInt(store_room) || 0,
        parseInt(garage) || 0,
        parseInt(servant_quarter) || 0,
        parseInt(tv_lounge) || 0,
        plot_length ? parseFloat(plot_length) : null,
        plot_width ? parseFloat(plot_width) : null
      ]
    );
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Map added successfully',
      map: { id: result.insertId, title, file_path: filePath }
    });
  } catch (error) {
    next(error);
  }
};

const adminGetAllMaps = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [maps] = await connection.query('SELECT * FROM maps ORDER BY created_at DESC');
    connection.release();

    res.json({ success: true, maps });
  } catch (error) {
    next(error);
  }
};

const adminUpdateMap = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;
    const {
      title, description, room_type,
      bedrooms, bathrooms, kitchen, drawing_room,
      dining_room, store_room, garage, servant_quarter, tv_lounge,
      plot_length, plot_width
    } = req.body;

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [existing] = await connection.query('SELECT * FROM maps WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Map not found' });
    }

    await connection.query(
      `UPDATE maps SET
        title = ?, description = ?, room_type = ?,
        bedrooms = ?, bathrooms = ?, kitchen = ?, drawing_room = ?,
        dining_room = ?, store_room = ?, garage = ?, servant_quarter = ?, tv_lounge = ?,
        plot_length = ?, plot_width = ?
       WHERE id = ?`,
      [
        title || existing[0].title,
        description !== undefined ? description : existing[0].description,
        room_type || existing[0].room_type,
        parseInt(bedrooms) || 0,
        parseInt(bathrooms) || 0,
        parseInt(kitchen) || 0,
        parseInt(drawing_room) || 0,
        parseInt(dining_room) || 0,
        parseInt(store_room) || 0,
        parseInt(garage) || 0,
        parseInt(servant_quarter) || 0,
        parseInt(tv_lounge) || 0,
        plot_length ? parseFloat(plot_length) : null,
        plot_width ? parseFloat(plot_width) : null,
        id
      ]
    );
    connection.release();

    res.json({ success: true, message: 'Map updated successfully' });
  } catch (error) {
    next(error);
  }
};

const adminDeleteMap = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [existing] = await connection.query('SELECT * FROM maps WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Map not found' });
    }

    // Delete the DXF file from drawings folder
    const drawingsDir = path.join(__dirname, '..', '..', 'drawings');
    const filePath = path.join(drawingsDir, path.basename(existing[0].file_path));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await connection.query('DELETE FROM maps WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'Map deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMap,
  getAllMaps,
  getMapsByRoomType,
  getMapsBySpecifications,
  generateMap,
  generate2DMap,
  getUserMaps,
  getMapDetails,
  getMapEditedJson,
  saveMapEditedJson,
  adminAddMap,
  adminGetAllMaps,
  adminUpdateMap,
  adminDeleteMap
};
