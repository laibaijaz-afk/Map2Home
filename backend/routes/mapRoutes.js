const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createMap,
  getAllMaps,
  getMapsByRoomType,
  getMapsBySpecifications,
  generateMap,
  generate2DMap,
  getUserMaps,
  getMapDetails,
  getMapInfo
} = require('../controllers/mapController');

const router = express.Router();

// Public routes - get maps
router.get('/', getAllMaps);
router.get('/room-type/:room_type', getMapsByRoomType);
router.post('/by-specifications', getMapsBySpecifications);

// Public route for 2D map generation (temporarily public for testing)
router.post('/generate-2d', generate2DMap);

// Public route - get single map info with drawing file URLs (used by WorkingDrawings page)
router.get('/info/:id', getMapInfo);

// Public route for DXF files — supports encoded filenames (e.g. %23 for #)
router.get('/dxf/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const drawingsDir = path.join(__dirname, '..', '..', 'drawings');
  const filename = req.params.filename;

  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  // Try exact filename first (Express already decodes %23 → #)
  const drawingsPath = path.join(drawingsDir, filename);
  if (fs.existsSync(drawingsPath)) {
    return res.sendFile(drawingsPath);
  }

  // Fallback: partial match — find a file on disk that ends with the same base name
  // (handles cases where the timestamp prefix in DB differs from disk)
  try {
    const baseName = filename.replace(/^\d+-/, '');
    if (baseName) {
      const files = fs.readdirSync(drawingsDir);
      const match = files.find(f => f.endsWith(baseName) || f.endsWith(baseName.replace(/[^a-zA-Z0-9._-]/g, '_')));
      if (match) {
        return res.sendFile(path.join(drawingsDir, match));
      }
    }
  } catch (e) { /* ignore */ }

  console.warn('[mapRoutes] DXF not found:', filename);
  res.status(404).json({ success: false, message: 'DXF file not found' });
});

// Protected routes - require authentication
router.use(authenticateToken);

// Create map (admin functionality)
router.post('/', createMap);

// Map generation routes
router.post('/generate', generateMap);
router.get('/my-maps', getUserMaps);
router.get('/:mapId', getMapDetails);

module.exports = router;

