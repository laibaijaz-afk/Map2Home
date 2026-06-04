const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  getDefaultData,
  saveCostEstimate,
  calculateCostEstimate,
  getUserEstimates
} = require('../controllers/costController');

const router = express.Router();

// Get default data (public)
router.get('/default-data', getDefaultData);

// All other cost routes require authentication
router.use(authenticateToken);

// Calculate cost estimate
router.post('/calculate', calculateCostEstimate);

// Save cost estimate
router.post('/save', saveCostEstimate);

// Get user's estimates
router.get('/my-estimates', getUserEstimates);

module.exports = router;
