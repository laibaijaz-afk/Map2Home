// ── Mocks (hoisted before any require) ──────────────────────────────────────
jest.mock('../config/database', () => ({ getConnection: jest.fn() }));
jest.mock('../services/emailService', () => ({
  sendVerificationEmail:  jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail:       jest.fn().mockResolvedValue(undefined),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../services/emailValidator', () => ({
  validateEmailExists: jest.fn().mockResolvedValue({ isValid: true }),
}));
jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('$2b$10$hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));
jest.mock('../services/scrapingCron',    () => ({ startCronJob: jest.fn(), runScrapingNow: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/costzoneScraper', () => ({ scrapeAndUpdatePrices: jest.fn().mockResolvedValue({ success: true }) }));

// ── Imports ──────────────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV   = 'test';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const pool    = require('../config/database');
const app     = require('./testApp');

// ── Helpers ──────────────────────────────────────────────────────────────────
const SECRET = 'test-jwt-secret';
const makeToken = (id = 1, role = 'user') => jwt.sign({ id }, SECRET, { expiresIn: '1h' });

const baseUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'user', is_verified: true, password_hash: '$2b$10$hashed', google_account: false, created_at: new Date() };

// Build a fresh mock connection whose query calls resolve values in order.
const makeConn = (...results) => {
  let i = 0;
  return {
    query:           jest.fn().mockImplementation(() => Promise.resolve(results[i++] ?? [[], null])),
    release:         jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit:          jest.fn().mockResolvedValue(undefined),
    rollback:        jest.fn().mockResolvedValue(undefined),
  };
};

beforeEach(() => jest.clearAllMocks());

// ── POST /api/auth/register ──────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('201 – registers a new user successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[], null],                          // no existing user
      [{ insertId: 5 }, null],             // INSERT user
      [{ insertId: 1 }, null],             // INSERT email_token
    ));

    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'alice@example.com', password: 'StrongP@ss1', confirmPassword: 'StrongP@ss1',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user).toMatchObject({ name: 'Alice', email: 'alice@example.com', is_verified: false });
  });

  test('400 – missing name field returns error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'a@b.com', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'All fields are required');
  });

  test('400 – missing email field returns error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'All fields are required');
  });

  test('400 – missing password field returns error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'b@b.com',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'All fields are required');
  });

  test('400 – passwords do not match', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'b@b.com', password: 'StrongP@ss1', confirmPassword: 'Different1@',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Passwords do not match');
  });

  test('400 – invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'not-an-email', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid email address');
  });

  test('400 – email existence validation fails', async () => {
    const { validateEmailExists } = require('../services/emailValidator');
    validateEmailExists.mockResolvedValueOnce({ isValid: false, message: 'Email does not exist' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'nobody@fakexyz999.com', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email does not exist');
  });

  test('400 – weak password returns error with errors array', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'bob@example.com', password: 'weak',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password does not meet requirements');
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  test('400 – email already registered', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[{ id: 1 }], null],  // existing user found
    ));

    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'existing@example.com', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('200 – successful login returns token and user', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: 'test@example.com', role: 'user' });
  });

  test('400 – missing email and password', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });

  test('400 – missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });

  test('401 – user not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[], null]));

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com', password: 'StrongP@ss1',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  test('401 – wrong password', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'WrongPass@1',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  test('403 – unverified user in production mode', async () => {
    process.env.NODE_ENV = 'production';
    pool.getConnection.mockResolvedValue(makeConn([[{ ...baseUser, is_verified: false }], null]));

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'StrongP@ss1',
    });
    process.env.NODE_ENV = 'test';
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Please verify your email first');
  });

  test('response token is a valid JWT', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'StrongP@ss1',
    });
    const decoded = jwt.verify(res.body.token, SECRET);
    expect(decoded.id).toBe(baseUser.id);
  });
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  const SAFE_MSG = 'If this email exists, you will receive a password reset link';

  test('200 – returns safe message even when email exists', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],        // user found
      [{ insertId: 1 }, null],   // INSERT reset token
    ));

    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', SAFE_MSG);
  });

  test('200 – returns same safe message when email does NOT exist', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[], null]));

    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', SAFE_MSG);
  });

  test('400 – missing email field', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email is required');
  });
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────
describe('POST /api/auth/reset-password', () => {
  test('200 – resets password with valid token', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[{ id: 1, user_id: 1 }], null],  // token found
      [{ affectedRows: 1 }, null],       // UPDATE password
      [{ affectedRows: 1 }, null],       // DELETE token
    ));

    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'validtoken', newPassword: 'NewStr0ng@Pass',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password reset successfully');
  });

  test('400 – missing token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ newPassword: 'NewStr0ng@Pass' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Token and new password are required');
  });

  test('400 – missing newPassword', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Token and new password are required');
  });

  test('400 – new password too weak', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'tok', newPassword: 'weak',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Password does not meet requirements');
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  test('400 – invalid or expired token', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[], null])); // no token found

    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'expired', newPassword: 'NewStr0ng@Pass',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid or expired reset token');
  });
});

// ── POST /api/auth/verify-email ──────────────────────────────────────────────
describe('POST /api/auth/verify-email', () => {
  test('400 – no token provided', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Verification token is required' });
  });

  test('400 – invalid or expired token', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[], null]));

    const res = await request(app).post('/api/auth/verify-email').send({ token: 'badtoken' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid or expired verification token' });
  });

  test('200 – valid token verifies email and returns user', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[{ id: 1, user_id: 1 }], null],                   // token found
      [{ affectedRows: 1 }, null],                         // UPDATE is_verified
      [{ affectedRows: 1 }, null],                         // DELETE token
      [[{ ...baseUser, is_verified: true }], null],        // SELECT user
    ));

    const res = await request(app).post('/api/auth/verify-email').send({ token: 'validtoken' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Email verified successfully!' });
    expect(res.body.user.is_verified).toBe(true);
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  test('401 – no authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  test('401 – malformed authorization header', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'InvalidFormat');
    expect(res.status).toBe(401);
  });

  test('200 – returns current user for valid token', async () => {
    // auth middleware query + getCurrentUser query
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],   // auth middleware
      [[baseUser], null],   // getCurrentUser
    ));

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'test@example.com' });
  });

  test('401 – token signed with wrong secret', async () => {
    const badToken = jwt.sign({ id: 1 }, 'wrong-secret', { expiresIn: '1h' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  test('404 – user no longer exists in database', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],  // auth middleware succeeds
      [[], null],           // getCurrentUser: user not found
    ));

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
