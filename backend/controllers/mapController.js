const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

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
      marla DECIMAL(10,2) DEFAULT NULL,
      elevation_file VARCHAR(500) DEFAULT NULL,
      working_drawing_file VARCHAR(500) DEFAULT NULL,
      electric_file VARCHAR(500) DEFAULT NULL,
      sanitary_file VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_room_type (room_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS map_floors (
      id INT PRIMARY KEY AUTO_INCREMENT,
      map_id INT NOT NULL,
      floor_number INT NOT NULL DEFAULT 0,
      floor_name VARCHAR(100) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
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
    'plot_width DECIMAL(10,2) DEFAULT NULL',
    'marla DECIMAL(10,2) DEFAULT NULL',
    'elevation_file VARCHAR(500) DEFAULT NULL',
    'working_drawing_file VARCHAR(500) DEFAULT NULL',
    'electric_file VARCHAR(500) DEFAULT NULL',
    'sanitary_file VARCHAR(500) DEFAULT NULL'
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

// Helper function to get full URL for a DXF file path stored in the database.
// Always rebuilds the URL from the current host to handle port/host changes,
// and always encodes the filename to handle special characters (#, spaces, etc.).
const getFullUrl = (filePath, req) => {
  if (!filePath) return null;
  // Extract just the filename regardless of what was stored (full URL, relative path, or bare name)
  let filename;
  try {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const urlObj = new URL(filePath);
      filename = decodeURIComponent(path.basename(urlObj.pathname));
    } else {
      filename = path.basename(filePath);
    }
  } catch {
    filename = path.basename(filePath);
  }
  if (!filename) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/api/maps/dxf/${encodeURIComponent(filename)}`;
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

    const mapsWithFloors = await attachFloors(connection, maps, req);
    connection.release();

    res.json({
      success: true,
      maps: mapsWithFloors
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

    const mapsWithFloors = await attachFloors(connection, maps, req);
    connection.release();

    res.json({
      success: true,
      maps: mapsWithFloors
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

    const mapsWithFloors = await attachFloors(connection, maps, req);
    connection.release();

    res.json({
      success: true,
      maps: mapsWithFloors
    });
  } catch (error) {
    next(error);
  }
};

/** Feet: treat two plot sizes as equal within tolerance (absolute + relative). */
const plotDimsMatch = (reqL, reqW, mapL, mapW) => {
  const a = parseFloat(mapL)
  const b = parseFloat(mapW)
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return false
  const rl = parseFloat(reqL)
  const rw = parseFloat(reqW)
  if (!Number.isFinite(rl) || !Number.isFinite(rw) || rl <= 0 || rw <= 0) return false
  const EPS = 0.05
  const close = (x, y) =>
    Math.abs(x - y) <= EPS ||
    Math.abs(x - y) / Math.max(Math.abs(x), Math.abs(y), 1e-6) <= 0.002
  return (close(a, rl) && close(b, rw)) || (close(a, rw) && close(b, rl))
}

const marlaMatches = (mapMarla, reqMarla) => {
  const m = parseFloat(mapMarla)
  const r = parseFloat(reqMarla)
  if (!Number.isFinite(m) || !Number.isFinite(r) || r <= 0) return false
  return Math.abs(m - r) < 0.01
}

// Generate 2D map — filter by floor count; prefer plot length×width match, else marla
const generate2DMap = async (req, res, next) => {
  try {
    const { length, width, marla, numFloors } = req.body;

    console.log('[generate2DMap] Request received:', { length, width, marla, numFloors });

    const reqFloors = parseInt(numFloors, 10)
    const reqLen = parseFloat(length)
    const reqWid = parseFloat(width)
    const reqMarla = parseFloat(marla)

    if (!reqFloors || reqFloors < 1 || reqFloors > 20) {
      return res.status(400).json({
        success: false,
        message: 'Number of floors is required (1–20).'
      })
    }
    if (!Number.isFinite(reqLen) || !Number.isFinite(reqWid) || reqLen <= 0 || reqWid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Plot length and width (feet) are required and must be greater than zero.'
      })
    }
    if (!Number.isFinite(reqMarla) || reqMarla <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Marla is required and must be greater than zero.'
      })
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [allMaps] = await connection.query('SELECT * FROM maps ORDER BY created_at DESC');
    const withFloors = await attachFloors(connection, allMaps, req);
    connection.release();

    if (withFloors.length === 0) {
      return res.json({ success: false, message: 'No maps have been added yet. Ask the admin to upload maps.' });
    }

    const sameFloorCount = (m) => {
      const n = Array.isArray(m.floors) ? m.floors.length : 1
      return n === reqFloors
    }

    const candidates = withFloors.filter(sameFloorCount)

    if (candidates.length === 0) {
      return res.json({
        success: false,
        message: `No floor plans found with exactly ${reqFloors} floor(s). Try another floor count or ask the admin to add a matching map.`
      })
    }

    const byDims = candidates.filter((m) =>
      plotDimsMatch(reqLen, reqWid, m.plot_length, m.plot_width)
    )

    let matched = byDims
    let matchReason = 'dimensions'

    if (byDims.length === 0) {
      const byMarla = candidates.filter((m) => marlaMatches(m.marla, reqMarla))
      matched = byMarla
      matchReason = 'marla'
    }

    if (matched.length === 0) {
      return res.json({
        success: false,
        message:
          'No floor plans match your plot size (length × width) or marla for the selected number of floors. Try different dimensions or marla, or ask the admin to upload plans with matching specifications.'
      })
    }

    const maps = matched.map((m) => ({
      id: m.id,
      title: m.title,
      file_path: m.file_path,
      floors: m.floors,
      filename: path.basename(m.file_path || ''),
      description: m.description,
      room_type: m.room_type,
      plot_length: m.plot_length,
      plot_width: m.plot_width,
      marla: m.marla,
      bedrooms: m.bedrooms,
      bathrooms: m.bathrooms,
      kitchen: m.kitchen,
      drawing_room: m.drawing_room,
      dining_room: m.dining_room,
      store_room: m.store_room,
      garage: m.garage,
      servant_quarter: m.servant_quarter,
      tv_lounge: m.tv_lounge,
      matchReason
    }));

    res.json({ success: true, maps, matchReason });
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

// ──────────────────────────────────────────────
// Admin Map CRUD
// ──────────────────────────────────────────────

/** Normalize Multer output: .array() gives []; .fields() gives { dxfFiles: [], dxfFile: [] } */
const collectDxfUploads = (req) => {
  if (req.file) return [req.file];
  const f = req.files;
  if (!f) return [];
  if (Array.isArray(f)) return f;
  const out = [];
  if (f.dxfFiles) {
    const arr = Array.isArray(f.dxfFiles) ? f.dxfFiles : [f.dxfFiles];
    out.push(...arr);
  }
  if (f.dxfFile) {
    const arr = Array.isArray(f.dxfFile) ? f.dxfFile : [f.dxfFile];
    out.push(...arr);
  }
  return out;
};

const adminAddMap = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const {
      title, description, room_type,
      bedrooms, bathrooms, kitchen, drawing_room,
      dining_room, store_room, garage, servant_quarter, tv_lounge,
      plot_length, plot_width, marla, floor_names
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const files = collectDxfUploads(req);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one DXF file is required' });
    }

    let floorNames;
    try {
      floorNames = floor_names ? JSON.parse(floor_names) : null;
    } catch { floorNames = null; }
    if (!floorNames || !Array.isArray(floorNames)) {
      const defaultNames = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor', '8th Floor', '9th Floor'];
      floorNames = files.map((_, i) => defaultNames[i] || `Floor ${i}`);
    }

    const filePath = files[0].filename;

    // Optional supporting drawings (stored as filenames, like the floor DXFs)
    const elevationFile = req.files?.elevationFile?.[0]?.filename || null;
    const workingDrawingFile = req.files?.workingDrawingFile?.[0]?.filename || null;
    const electricFile = req.files?.electricFile?.[0]?.filename || null;
    const sanitaryFile = req.files?.sanitaryFile?.[0]?.filename || null;

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [result] = await connection.query(
      `INSERT INTO maps
        (title, description, room_type, file_path,
         bedrooms, bathrooms, kitchen, drawing_room,
         dining_room, store_room, garage, servant_quarter, tv_lounge,
         plot_length, plot_width, marla, elevation_file, working_drawing_file, electric_file, sanitary_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        plot_width ? parseFloat(plot_width) : null,
        marla != null && marla !== '' ? parseFloat(marla) : null,
        elevationFile,
        workingDrawingFile,
        electricFile,
        sanitaryFile
      ]
    );

    const mapId = result.insertId;
    for (let i = 0; i < files.length; i++) {
      await connection.query(
        `INSERT INTO map_floors (map_id, floor_number, floor_name, file_path) VALUES (?, ?, ?, ?)`,
        [mapId, i, floorNames[i] || `Floor ${i}`, files[i].filename]
      );
    }

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Map added successfully',
      map: { id: mapId, title, file_path: filePath, floor_count: files.length }
    });
  } catch (error) {
    next(error);
  }
};

