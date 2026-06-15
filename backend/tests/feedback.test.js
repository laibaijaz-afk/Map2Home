// ── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({ getConnection: jest.fn() }));
jest.mock('../services/scrapingCron',    () => ({ startCronJob: jest.fn(), runScrapingNow: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/costzoneScraper', () => ({ scrapeAndUpdatePrices: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn(), sendWelcomeEmail: jest.fn(), sendResetPasswordEmail: jest.fn(),
}));

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV   = 'test';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/database');
const app     = require('./testApp');

const SECRET    = 'test-jwt-secret';
const makeToken = (id = 1) => jwt.sign({ id }, SECRET, { expiresIn: '1h' });
const baseUser  = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', is_verified: true };

const makeConn = (...results) => {
  let i = 0;
  return {
    query:   jest.fn().mockImplementation(() => Promise.resolve(results[i++] ?? [[], null])),
    release: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit:           jest.fn().mockResolvedValue(undefined),
    rollback:         jest.fn().mockResolvedValue(undefined),
  };
};

beforeEach(() => jest.clearAllMocks());

// ── GET /api/feedback/all (public) ───────────────────────────────────────────
describe('GET /api/feedback/all', () => {
  test('200 – returns feedback list without authentication', async () => {
    const fbRow = { id: 1, rating: 5, comment: 'Great app!', created_at: new Date(), name: 'Alice', email: 'alice@example.com' };
    pool.getConnection.mockResolvedValue(makeConn([[fbRow], null]));

    const res = await request(app).get('/api/feedback/all');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.feedback).toBeInstanceOf(Array);
  });

  test('200 – feedback item contains id, name, rating, comment, created_at', async () => {
    const fbRow = { id: 1, rating: 4, comment: 'Nice work!', created_at: new Date(), name: 'Bob', email: 'bob@example.com' };
    pool.getConnection.mockResolvedValue(makeConn([[fbRow], null]));

    const res = await request(app).get('/api/feedback/all');
    const fb = res.body.feedback[0];
    expect(fb).toHaveProperty('id');
    expect(fb).toHaveProperty('name');
    expect(fb).toHaveProperty('rating');
    expect(fb).toHaveProperty('comment');
    expect(fb).toHaveProperty('created_at');
  });

  test('200 – feedback item does NOT expose email', async () => {
    const fbRow = { id: 1, rating: 5, comment: 'Super!', created_at: new Date(), name: 'Carol', email: 'carol@example.com' };
    pool.getConnection.mockResolvedValue(makeConn([[fbRow], null]));

    const res = await request(app).get('/api/feedback/all');
    expect(res.body.feedback[0]).not.toHaveProperty('email');
  });

  test('200 – count field equals length of feedback array', async () => {
    const rows = [
      { id: 1, rating: 5, comment: 'Excellent!', created_at: new Date(), name: 'A', email: 'a@e.com' },
      { id: 2, rating: 3, comment: 'Pretty good!', created_at: new Date(), name: 'B', email: 'b@e.com' },
    ];
    pool.getConnection.mockResolvedValue(makeConn([rows, null]));

    const res = await request(app).get('/api/feedback/all');
    expect(res.body.count).toBe(res.body.feedback.length);
  });

  test('200 – returns empty array when no feedback exists', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[], null]));

    const res = await request(app).get('/api/feedback/all');
    expect(res.status).toBe(200);
    expect(res.body.feedback).toHaveLength(0);
    expect(res.body.count).toBe(0);
  });
});

// ── GET /api/feedback/stats (public) ────────────────────────────────────────
describe('GET /api/feedback/stats', () => {
  const statsRow = { total_feedback: 10, average_rating: '4.2', five_star: 4, four_star: 3, three_star: 2, two_star: 1, one_star: 0 };

  test('200 – returns stats without authentication', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[statsRow], null]));

    const res = await request(app).get('/api/feedback/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('stats');
  });

  test('200 – stats has total, average, distribution fields', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[statsRow], null]));

    const res = await request(app).get('/api/feedback/stats');
    expect(res.body.stats).toHaveProperty('total');
    expect(res.body.stats).toHaveProperty('average');
    expect(res.body.stats).toHaveProperty('distribution');
  });

  test('200 – distribution contains ratings 1-5 as keys', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[statsRow], null]));

    const res = await request(app).get('/api/feedback/stats');
    const dist = res.body.stats.distribution;
    expect(dist).toHaveProperty('5');
    expect(dist).toHaveProperty('4');
    expect(dist).toHaveProperty('1');
  });

  test('200 – average is returned as a string with 1 decimal', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[statsRow], null]));

    const res = await request(app).get('/api/feedback/stats');
    const avg = res.body.stats.average;
    expect(typeof avg).toBe('string');
    expect(avg).toMatch(/^\d+\.\d$/); // e.g. "4.2"
  });
});

// ── POST /api/feedback/add (protected) ──────────────────────────────────────
describe('POST /api/feedback/add', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/feedback/add').send({ rating: 5, comment: 'Great app indeed!' });
    expect(res.status).toBe(401);
  });

  test('400 – missing rating', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ comment: 'Great app!' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Rating and comment are required' });
  });

  test('400 – missing comment', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 5 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Rating and comment are required' });
  });

  test('400 – rating of 0 is rejected (falsy check fires first)', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 0, comment: 'Not great at all.' });

    // Controller checks !rating before range — parseInt(0)=0 is falsy
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Rating and comment are required' });
  });

  test('400 – rating of 6 is rejected', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 6, comment: 'Out of range!' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Rating must be between 1 and 5' });
  });

  test('400 – comment shorter than 10 chars', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 4, comment: 'Short' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Comment must be at least 10 characters long' });
  });

  test('400 – comment longer than 1000 chars', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 3, comment: 'x'.repeat(1001) });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Comment cannot exceed 1000 characters' });
  });

  test('201 – creates new feedback when user has none', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],           // auth
      [[], null],                    // SELECT existing feedback → none
      [{ insertId: 9 }, null],       // INSERT feedback
    ));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 5, comment: 'Really great application to use!' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: 'Feedback submitted successfully' });
    expect(res.body).toHaveProperty('feedbackId');
  });

  test('200 – updates existing feedback when user already submitted', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],             // auth
      [[{ id: 3 }], null],            // SELECT existing feedback → found
      [{ affectedRows: 1 }, null],    // UPDATE feedback
    ));

    const res = await request(app)
      .post('/api/feedback/add')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ rating: 4, comment: 'Updated my feedback now.' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Feedback updated successfully' });
  });
});

// ── GET /api/feedback/my-feedback (protected) ───────────────────────────────
describe('GET /api/feedback/my-feedback', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/feedback/my-feedback');
    expect(res.status).toBe(401);
  });

  test('200 – returns null feedback when none submitted', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      [[], null],
    ));

    const res = await request(app)
      .get('/api/feedback/my-feedback')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      feedback: null,
      message: 'No feedback submitted yet',
    });
  });

  test('200 – returns user feedback object when submitted', async () => {
    const fb = { id: 1, rating: 5, comment: 'Excellent product!', created_at: new Date(), updated_at: new Date() };
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      [[fb], null],
    ));

    const res = await request(app)
      .get('/api/feedback/my-feedback')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.feedback).toMatchObject({ id: 1, rating: 5 });
  });
});
