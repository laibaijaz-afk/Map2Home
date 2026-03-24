/**
 * JSON Map Routes
 * 
 * API endpoints for managing JSON-based editable maps.
 * 
 * @module routes/jsonMapRoutes
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  getUserMaps,
  getMapById,
  createMap,
  updateMap,
  deleteMap,
  getTemplates,
  cloneMap,
  getSampleMap
} = require('../controllers/jsonMapController');

const router = express.Router();

// Public routes
router.get('/sample', getSampleMap);           // Get sample map JSON
router.get('/templates', getTemplates);        // Get public template maps

// Protected routes - require authentication
router.use(authenticateToken);

router.get('/', getUserMaps);                  // Get user's maps
router.get('/:mapId', getMapById);            // Get specific map
router.post('/', createMap);                   // Create new map
router.put('/:mapId', updateMap);             // Update map
router.delete('/:mapId', deleteMap);          // Delete map
router.post('/clone/:mapId', cloneMap);       // Clone a map

module.exports = router;
