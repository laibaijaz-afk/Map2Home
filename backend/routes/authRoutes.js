const express = require('express');

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
} = require('../controllers/authController');

const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
// GET verification link (clickable link from email with query parameter)
router.get('/verify-email', verifyEmail);
// Legacy support for URL param format (if needed)
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;