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
const makeToken = (id = 1, role = 'user') => jwt.sign({ id }, SECRET, { expiresIn: '1h' });

const baseUser  = { id: 1, name: 'Test', email: 'test@example.com', role: 'user',  is_verified: true };
const adminUser = { id: 2, name: 'Admin', email: 'admin@example.com', role: 'admin', is_verified: true };

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

// A sample map row as stored in DB
const dbMap = {
  id: 1, title: 'Test Plan', room_type: 'house', file_path: 'plan.dxf',
  description: 'Test', bedrooms: 3, bathrooms: 2, kitchen: 1,
  drawing_room: 1, dining_room: 1, store_room: 0, garage: 1,
  servant_quarter: 0, tv_lounge: 0, plot_length: 30, plot_width: 60, marla: 10,
  elevation_file: null, working_drawing_file: null, electric_file: null, sanitary_file: null,
  created_at: new Date(), updated_at: new Date(),
};

// Returns conn with ensureMapsTable (CREATE TABLE × 2 + ALTER TABLE × n) + the real results.
// The controller calls several ALTER TABLE statements (up to 16) that we swallow as empty.
const alterNoop = [{ affectedRows: 0 }, null];
const ensureQueries = Array(18).fill(alterNoop); // 2×CREATE TABLE + 16×ALTER TABLE

const withEnsure = (...realResults) => makeConn(...ensureQueries, ...realResults);

beforeEach(() => jest.clearAllMocks());

// ── GET /api/maps (public) ───────────────────────────────────────────────────
describe('GET /api/maps', () => {
  test('200 – returns maps array without authentication', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],   // SELECT maps
      [[], null],        // SELECT floors
    ));

    const res = await request(app).get('/api/maps');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toBeInstanceOf(Array);
  });

  test('200 – returns empty maps array when no maps exist', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[], null],  // no maps
    ));

    const res = await request(app).get('/api/maps');
    expect(res.status).toBe(200);
    expect(res.body.maps).toHaveLength(0);
  });

  test('200 – map objects contain expected fields', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],
      [[], null],
    ));

    const res = await request(app).get('/api/maps');
    const map = res.body.maps[0];
    expect(map).toHaveProperty('id');
    expect(map).toHaveProperty('title');
    expect(map).toHaveProperty('file_path');
  });
});

// ── GET /api/maps/room-type/:room_type (public) ──────────────────────────────
describe('GET /api/maps/room-type/:room_type', () => {
  test('200 – returns maps for given room_type', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],
      [[], null],
    ));

    const res = await request(app).get('/api/maps/room-type/house');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toBeInstanceOf(Array);
  });

  test('200 – empty array for room type with no maps', async () => {
    pool.getConnection.mockResolvedValue(withEnsure([[], null]));

    const res = await request(app).get('/api/maps/room-type/garage');
    expect(res.status).toBe(200);
    expect(res.body.maps).toHaveLength(0);
  });
});

// ── POST /api/maps/by-specifications (public) ────────────────────────────────
describe('POST /api/maps/by-specifications', () => {
  test('400 – missing roomSpecifications', async () => {
    const res = await request(app).post('/api/maps/by-specifications').send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'roomSpecifications are required' });
  });

  test('200 – empty maps when all room counts are zero', async () => {
    pool.getConnection.mockResolvedValue(withEnsure());

    const res = await request(app).post('/api/maps/by-specifications').send({
      roomSpecifications: { bedrooms: 0, bathrooms: 0 },
    });
    expect(res.status).toBe(200);
    expect(res.body.maps).toHaveLength(0);
  });

  test('200 – returns maps matching room specifications', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],
      [[], null],
    ));

    const res = await request(app).post('/api/maps/by-specifications').send({
      roomSpecifications: { bedrooms: 3 },
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});

