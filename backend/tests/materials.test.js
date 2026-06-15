// ── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({ getConnection: jest.fn() }));
jest.mock('../services/scrapingCron',    () => ({ startCronJob: jest.fn(), runScrapingNow: jest.fn().mockResolvedValue({ success: true }), executeScraping: jest.fn().mockResolvedValue({ success: true }) }));
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

const baseUser = { id: 1, name: 'User', email: 'user@example.com', role: 'user', is_verified: true };

const sampleMaterials = [
  { id: 1, name: 'Cement', category: 'construction', cost_per_unit: 1390, unit: 'bag', description: 'Cement', updated_at: new Date(), source_url: null, last_scraped_at: null },
  { id: 2, name: 'Steel',  category: 'construction', cost_per_unit: 238000, unit: 'ton', description: 'Steel', updated_at: new Date(), source_url: null, last_scraped_at: null },
];

// For the /api/materials/prices route the inline handler calls several queries:
// CREATE TABLE IF NOT EXISTS, ALTER TABLE × 2, SELECT COLUMN_NAME, SELECT materials
const noop = [[], null];
const colInfo = [[{ COLUMN_NAME: 'source_url' }, { COLUMN_NAME: 'last_scraped_at' }], null];
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

// ── GET /api/materials/prices (public) ───────────────────────────────────────
describe('GET /api/materials/prices', () => {
  test('200 – returns materials list without authentication', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      noop,               // CREATE TABLE IF NOT EXISTS
      noop,               // ALTER TABLE source_url
      noop,               // ALTER TABLE last_scraped_at
      colInfo,            // SELECT COLUMN_NAME
      [sampleMaterials, null],  // SELECT materials
    ));

    const res = await request(app).get('/api/materials/prices');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.materials).toBeInstanceOf(Array);
    expect(typeof res.body.count).toBe('number');
  });

  test('200 – materials array length matches count field', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      noop, noop, noop, colInfo, [sampleMaterials, null],
    ));

    const res = await request(app).get('/api/materials/prices');
    expect(res.body.count).toBe(res.body.materials.length);
  });

  test('200 – each material has id, name, cost_per_unit and unit', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      noop, noop, noop, colInfo, [sampleMaterials, null],
    ));

    const res = await request(app).get('/api/materials/prices');
    const mat = res.body.materials[0];
    expect(mat).toHaveProperty('id');
    expect(mat).toHaveProperty('name');
    expect(mat).toHaveProperty('cost_per_unit');
    expect(mat).toHaveProperty('unit');
  });

  test('200 – returns empty array when no active materials', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      noop, noop, noop, colInfo, [[], null],
    ));

    const res = await request(app).get('/api/materials/prices');
    expect(res.status).toBe(200);
    expect(res.body.materials).toHaveLength(0);
    expect(res.body.count).toBe(0);
  });

  test('200 – source_url and last_scraped_at are present (null if not scraped)', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      noop, noop, noop, colInfo, [sampleMaterials, null],
    ));

    const res = await request(app).get('/api/materials/prices');
    const mat = res.body.materials[0];
    expect(mat).toHaveProperty('source_url');
    expect(mat).toHaveProperty('last_scraped_at');
  });
});

// ── Admin material dashboard (materialRoutes.js inline routes) ────────────────
describe('GET /api/materials/dashboard', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/materials/dashboard');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin user is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .get('/api/materials/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Admin access required');
  });
});

// ── PUT /api/materials/materials/bulk-update ─────────────────────────────────
// materialRoutes defines router.put('/materials/bulk-update', ...) mounted at
// /api/materials, so the full path is /api/materials/materials/bulk-update
describe('PUT /api/materials/materials/bulk-update', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).put('/api/materials/materials/bulk-update').send({ updates: [] });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin cannot bulk update', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .put('/api/materials/materials/bulk-update')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ updates: [{ materialId: 1, costPerUnit: 200 }] });

    expect(res.status).toBe(403);
  });

  test('400 – empty updates array returns 400', async () => {
    const adminUser = { ...baseUser, id: 2, role: 'admin' };
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));

    const res = await request(app)
      .put('/api/materials/materials/bulk-update')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ updates: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Updates array is required');
  });
});

// ── POST /api/materials/materials (add material) ─────────────────────────────
// materialRoutes defines router.post('/materials', ...) mounted at /api/materials
// so the full path is /api/materials/materials
describe('POST /api/materials/materials', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/materials/materials').send({ name: 'Wood', costPerUnit: 1000 });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin cannot add material', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/materials/materials')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Wood', costPerUnit: 1000 });

    expect(res.status).toBe(403);
  });
});

// ── Scraping routes (admin only) ─────────────────────────────────────────────
describe('POST /api/materials/scrape-prices', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/materials/scrape-prices');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/materials/scrape-prices')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
  });
});
