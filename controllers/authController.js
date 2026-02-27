const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
const pool = require('../config/database');
const { generateToken, generateRandomToken, hashToken } = require('../utils/tokenUtils');
const { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail } = require('../services/emailService');
const { validatePassword } = require('../utils/passwordValidator');
const { validateEmailExists } = require('../services/emailValidator');

// Register
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const register = async (req, res, next) => {
  try {
    const { username, name, email, password, confirmPassword } = req.body;
    console.log('[authController.register] payload received:', { username: !!username, name, email, passwordPresent: !!password, confirmPasswordPresent: !!confirmPassword });

    // Enforce required fields: username, name, email, password (confirmPassword is optional)
    const required = ['username', 'name', 'email', 'password'];
    const receivedKeys = Object.keys(req.body || {});
    const missing = required.filter(k => !receivedKeys.includes(k));
    
    if (missing.length > 0) {
      console.log('[authController.register] validation failed: missing required fields =', missing);
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate username
    const usernameStr = String(username || '').trim();
    if (!usernameStr) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (usernameStr.length < 4) {
      return res.status(400).json({ error: 'Username must be at least 4 characters long' });
    }
    if (/\s/.test(usernameStr)) {
      return res.status(400).json({ error: 'Username cannot contain spaces' });
    }
    if (!USERNAME_REGEX.test(usernameStr)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscore (_)' });
    }

    // If confirmPassword not provided, treat it as equal to password
    const confirmPwd = confirmPassword || password;
    console.log('[authController.register] confirmPassword provided:', !!confirmPassword);

    // Confirm passwords match
    if (password !== confirmPwd) {
      console.log('[authController.register] validation failed: passwords do not match');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (!validator.isEmail(email)) {
      console.log('[authController.register] validation failed: invalid email format', email);
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate email actually exists (MX record check)
    console.log('[authController.register] validating email existence for:', email);
    const emailValidation = await validateEmailExists(email);
    if (!emailValidation.isValid) {
      console.log('[authController.register] email validation failed:', emailValidation.message, emailValidation.details);
      return res.status(400).json({ error: emailValidation.message });
    }
    console.log('[authController.register] email existence validated successfully');

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('[authController.register] validation failed: password strength requirements not met', passwordValidation.errors);
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        errors: passwordValidation.errors 
      });
    }
    console.log('[authController.register] all validations passed for email:', email);

    const connection = await pool.getConnection();

    // Check if email or username already exists
    const [existingByEmail] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingByEmail.length > 0) {
      connection.release();
      console.log('[authController.register] user already exists for email:', email);
      return res.status(400).json({ 
        error: 'Email already registered',
        message: 'This email is already registered. Please login or use a different email.'
      });
    }

    const [existingByUsername] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [usernameStr]
    );
    if (existingByUsername.length > 0) {
      connection.release();
      console.log('[authController.register] username already taken:', usernameStr);
      return res.status(400).json({ 
        error: 'Username taken',
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Hash password with bcrypt (10 rounds)
    console.log('[authController.register] hashing password with bcrypt...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[authController.register] password hashed successfully');

    // Create user in MySQL (store hashed password in password_hash column)
    console.log('[authController.register] inserting user into database...');
    const [result] = await connection.query(
      'INSERT INTO users (username, name, email, password_hash, is_verified, google_account, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [usernameStr, name, email, hashedPassword, false, false]
    );

    const userId = result.insertId;
    console.log('[authController.register] user created successfully with id:', userId);

    // Generate unique verification token and store hashed version in email_tokens table
    console.log('[authController.register] generating verification token...');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    try {
      await connection.query(
        'INSERT INTO email_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, hashedToken, expiresAt]
      );
      console.log('[authController.register] verification token generated and stored in email_tokens for userId:', userId);
      console.log('[authController.register] token expires at:', expiresAt);
    } catch (storeErr) {
      console.error('[authController.register] failed to store verification token:', storeErr.message);
      connection.release();
      return res.status(500).json({ error: 'Failed to create verification token' });
    }

    connection.release();

    // Log raw token for testing/dev (do not log in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[authController.register] verification token (raw, dev only):', verificationToken);
    }

    // Send verification email with token link
    try {
      console.log('[authController.register] sending verification email to:', email);
      await sendVerificationEmail({ id: userId, name, email }, verificationToken);
      console.log('[authController.register] verification email sent successfully to:', email);
    } catch (sendErr) {
      console.error('[authController.register] error sending verification email:', sendErr.message);
      // Don't fail registration if email send fails; user can resend later
    }

    console.log('[authController.register] registration completed successfully for:', email);

    res.status(201).json({
      message: 'User registered successfully. Check your email to verify your account.',
      user: {
        id: userId,
        name,
        email,
        is_verified: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email
const verifyEmail = async (req, res, next) => {
  try {
    // Accept token from query parameter (primary), URL param, or body
    const token = req.query.token || (req.params && req.params.token) || (req.body && req.body.token);

    console.log('[authController.verifyEmail] token received:', token ? 'YES' : 'NO');

    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token is required' 
      });
    }

    const connection = await pool.getConnection();

    const hashedToken = hashToken(token);

    // Find token in email_tokens table
    const [tokens] = await connection.query(
      'SELECT * FROM email_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (tokens.length === 0) {
      connection.release();
      console.log('[authController.verifyEmail] invalid or expired token');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification token' 
      });
    }

    const emailToken = tokens[0];

    // Update user as verified
    await connection.query(
      'UPDATE users SET is_verified = true WHERE id = ?',
      [emailToken.user_id]
    );

    // Delete used token
    await connection.query(
      'DELETE FROM email_tokens WHERE id = ?',
      [emailToken.id]
    );

    // Get user for logging / welcome email
    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [emailToken.user_id]
    );

    connection.release();

    const user = users[0];

    console.log('[authController.verifyEmail] user verified:', user.email);

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail({ id: user.id, name: user.name, email: user.email });
      console.log('[authController.verifyEmail] welcome email sent to', user.email);
    } catch (welErr) {
      console.error('[authController.verifyEmail] sendWelcomeEmail error:', welErr.message);
    }

    console.log('[authController.verifyEmail] verification successful for:', user.email);
    
    // Return JSON response for frontend to handle
    return res.status(200).json({ 
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    // Find user
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if email is verified (skip in development mode for easier testing)
    if (!user.is_verified && process.env.NODE_ENV === 'production') {
      connection.release();
      return res.status(403).json({ message: 'Please verify your email first' });
    }
    
    // In development, log a warning but allow login
    if (!user.is_verified && process.env.NODE_ENV !== 'production') {
      console.warn(`[authController.login] User ${user.email} is not verified, but allowing login in development mode`);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    connection.release();

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const connection = await pool.getConnection();

    // Find user
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      // Don't reveal if email exists (security)
      return res.json({
        message: 'If this email exists, you will receive a password reset link'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = generateRandomToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await connection.query(
      'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    connection.release();

    // Send reset email
    await sendResetPasswordEmail(user.email, resetToken, user.name);

    res.json({
      message: 'If this email exists, you will receive a password reset link'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors 
      });
    }

    const connection = await pool.getConnection();

    const hashedToken = hashToken(token);

    // Find token
    const [tokens] = await connection.query(
      'SELECT * FROM reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (tokens.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Delete used token
    await connection.query(
      'DELETE FROM reset_tokens WHERE id = ?',
      [resetToken.id]
    );

    connection.release();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User
const getCurrentUser = async (req, res, next) => {
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

    res.json({
      user: {
        ...users[0],
        role: users[0].role || 'user'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
};
