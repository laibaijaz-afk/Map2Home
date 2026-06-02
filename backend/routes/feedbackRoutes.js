const express = require('express');
const {
  addFeedback,
  getAllFeedback,
  getFeedbackStats,
  getMyFeedback
} = require('../controllers/feedbackController');

const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/all', getAllFeedback);
router.get('/stats', getFeedbackStats);

// Protected routes (require authentication)
router.post('/add', authenticateToken, addFeedback);
router.get('/my-feedback', authenticateToken, getMyFeedback);

module.exports = router;
