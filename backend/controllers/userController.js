const pool = require('../config/database');

// Get user info
const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, role, created_at, is_verified FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserInfo
};