// ── POST /api/maps/generate-2d (public) ──────────────────────────────────────
describe('POST /api/maps/generate-2d', () => {
  test('400 – missing numFloors', async () => {
    const res = await request(app).post('/api/maps/generate-2d').send({
      length: 30, width: 60, marla: 10,
    });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
    expect(res.body.message).toMatch(/floors/i);
  });

  test('400 – missing plot dimensions', async () => {
    const res = await request(app).post('/api/maps/generate-2d').send({ numFloors: 2, marla: 10 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 – missing marla', async () => {
    const res = await request(app).post('/api/maps/generate-2d').send({
      length: 30, width: 60, numFloors: 2,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 – numFloors > 20 is rejected', async () => {
    const res = await request(app).post('/api/maps/generate-2d').send({
      length: 30, width: 60, marla: 10, numFloors: 25,
    });
    expect(res.status).toBe(400);
  });

  test('200 – success:false with message when no maps exist in DB', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[], null],  // no maps
      [[], null],
    ));

    const res = await request(app).post('/api/maps/generate-2d').send({
      length: 30, width: 60, marla: 10, numFloors: 1,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no maps/i);
  });

  test('200 – returns matching maps when floor count and dims match', async () => {
    const floorRow = { id: 10, map_id: 1, floor_number: 0, floor_name: 'Ground Floor', file_path: 'gf.dxf' };
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],        // SELECT all maps
      [[floorRow], null],     // SELECT floors
    ));

    const res = await request(app).post('/api/maps/generate-2d').send({
      length: 30, width: 60, marla: 10, numFloors: 1,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.maps).toBeInstanceOf(Array);
    expect(res.body.maps.length).toBeGreaterThan(0);
  });
});

// ── GET /api/maps/info/:id (public) ─────────────────────────────────────────
describe('GET /api/maps/info/:id', () => {
  test('400 – non-numeric id', async () => {
    const res = await request(app).get('/api/maps/info/abc');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid map id' });
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(withEnsure([[], null]));

    const res = await request(app).get('/api/maps/info/999');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });

  test('200 – returns map info', async () => {
    pool.getConnection.mockResolvedValue(withEnsure(
      [[dbMap], null],
      [[], null],
    ));

    const res = await request(app).get('/api/maps/info/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.map).toHaveProperty('id', 1);
  });
});

// ── POST /api/maps (protected – create map) ──────────────────────────────────
describe('POST /api/maps', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/maps').send({
      room_type: 'house', title: 'New Plan', file_path: 'plan.dxf',
    });
    expect(res.status).toBe(401);
  });

  test('400 – missing title and file_path', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null], ...ensureQueries));

    const res = await request(app)
      .post('/api/maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ room_type: 'house' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'room_type, title, and file_path are required' });
  });

  test('201 – creates map successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],       // auth
      ...ensureQueries,          // CREATE/ALTER TABLE
      [{ insertId: 5 }, null],   // INSERT map
    ));

    const res = await request(app)
      .post('/api/maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ room_type: 'house', title: 'New Plan', file_path: 'plan.dxf' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: 'Map created successfully' });
    expect(res.body.map).toHaveProperty('id', 5);
  });
});

// ── Protected map routes ─────────────────────────────────────────────────────
describe('GET /api/maps/my-maps', () => {
  test('401 – no token', async () => {
    const res = await request(app).get('/api/maps/my-maps');
    expect(res.status).toBe(401);
  });

  test('200 – returns user map generations', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],   // auth
      [[], null],            // CREATE TABLE IF NOT EXISTS
      [[], null],            // SELECT map_generations
    ));

    const res = await request(app)
      .get('/api/maps/my-maps')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toBeInstanceOf(Array);
  });
});

describe('GET /api/maps/:mapId', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/maps/1');
    expect(res.status).toBe(401);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],  // auth
      [[], null],           // SELECT map_generations WHERE id=? AND user_id=?
    ));

    const res = await request(app)
      .get('/api/maps/999')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Map not found');
  });
});
