const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/user/profile — get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, role, is_verified, google_account, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: { ...users[0], role: users[0].role || 'user' } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/profile — update name
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), req.userId]
    );
    const [users] = await connection.query(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    connection.release();

    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
