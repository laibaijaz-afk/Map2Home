const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createMap,
  getAllMaps,
  getMapsByRoomType,
  getMapsBySpecifications,
  generateMap,
  getUserMaps,
  getMapDetails
} = require('../controllers/mapController');

const router = express.Router();

// Public routes - get maps
router.get('/', getAllMaps);
router.get('/room-type/:room_type', getMapsByRoomType);
router.post('/by-specifications', getMapsBySpecifications);

// Protected routes - require authentication
router.use(authenticateToken);

// Create map (admin functionality)
router.post('/', createMap);

// Map generation routes
router.post('/generate', generateMap);
router.get('/my-maps', getUserMaps);
router.get('/:mapId', getMapDetails);

module.exports = router;

