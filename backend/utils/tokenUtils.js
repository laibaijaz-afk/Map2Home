const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Generate JWT Token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRY) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate Random Token for Email Verification / Password Reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash Random Token (store hashed version in DB)
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomToken,
  hashToken
};
