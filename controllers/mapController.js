const pool = require('../config/database');
const path = require('path');

// Helper function to ensure maps table exists
const ensureMapsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS maps (
      id INT PRIMARY KEY AUTO_INCREMENT,
      room_type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_room_type (room_type)
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

// Generate 2D map from DXF files
const generate2DMap = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { length, width, roomSpecifications } = req.body;
    const fs = require('fs');
    const path = require('path');

    console.log('[generate2DMap] Request received:', { userId, length, width, roomSpecifications });

    // Get the DXF file from drawings folder
    const drawingsPath = path.join(__dirname, '..', '..', 'drawings');
    
    if (!fs.existsSync(drawingsPath)) {
      console.error('[generate2DMap] Drawings folder not found:', drawingsPath);
      return res.status(404).json({ 
        success: false,
        message: 'Drawings folder not found' 
      });
    }
    
    const dxfFiles = fs.readdirSync(drawingsPath).filter(file => file.endsWith('.dxf'));
    
    if (dxfFiles.length === 0) {
      console.error('[generate2DMap] No DXF files found in:', drawingsPath);
      return res.status(404).json({ 
        success: false,
        message: 'No DXF files found in drawings folder' 
      });
    }

    // Return the first DXF file (house.dxf)
    const dxfFile = dxfFiles[0];
    const dxfUrl = `${req.protocol}://${req.get('host')}/api/maps/dxf/${dxfFile}`;

    console.log('[generate2DMap] Returning DXF file:', dxfFile, 'URL:', dxfUrl);

    res.json({
      success: true,
      maps: [{
        id: 1,
        title: 'House Plan',
        file_path: dxfUrl,
        filename: dxfFile,
        description: 'Professional 2D house floor plan',
        room_type: 'house'
      }]
    });
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

module.exports = {
  createMap,
  getAllMaps,
  getMapsByRoomType,
  getMapsBySpecifications,
  generateMap,
  generate2DMap,
  getUserMaps,
  getMapDetails
};
