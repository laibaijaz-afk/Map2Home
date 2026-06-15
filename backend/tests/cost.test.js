// ── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({ getConnection: jest.fn() }));
jest.mock('../services/scrapingCron',    () => ({ startCronJob: jest.fn(), runScrapingNow: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/costzoneScraper', () => ({ scrapeAndUpdatePrices: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn(), sendWelcomeEmail: jest.fn(), sendResetPasswordEmail: jest.fn(),
}));

// ── Imports ──────────────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV   = 'test';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/database');
const app     = require('./testApp');

// ── Helpers ──────────────────────────────────────────────────────────────────
const SECRET    = 'test-jwt-secret';
const makeToken = (id = 1, role = 'user') => jwt.sign({ id }, SECRET, { expiresIn: '1h' });

const baseUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'user', is_verified: true };

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

// Stubbed material rows returned when costController fetches material prices
const materialRows = [
  { name: 'Cement',   cost_per_unit: 1390, unit: 'bag',   updated_at: new Date(), last_updated: new Date() },
  { name: 'Steel',    cost_per_unit: 238000, unit: 'ton', updated_at: new Date(), last_updated: new Date() },
  { name: 'Bricks',   cost_per_unit: 17,   unit: 'piece', updated_at: new Date(), last_updated: new Date() },
  { name: 'Sand',     cost_per_unit: 10000, unit: 'truck', updated_at: new Date(), last_updated: new Date() },
  { name: 'Gravel',   cost_per_unit: 25500, unit: 'truck', updated_at: new Date(), last_updated: new Date() },
  { name: 'Tiles',    cost_per_unit: 400,  unit: 'sqm',   updated_at: new Date(), last_updated: new Date() },
  { name: 'Paint',    cost_per_unit: 1250, unit: 'liter', updated_at: new Date(), last_updated: new Date() },
  { name: 'Glass',    cost_per_unit: 193,  unit: 'sqft',  updated_at: new Date(), last_updated: new Date() },
  { name: 'Aluminum', cost_per_unit: 1450, unit: 'sqft',  updated_at: new Date(), last_updated: new Date() },
];

// Connection mock for calculateCostEstimate (auth + column check + materials fetch)
const calcConn = () => makeConn(
  [[baseUser], null],          // auth middleware: SELECT user
  [[{ COLUMN_NAME: 'last_scraped_at' }], null], // column check
  [materialRows, null],         // SELECT materials
);

beforeEach(() => jest.clearAllMocks());

// ── GET /api/cost-estimation/default-data (public) ──────────────────────────
describe('GET /api/cost-estimation/default-data', () => {
  test('200 – returns default data without authentication', async () => {
    const res = await request(app).get('/api/cost-estimation/default-data');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('cities');
    expect(res.body.data).toHaveProperty('constructionQualities');
    expect(res.body.data).toHaveProperty('greyStructureRates');
    expect(res.body.data).toHaveProperty('completeHouseRates');
    expect(res.body.data).toHaveProperty('locationMultipliers');
  });

  test('200 – cities array includes Karachi, Lahore, Islamabad', async () => {
    const res = await request(app).get('/api/cost-estimation/default-data');
    expect(res.body.data.cities).toEqual(expect.arrayContaining(['Karachi', 'Lahore', 'Islamabad']));
  });

  test('200 – constructionQualities contains Economy, Standard, Luxury', async () => {
    const res = await request(app).get('/api/cost-estimation/default-data');
    expect(res.body.data.constructionQualities).toEqual(
      expect.arrayContaining(['Economy', 'Standard', 'Luxury'])
    );
  });

  test('401 – calculate route requires authentication', async () => {
    const res = await request(app).post('/api/cost-estimation/calculate').send({});
    expect(res.status).toBe(401);
  });
});

