const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to authenticate JWT tokens provided in the Authorization header.
 * Expects header: Authorization: Bearer <token>
 * Sets: req.userId and req.user (with role information)
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to get current role and details
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = ?',
      [decoded.id]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user data to request for downstream handlers
    req.userId = decoded.id;
    req.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role || 'user',
      is_verified: users[0].is_verified
    };

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
}

module.exports = { authenticateToken };