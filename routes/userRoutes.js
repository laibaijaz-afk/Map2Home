const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getUserInfo } = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get user info
router.get('/info', getUserInfo);

module.exports = router;