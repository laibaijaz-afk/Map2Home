const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  updateCosts,
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getMaterials,
  updateMaterialCost
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Update cost configuration
router.post('/update-costs', updateCosts);

// Get system statistics
router.get('/stats', getSystemStats);

// Get all users
router.get('/users', getAllUsers);

// Update user role
router.post('/users/:userId/role', updateUserRole);

// Get all materials
router.get('/materials', getMaterials);

// Update material cost
router.put('/materials/cost', updateMaterialCost);

module.exports = router;