const attachFloors = async (connection, maps, req) => {
  if (!maps.length) return maps;
  const mapIds = maps.map(m => m.id);
  const [floors] = await connection.query(
    `SELECT * FROM map_floors WHERE map_id IN (${mapIds.map(() => '?').join(',')}) ORDER BY floor_number ASC`,
    mapIds
  );
  const floorsByMap = {};
  for (const f of floors) {
    if (!floorsByMap[f.map_id]) floorsByMap[f.map_id] = [];
    floorsByMap[f.map_id].push({
      floor_number: f.floor_number,
      floor_name: f.floor_name,
      file_path: getFullUrl(f.file_path, req)
    });
  }
  return maps.map(map => {
    const mapFloors = floorsByMap[map.id];
    const drawingUrls = {
      elevation_file: map.elevation_file ? getFullUrl(map.elevation_file, req) : null,
      working_drawing_file: map.working_drawing_file ? getFullUrl(map.working_drawing_file, req) : null,
      electric_file: map.electric_file ? getFullUrl(map.electric_file, req) : null,
      sanitary_file: map.sanitary_file ? getFullUrl(map.sanitary_file, req) : null,
    };
    if (mapFloors && mapFloors.length) {
      return { ...map, ...drawingUrls, file_path: getFullUrl(map.file_path, req), floors: mapFloors };
    }
    return {
      ...map,
      ...drawingUrls,
      file_path: getFullUrl(map.file_path, req),
      floors: [{ floor_number: 0, floor_name: 'Ground Floor', file_path: getFullUrl(map.file_path, req) }]
    };
  });
};