// ── POST /api/cost-estimation/calculate ─────────────────────────────────────
describe('POST /api/cost-estimation/calculate', () => {
  const validPayload = {
    plotLength: 30, plotWidth: 60, plotAreaSqm: 167.2, coveredAreaSqm: 100,
    location: 'karachi', constructionType: 'complete',
    floors: 2, quality: 'standard',
    rooms: { bedrooms: 3, bathrooms: 2 },
    features: {},
  };

  test('200 – returns cost estimate for valid input', async () => {
    pool.getConnection.mockResolvedValue(calcConn());

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.estimate).toHaveProperty('totalCost');
    expect(res.body.estimate.totalCost).toBeGreaterThan(0);
  });

  test('200 – estimate includes materialBreakdown array', async () => {
    pool.getConnection.mockResolvedValue(calcConn());

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validPayload);

    expect(res.body.estimate.materialBreakdown).toBeInstanceOf(Array);
    expect(res.body.estimate.materialBreakdown.length).toBeGreaterThan(0);
  });

  test('200 – estimate includes laborCost and materialCost', async () => {
    pool.getConnection.mockResolvedValue(calcConn());

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validPayload);

    expect(typeof res.body.estimate.laborCost).toBe('number');
    expect(typeof res.body.estimate.materialCost).toBe('number');
  });

  test('400 – missing plotLength returns 400 with missingFields', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validPayload, plotLength: undefined });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('missingFields');
    expect(res.body.missingFields).toContain('Plot Length (in feet)');
  });

  test('400 – missing location returns 400', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validPayload, location: '' });

    expect(res.status).toBe(400);
    expect(res.body.missingFields).toContain('City/Location');
  });

  test('400 – invalid quality value returns 400', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validPayload, quality: 'ultra' });

    expect(res.status).toBe(400);
    expect(res.body.missingFields).toContain('Construction Quality');
  });

  test('400 – floors < 1 returns 400', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validPayload, floors: 0 });

    expect(res.status).toBe(400);
  });

  test('200 – grey structure type is accepted', async () => {
    pool.getConnection.mockResolvedValue(calcConn());

    const res = await request(app)
      .post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validPayload, constructionType: 'grey' });

    expect(res.status).toBe(200);
    expect(res.body.estimate.constructionType).toBe('grey');
  });

  test('200 – luxury quality yields higher totalCost than economy', async () => {
    // Run sequentially so each request gets its own fresh mock connection
    pool.getConnection.mockResolvedValue(calcConn());
    const luxRes = await request(app).post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`).send({ ...validPayload, quality: 'luxury' });

    pool.getConnection.mockResolvedValue(calcConn());
    const ecoRes = await request(app).post('/api/cost-estimation/calculate')
      .set('Authorization', `Bearer ${makeToken()}`).send({ ...validPayload, quality: 'economy' });

    expect(luxRes.status).toBe(200);
    expect(ecoRes.status).toBe(200);
    expect(luxRes.body.estimate.totalCost).toBeGreaterThan(ecoRes.body.estimate.totalCost);
  });
});

// ── POST /api/cost-estimation/save ──────────────────────────────────────────
describe('POST /api/cost-estimation/save', () => {
  const savePayload = {
    plotLength: 30, plotWidth: 60, plotAreaSqm: 167, coveredAreaSqm: 100,
    location: 'lahore', floors: 2, quality: 'standard',
    basement: 'no', rooms: {}, features: {}, totalCost: 5000000,
  };

  test('401 – requires authentication', async () => {
    const res = await request(app).post('/api/cost-estimation/save').send(savePayload);
    expect(res.status).toBe(401);
  });

  test('201 – saves estimate and returns estimateId', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],                 // auth middleware
      [[], null],                          // CREATE TABLE IF NOT EXISTS (ignored)
      [{ insertId: 7 }, null],             // INSERT estimate
    ));

    const res = await request(app)
      .post('/api/cost-estimation/save')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(savePayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('estimateId');
  });

  test('400 – missing totalCost', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/save')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...savePayload, totalCost: undefined });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Plot area and total cost are required');
  });

  test('400 – missing plotAreaSqm', async () => {
    pool.getConnection.mockResolvedValue(makeConn([[baseUser], null]));

    const res = await request(app)
      .post('/api/cost-estimation/save')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...savePayload, plotAreaSqm: undefined });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Plot area and total cost are required');
  });
});

// ── GET /api/cost-estimation/my-estimates ───────────────────────────────────
describe('GET /api/cost-estimation/my-estimates', () => {
  test('401 – requires authentication', async () => {
    const res = await request(app).get('/api/cost-estimation/my-estimates');
    expect(res.status).toBe(401);
  });

  test('200 – returns user estimates array', async () => {
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],    // auth
      [[], null],             // CREATE TABLE IF NOT EXISTS
      [[], null],             // SELECT estimates (empty)
    ));

    const res = await request(app)
      .get('/api/cost-estimation/my-estimates')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.estimates).toBeInstanceOf(Array);
  });

  test('200 – returns estimates with correct shape when present', async () => {
    const estimate = { id: 1, user_id: 1, plot_area_sqm: 100, total_cost: 5000000, created_at: new Date() };
    pool.getConnection.mockResolvedValue(makeConn(
      [[baseUser], null],
      [[], null],
      [[estimate], null],
    ));

    const res = await request(app)
      .get('/api/cost-estimation/my-estimates')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.estimates[0]).toMatchObject({ id: 1 });
  });
});
