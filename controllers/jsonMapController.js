/**
 * JSON Map Controller
 * 
 * Handles CRUD operations for JSON-based editable maps.
 * Maps are stored in the database as JSON data associated with users.
 * 
 * @module controllers/jsonMapController
 */

const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Ensure the json_maps table exists
 */
const ensureJsonMapsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS json_maps (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      map_data JSON NOT NULL,
      is_template BOOLEAN DEFAULT FALSE,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_is_template (is_template),
      INDEX idx_is_public (is_public)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

/**
 * Get all JSON maps for a user
 * GET /api/json-maps
 */
const getUserMaps = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    await ensureJsonMapsTable(connection);
    
    const [maps] = await connection.query(
      `SELECT id, name, description, is_template, is_public, created_at, updated_at,
              JSON_EXTRACT(map_data, '$.metadata.bounds') as bounds,
              JSON_LENGTH(JSON_EXTRACT(map_data, '$.entities')) as entity_count
       FROM json_maps 
       WHERE user_id = ? OR is_public = TRUE
       ORDER BY updated_at DESC`,
      [userId]
    );
    
    connection.release();
    
    res.json({
      success: true,
      maps: maps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific JSON map by ID
 * GET /api/json-maps/:mapId
 */
const getMapById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mapId } = req.params;
    
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    const [maps] = await connection.query(
      `SELECT * FROM json_maps 
       WHERE id = ? AND (user_id = ? OR is_public = TRUE)`,
      [mapId, userId]
    );
    
    connection.release();
    
    if (maps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }
    
    // Parse JSON data
    const map = maps[0];
    if (typeof map.map_data === 'string') {
      map.map_data = JSON.parse(map.map_data);
    }
    
    res.json({
      success: true,
      map: map
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new JSON map
 * POST /api/json-maps
 */
const createMap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, map_data, is_template, is_public } = req.body;
    
    // Validation
    if (!name || !map_data) {
      return res.status(400).json({
        success: false,
        message: 'Name and map_data are required'
      });
    }
    
    // Validate map_data structure
    if (!map_data.metadata || !map_data.entities) {
      return res.status(400).json({
        success: false,
        message: 'Invalid map_data structure. Must contain metadata and entities.'
      });
    }
    
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    // Set metadata timestamps
    map_data.metadata.createdAt = new Date().toISOString();
    map_data.metadata.updatedAt = new Date().toISOString();
    
    const [result] = await connection.query(
      `INSERT INTO json_maps (user_id, name, description, map_data, is_template, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description || null,
        JSON.stringify(map_data),
        is_template || false,
        is_public || false
      ]
    );
    
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Map created successfully',
      mapId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing JSON map
 * PUT /api/json-maps/:mapId
 */
const updateMap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mapId } = req.params;
    const { name, description, map_data, is_public } = req.body;
    
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    // Check ownership
    const [existing] = await connection.query(
      'SELECT id, user_id FROM json_maps WHERE id = ?',
      [mapId]
    );
    
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }
    
    if (existing[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this map'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (map_data !== undefined) {
      // Update timestamp in metadata
      map_data.metadata.updatedAt = new Date().toISOString();
      updates.push('map_data = ?');
      values.push(JSON.stringify(map_data));
    }
    
    if (is_public !== undefined) {
      updates.push('is_public = ?');
      values.push(is_public);
    }
    
    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(mapId);
    
    await connection.query(
      `UPDATE json_maps SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Map updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a JSON map
 * DELETE /api/json-maps/:mapId
 */
const deleteMap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mapId } = req.params;
    
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    // Check ownership
    const [existing] = await connection.query(
      'SELECT id, user_id FROM json_maps WHERE id = ?',
      [mapId]
    );
    
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }
    
    if (existing[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this map'
      });
    }
    
    await connection.query('DELETE FROM json_maps WHERE id = ?', [mapId]);
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Map deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public template maps
 * GET /api/json-maps/templates
 */
const getTemplates = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    const [templates] = await connection.query(
      `SELECT id, name, description, created_at,
              JSON_EXTRACT(map_data, '$.metadata.bounds') as bounds,
              JSON_LENGTH(JSON_EXTRACT(map_data, '$.entities')) as entity_count
       FROM json_maps 
       WHERE is_template = TRUE AND is_public = TRUE
       ORDER BY name ASC`
    );
    
    connection.release();
    
    res.json({
      success: true,
      templates: templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clone a template map for the current user
 * POST /api/json-maps/clone/:mapId
 */
const cloneMap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mapId } = req.params;
    const { name } = req.body;
    
    const connection = await pool.getConnection();
    await ensureJsonMapsTable(connection);
    
    // Get the original map
    const [original] = await connection.query(
      'SELECT * FROM json_maps WHERE id = ? AND (user_id = ? OR is_public = TRUE)',
      [mapId, userId]
    );
    
    if (original.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }
    
    const sourceMap = original[0];
    let mapData = typeof sourceMap.map_data === 'string' 
      ? JSON.parse(sourceMap.map_data) 
      : sourceMap.map_data;
    
    // Update metadata for the clone
    mapData.metadata.name = name || `Copy of ${sourceMap.name}`;
    mapData.metadata.createdAt = new Date().toISOString();
    mapData.metadata.updatedAt = new Date().toISOString();
    
    // Create the clone
    const [result] = await connection.query(
      `INSERT INTO json_maps (user_id, name, description, map_data, is_template, is_public)
       VALUES (?, ?, ?, ?, FALSE, FALSE)`,
      [
        userId,
        name || `Copy of ${sourceMap.name}`,
        sourceMap.description,
        JSON.stringify(mapData)
      ]
    );
    
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Map cloned successfully',
      mapId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sample JSON map (static file)
 * GET /api/json-maps/sample
 */
const getSampleMap = async (req, res, next) => {
  try {
    const samplePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'maps', 'sample-house.json');
    
    try {
      const data = await fs.readFile(samplePath, 'utf8');
      const mapData = JSON.parse(data);
      
      res.json({
        success: true,
        map: {
          id: 'sample',
          name: mapData.metadata?.name || 'Sample House',
          description: 'A sample floor plan for testing the JSON map editor',
          map_data: mapData,
          is_template: true,
          is_public: true
        }
      });
    } catch (fileError) {
      // If file doesn't exist, return a basic template
      res.json({
        success: true,
        map: {
          id: 'sample',
          name: 'Basic Template',
          description: 'A basic empty floor plan template',
          map_data: {
            metadata: {
              name: 'Basic Template',
              version: '1.0',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              units: 'feet',
              bounds: { minX: 0, minY: 0, maxX: 50, maxY: 40 }
            },
            layers: [
              { id: 'walls', name: 'Walls', visible: true, locked: false, color: '#1e293b', lineWidth: 4 },
              { id: 'doors', name: 'Doors', visible: true, locked: false, color: '#dc2626', lineWidth: 3 },
              { id: 'labels', name: 'Labels', visible: true, locked: false, color: '#7c3aed', lineWidth: 1 }
            ],
            entities: [
              { id: 'wall-1', type: 'line', layerId: 'walls', start: { x: 0, y: 0 }, end: { x: 50, y: 0 } },
              { id: 'wall-2', type: 'line', layerId: 'walls', start: { x: 50, y: 0 }, end: { x: 50, y: 40 } },
              { id: 'wall-3', type: 'line', layerId: 'walls', start: { x: 50, y: 40 }, end: { x: 0, y: 40 } },
              { id: 'wall-4', type: 'line', layerId: 'walls', start: { x: 0, y: 40 }, end: { x: 0, y: 0 } },
              { id: 'label-1', type: 'text', layerId: 'labels', position: { x: 25, y: 20 }, text: 'Floor Plan', fontSize: 2 }
            ]
          },
          is_template: true,
          is_public: true
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserMaps,
  getMapById,
  createMap,
  updateMap,
  deleteMap,
  getTemplates,
  cloneMap,
  getSampleMap
};