const adminGetAllMaps = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const connection = await pool.getConnection();
    await ensureMapsTable(connection);

    const [maps] = await connection.query('SELECT * FROM maps ORDER BY created_at DESC');
    const mapsWithFloors = await attachFloors(connection, maps, req);
    connection.release();

    res.json({ success: true, maps: mapsWithFloors });
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
      plot_length, plot_width, marla
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
        plot_length = ?, plot_width = ?, marla = ?
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
        marla != null && marla !== '' ? parseFloat(marla) : null,
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

    const drawingsDir = path.join(__dirname, '..', '..', 'drawings');

    // Delete all floor DXF files
    const [floors] = await connection.query('SELECT file_path FROM map_floors WHERE map_id = ?', [id]);
    const filesToDelete = new Set();
    filesToDelete.add(path.basename(existing[0].file_path));
    for (const f of floors) filesToDelete.add(path.basename(f.file_path));
    for (const fname of filesToDelete) {
      const fp = path.join(drawingsDir, fname);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    await connection.query('DELETE FROM maps WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'Map deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get a single map by ID (for working drawings page)
const getMapInfo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid map id' });
    }
    const connection = await pool.getConnection();
    await ensureMapsTable(connection);
    const [maps] = await connection.query('SELECT * FROM maps WHERE id = ?', [id]);
    if (!maps.length) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Map not found' });
    }
    const withUrls = await attachFloors(connection, maps, req);
    connection.release();
    res.json({ success: true, map: withUrls[0] });
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
  getMapInfo,
  adminAddMap,
  adminGetAllMaps,
  adminUpdateMap,
  adminDeleteMap
};
