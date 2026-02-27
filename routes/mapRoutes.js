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
  getMapDetails
} = require('../controllers/mapController');

const router = express.Router();

// Public routes - get maps
router.get('/', getAllMaps);
router.get('/room-type/:room_type', getMapsByRoomType);
router.post('/by-specifications', getMapsBySpecifications);

// Public route for 2D map generation (temporarily public for testing)
router.post('/generate-2d', generate2DMap);

// Public route for DXF files
router.get('/dxf/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filename = req.params.filename;
  const drawingsPath = path.join(__dirname, '..', '..', 'drawings', filename);
  
  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }
  
  if (fs.existsSync(drawingsPath)) {
    res.sendFile(drawingsPath);
  } else {
    res.status(404).json({ success: false, message: 'DXF file not found' });
  }
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

