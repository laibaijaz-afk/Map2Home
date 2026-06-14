// ── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({ getConnection: jest.fn() }));
jest.mock('../services/scrapingCron',    () => ({ startCronJob: jest.fn(), runScrapingNow: jest.fn().mockResolvedValue({ success: true }), executeScraping: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/costzoneScraper', () => ({ scrapeAndUpdatePrices: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn(), sendWelcomeEmail: jest.fn(), sendResetPasswordEmail: jest.fn(),
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn().mockRejectedValue(new Error('ENOENT: no such file')),
  },
}));

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV   = 'test';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/database');
const app     = require('./testApp');

const SECRET    = 'test-jwt-secret';
const makeToken = (id = 1) => jwt.sign({ id }, SECRET, { expiresIn: '1h' });

const baseUser = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', is_verified: true };
const noop     = [{ affectedRows: 0 }, null];

// ensureJsonMapsTable: 1×CREATE TABLE + 5×ALTER TABLE = 6 queries
const ensureNoops = Array(6).fill(noop);

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

const sampleMapData = {
  metadata: { name: 'Test', version: '1.0', bounds: { minX: 0, minY: 0, maxX: 50, maxY: 40 } },
  layers: [],
  entities: [{ id: 'w1', type: 'line', layerId: 'walls', start: { x: 0, y: 0 }, end: { x: 50, y: 0 } }],
};

