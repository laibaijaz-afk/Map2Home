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

const baseUser  = { id: 1, name: 'User',  email: 'user@example.com',  role: 'user',  is_verified: true };
const adminUser = { id: 2, name: 'Admin', email: 'admin@example.com', role: 'admin', is_verified: true };

const noop = [{ affectedRows: 0 }, null];

const makeConn = (...results) => {
  let i = 0;
  return {
    query:            jest.fn().mockImplementation(() => Promise.resolve(results[i++] ?? [[], null])),
    release:          jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit:           jest.fn().mockResolvedValue(undefined),
    rollback:         jest.fn().mockResolvedValue(undefined),
  };
};

// mapController.ensureMapsTable: 2×CREATE TABLE + 16×ALTER TABLE = 18 noops
const ensureMapNoops = Array(18).fill(noop);

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/admin/stats', () => {
  test('401 – no token', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin user', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Admin access required');
  });

  test('200 – admin gets system stats', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],                          // auth
      [[{ total: 50, today: 5 }], null],            // SELECT users
      [[{ total: 100 }], null],                     // SELECT cost_estimates
      [[{ total: 10 }], null],                      // CREATE TABLE + SELECT map_generations
    ));
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.stats).toHaveProperty('totalUsers');
    expect(res.body.stats).toHaveProperty('totalEstimates');
    expect(res.body.stats).toHaveProperty('totalMaps');
  });

  test('200 – stats values are numbers', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [[{ total: 25, today: 3 }], null],
      [[{ total: 40 }], null],
      [[{ total: 8 }], null],
    ));
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${makeToken(2)}`);
    const { stats } = res.body;
    expect(typeof stats.totalUsers).toBe('number');
    expect(typeof stats.totalEstimates).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/admin/users', () => {
  test('401 – no token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
  });

  test('200 – admin gets all users list', async () => {
    const userRow = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', is_verified: true, created_at: new Date() };
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],       // auth
      [[userRow], null],          // SELECT users
    ));
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.users).toBeInstanceOf(Array);
  });

  test('200 – empty users array when no users', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [[], null],
    ));
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users/:userId/role
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/admin/users/:userId/role', () => {
  test('401 – no token', async () => {
    const res = await request(app).post('/api/admin/users/1/role').send({ role: 'admin' });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ userId: 1, role: 'admin' });
    expect(res.status).toBe(403);
  });

  test('400 – invalid role value', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .post('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ userId: 1, role: 'superuser' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid user ID or role');
  });

  test('400 – missing userId', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .post('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('200 – admin updates user role to admin', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [{ affectedRows: 1 }, null],   // UPDATE users SET role
    ));
    const res = await request(app)
      .post('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ userId: 1, role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'User role updated successfully' });
  });

  test('200 – admin downgrades admin to user', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [{ affectedRows: 1 }, null],
    ));
    const res = await request(app)
      .post('/api/admin/users/3/role')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ userId: 3, role: 'user' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/update-costs
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/admin/update-costs', () => {
  test('401 – no token', async () => {
    const res = await request(app).post('/api/admin/update-costs').send({ baseCost: 1, materialMarkup: 1, laborCost: 1 });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/admin/update-costs')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ baseCost: 1000, materialMarkup: 20, laborCost: 500 });
    expect(res.status).toBe(403);
  });

  test('400 – missing baseCost', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .post('/api/admin/update-costs')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ materialMarkup: 20, laborCost: 500 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'All fields are required');
  });

  test('400 – missing laborCost', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .post('/api/admin/update-costs')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ baseCost: 1000, materialMarkup: 20 });
    expect(res.status).toBe(400);
  });

  test('200 – creates new cost config when none exists', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      noop,                         // CREATE TABLE cost_config
      [[], null],                   // SELECT cost_config WHERE id=1 (none)
      [{ insertId: 1 }, null],      // INSERT cost_config
    ));
    const res = await request(app)
      .post('/api/admin/update-costs')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ baseCost: 45000, materialMarkup: 15, laborCost: 12000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Cost configuration updated successfully' });
    expect(res.body.data).toMatchObject({ baseCost: 45000, materialMarkup: 15, laborCost: 12000 });
  });

  test('200 – updates existing cost config', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      noop,
      [[{ id: 1, base_cost_per_sqm: 40000 }], null],  // existing config
      [{ affectedRows: 1 }, null],                      // UPDATE cost_config
    ));
    const res = await request(app)
      .post('/api/admin/update-costs')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ baseCost: 50000, materialMarkup: 18, laborCost: 14000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/materials
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/admin/materials', () => {
  const matRow = { id: 1, name: 'Cement', category: 'construction', cost_per_unit: 1390, unit: 'bag', description: 'Cement', is_active: true, updated_at: new Date() };
  const colInfo = [[{ COLUMN_NAME: 'source_url' }, { COLUMN_NAME: 'last_scraped_at' }], null];

  test('401 – no token', async () => {
    const res = await request(app).get('/api/admin/materials');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app).get('/api/admin/materials').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
  });

  test('200 – admin gets materials list', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],                             // auth
      noop,                                             // CREATE TABLE materials
      noop,                                             // ALTER TABLE source_url
      noop,                                             // ALTER TABLE last_scraped_at
      [[{ count: 1 }], null],                          // SELECT COUNT(*)
      colInfo,                                          // INFORMATION_SCHEMA columns
      [[matRow], null],                                 // SELECT materials
    ));
    const res = await request(app).get('/api/admin/materials').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.materials).toBeInstanceOf(Array);
  });

  test('200 – materials count matches array length', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      noop, noop, noop,
      [[{ count: 2 }], null],
      colInfo,
      [[matRow, { ...matRow, id: 2, name: 'Steel' }], null],
    ));
    const res = await request(app).get('/api/admin/materials').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.body.materials).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/materials/cost
// ─────────────────────────────────────────────────────────────────────────────
describe('PUT /api/admin/materials/cost', () => {
  const updatedMat = { id: 1, name: 'Cement', category: 'construction', cost_per_unit: 1500, unit: 'bag', description: 'Cement', updated_at: new Date() };

  test('401 – no token', async () => {
    const res = await request(app).put('/api/admin/materials/cost').send({ materialId: 1, costPerUnit: 1500 });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .put('/api/admin/materials/cost')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ materialId: 1, costPerUnit: 1500 });
    expect(res.status).toBe(403);
  });

  test('400 – missing materialId', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .put('/api/admin/materials/cost')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ costPerUnit: 1500 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid material ID or cost');
  });

  test('400 – negative costPerUnit', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[adminUser], null]));
    const res = await request(app)
      .put('/api/admin/materials/cost')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ materialId: 1, costPerUnit: -100 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid material ID or cost');
  });

  test('404 – material not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [[], null],                  // SELECT id FROM materials WHERE id=? → not found
    ));
    const res = await request(app)
      .put('/api/admin/materials/cost')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ materialId: 999, costPerUnit: 1500 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Material not found');
  });

  test('200 – updates material cost successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      [[{ id: 1 }], null],           // SELECT material by id
      [{ affectedRows: 1 }, null],   // UPDATE materials
      [[updatedMat], null],           // SELECT updated material
    ));
    const res = await request(app)
      .put('/api/admin/materials/cost')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ materialId: 1, costPerUnit: 1500 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Material cost updated successfully' });
    expect(res.body.material).toHaveProperty('id', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/maps
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/admin/maps', () => {
  test('401 – no token', async () => {
    const res = await request(app).get('/api/admin/maps');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app).get('/api/admin/maps').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Admin access required');
  });

  test('200 – admin gets all maps (empty)', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],   // auth
      ...ensureMapNoops,     // ensureMapsTable (18 queries)
      [[], null],            // SELECT * FROM maps
    ));
    const res = await request(app).get('/api/admin/maps').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toBeInstanceOf(Array);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/maps/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/admin/maps/:id', () => {
  test('401 – no token', async () => {
    const res = await request(app).delete('/api/admin/maps/1');
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app).delete('/api/admin/maps/1').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      ...ensureMapNoops,
      [[], null],          // SELECT * FROM maps WHERE id=? → not found
    ));
    const res = await request(app).delete('/api/admin/maps/999').set('Authorization', `Bearer ${makeToken(2)}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/maps/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('PUT /api/admin/maps/:id', () => {
  const existingMap = { id: 1, title: 'Old Title', room_type: 'house', file_path: 'plan.dxf', description: '' };

  test('401 – no token', async () => {
    const res = await request(app).put('/api/admin/maps/1').send({ title: 'New Title' });
    expect(res.status).toBe(401);
  });

  test('403 – non-admin is forbidden', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .put('/api/admin/maps/1')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ title: 'New Title' });
    expect(res.status).toBe(403);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      ...ensureMapNoops,
      [[], null],          // SELECT * FROM maps WHERE id=? → not found
    ));
    const res = await request(app)
      .put('/api/admin/maps/999')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });

  test('200 – updates map successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[adminUser], null],
      ...ensureMapNoops,
      [[existingMap], null],          // SELECT * FROM maps WHERE id=?
      [{ affectedRows: 1 }, null],    // UPDATE maps
    ));
    const res = await request(app)
      .put('/api/admin/maps/1')
      .set('Authorization', `Bearer ${makeToken(2)}`)
      .send({ title: 'Updated Title', room_type: 'house' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Map updated successfully' });
  });
});