const dbMapRow = {
  id: 1, user_id: 1, name: 'My House', description: 'Test map',
  map_data: JSON.stringify(sampleMapData),
  is_template: false, is_public: false,
  created_at: new Date(), updated_at: new Date(),
  plot_length: 30, plot_width: 60, marla: 10, num_floors: 1, source_map_id: null,
};

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/json-maps/sample (public, no DB)
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/json-maps/sample', () => {
  test('200 – returns basic template when sample file is missing', async () => {
    const res = await request(app).get('/api/json-maps/sample');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.map).toHaveProperty('id', 'sample');
    expect(res.body.map).toHaveProperty('map_data');
  });

  test('200 – sample map contains metadata and entities', async () => {
    const res = await request(app).get('/api/json-maps/sample');
    expect(res.body.map.map_data).toHaveProperty('metadata');
    expect(res.body.map.map_data).toHaveProperty('entities');
  });

  test('200 – no auth required', async () => {
    const res = await request(app).get('/api/json-maps/sample');
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/json-maps/templates (public, uses DB)
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/json-maps/templates', () => {
  test('200 – returns empty templates list without auth', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      ...ensureNoops,
      [[], null],     // SELECT templates
    ));
    const res = await request(app).get('/api/json-maps/templates');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.templates).toBeInstanceOf(Array);
  });

  test('200 – returns template entries with id, name, description', async () => {
    const tmpl = { id: 5, name: 'Studio', description: 'Small studio template', created_at: new Date(), bounds: null, entity_count: 3 };
    pool.getConnection.mockResolvedValue(makeConn(
      ...ensureNoops,
      [[tmpl], null],
    ));
    const res = await request(app).get('/api/json-maps/templates');
    expect(res.body.templates[0]).toMatchObject({ id: 5, name: 'Studio' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/json-maps (protected – get user maps)
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/json-maps', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/json-maps');
    expect(res.status).toBe(401);
  });

  test('200 – returns empty maps for new user', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],    // auth
      ...ensureNoops,
      [[], null],            // SELECT maps WHERE user_id=?
    ));
    const res = await request(app).get('/api/json-maps').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toBeInstanceOf(Array);
  });

  test('200 – returns user maps list', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[dbMapRow], null],
    ));
    const res = await request(app).get('/api/json-maps').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.maps[0]).toMatchObject({ id: 1, name: 'My House' });
  });

  test('200 – maps array length matches result count', async () => {
    const row2 = { ...dbMapRow, id: 2, name: 'Office Plan' };
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[dbMapRow, row2], null],
    ));
    const res = await request(app).get('/api/json-maps').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.body.maps).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/json-maps/:mapId (protected)
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/json-maps/:mapId', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/json-maps/1');
    expect(res.status).toBe(401);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[], null],      // SELECT map WHERE id=? AND (user_id=? OR is_public)
    ));
    const res = await request(app).get('/api/json-maps/999').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });

  test('200 – returns map with parsed map_data', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[dbMapRow], null],
    ));
    const res = await request(app).get('/api/json-maps/1').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.map).toHaveProperty('id', 1);
    expect(res.body.map.map_data).toHaveProperty('metadata');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/json-maps (protected – create map)
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/json-maps', () => {
  const validPayload = {
    name: 'New Floor Plan',
    map_data: sampleMapData,
  };

  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/json-maps').send(validPayload);
    expect(res.status).toBe(401);
  });

  test('400 – missing name', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/json-maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ map_data: sampleMapData });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Name and map_data are required' });
  });

  test('400 – missing map_data', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/json-maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test Plan' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Name and map_data are required' });
  });

  test('400 – map_data missing metadata field', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/json-maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test', map_data: { entities: [] } });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid map_data structure. Must contain metadata and entities.' });
  });

  test('400 – map_data missing entities field', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));
    const res = await request(app)
      .post('/api/json-maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test', map_data: { metadata: {} } });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('201 – creates map and returns mapId', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [{ insertId: 10 }, null],   // INSERT json_maps
    ));
    const res = await request(app)
      .post('/api/json-maps')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: 'Map created successfully' });
    expect(res.body).toHaveProperty('mapId', 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/json-maps/:mapId (protected – update map)
// ─────────────────────────────────────────────────────────────────────────────
describe('PUT /api/json-maps/:mapId', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).put('/api/json-maps/1').send({ name: 'Updated' });
    expect(res.status).toBe(401);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[], null],      // SELECT id, user_id FROM json_maps WHERE id=?
    ));
    const res = await request(app)
      .put('/api/json-maps/999')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });

  test('403 – cannot edit another user map', async () => {
    const otherUserMap = { id: 5, user_id: 99 };   // owned by user 99, not user 1
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[otherUserMap], null],
    ));
    const res = await request(app)
      .put('/api/json-maps/5')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ success: false, message: 'You do not have permission to edit this map' });
  });

  test('400 – no fields to update', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[{ id: 1, user_id: 1 }], null],    // ownership check
    ));
    const res = await request(app)
      .put('/api/json-maps/1')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'No fields to update' });
  });

  test('200 – updates map name successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[{ id: 1, user_id: 1 }], null],    // ownership check
      [{ affectedRows: 1 }, null],          // UPDATE json_maps
    ));
    const res = await request(app)
      .put('/api/json-maps/1')
      .set('Authorization', `Bearer ${makeToken(1)}`)
      .send({ name: 'Updated House Plan' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Map updated successfully' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/json-maps/:mapId (protected)
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/json-maps/:mapId', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).delete('/api/json-maps/1');
    expect(res.status).toBe(401);
  });

  test('404 – map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[], null],      // SELECT id, user_id FROM json_maps WHERE id=?
    ));
    const res = await request(app).delete('/api/json-maps/999').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });

  test('403 – cannot delete another user map', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[{ id: 5, user_id: 99 }], null],
    ));
    const res = await request(app).delete('/api/json-maps/5').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ success: false, message: 'You do not have permission to delete this map' });
  });

  test('200 – deletes own map successfully', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[{ id: 1, user_id: 1 }], null],    // ownership check
      [{ affectedRows: 1 }, null],          // DELETE
    ));
    const res = await request(app).delete('/api/json-maps/1').set('Authorization', `Bearer ${makeToken(1)}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Map deleted successfully' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/json-maps/clone/:mapId (protected)
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/json-maps/clone/:mapId', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/json-maps/clone/1');
    expect(res.status).toBe(401);
  });

  test('404 – source map not found', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[], null],      // SELECT * FROM json_maps WHERE id=? AND (user_id=? OR is_public)
    ));
    const res = await request(app).post('/api/json-maps/clone/999').set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Map not found' });
  });

  test('201 – clones map and returns new mapId', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[dbMapRow], null],          // SELECT original map
      [{ insertId: 20 }, null],    // INSERT clone
    ));
    const res = await request(app)
      .post('/api/json-maps/clone/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Copy of My House' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: 'Map cloned successfully' });
    expect(res.body).toHaveProperty('mapId', 20);
  });

  test('201 – uses default name when no name provided', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[dbMapRow], null],
      [{ insertId: 21 }, null],
    ));
    const res = await request(app)
      .post('/api/json-maps/clone/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/json-maps/search (protected)
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/json-maps/search', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/json-maps/search?plot_length=30&plot_width=60');
    expect(res.status).toBe(401);
  });

  test('200 – returns empty maps when no match', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[], null],      // SELECT rows WHERE user_id=?
    ));
    const res = await request(app)
      .get('/api/json-maps/search?plot_length=30&plot_width=60&marla=10')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.maps).toHaveLength(0);
  });

  test('200 – returns matching maps by dimensions', async () => {
    const matchRow = { ...dbMapRow, plot_length: 30, plot_width: 60, marla: 10, map_data: JSON.stringify(sampleMapData) };
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[matchRow], null],
    ));
    const res = await request(app)
      .get('/api/json-maps/search?plot_length=30&plot_width=60')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.maps.length).toBeGreaterThan(0);
    expect(res.body.maps[0]).toHaveProperty('isJsonMap', true);
  });

  test('200 – falls back to marla matching when dimensions do not match', async () => {
    const matchRow = { ...dbMapRow, plot_length: 999, plot_width: 999, marla: 10, map_data: JSON.stringify(sampleMapData) };
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      ...ensureNoops,
      [[matchRow], null],
    ));
    const res = await request(app)
      .get('/api/json-maps/search?plot_length=30&plot_width=60&marla=10')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.maps.length).toBeGreaterThan(0);
    expect(res.body.maps[0]).toHaveProperty('matchReason', 'marla');
  });
});
