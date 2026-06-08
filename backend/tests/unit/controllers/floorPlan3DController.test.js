// Mock axios BEFORE requiring the controller.
// The controller calls axios.create() to build a client, then client.post() to hit the 3D service.
jest.mock('axios');

const axios = require('axios');
const { syncMapTo3D } = require('../../../controllers/floorPlan3DController');

// ── Helpers ──────────────────────────────────────────────────
const mockPost = jest.fn();

const makeReq = (bodyOverrides = {}) => ({
  body: {
    mapData: {
      metadata: { name: 'Test Plan', units: 'feet' },
      entities: [{ id: 'w1', type: 'line' }],
    },
    source: 'studio',
    ...bodyOverrides,
  },
  user: { id: 42 },
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: API URL is configured and axios.create returns our mock client
  process.env.FLOORPLAN3D_API_URL = 'http://localhost:9000';
  axios.create.mockReturnValue({ post: mockPost });
});

afterEach(() => {
  delete process.env.FLOORPLAN3D_API_URL;
});

// ─────────────────────────────────────────────────────────────
// Input validation — tests validateMapData / isObject indirectly
// ─────────────────────────────────────────────────────────────
describe('syncMapTo3D — input validation', () => {
  test('returns 400 when mapData is missing entirely', async () => {
    const req = makeReq({ mapData: undefined });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('returns 400 when mapData is a string, not an object', async () => {
    const req = makeReq({ mapData: 'not-an-object' });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData must be an object' })
    );
  });

  test('returns 400 when mapData is an array (arrays are not plain objects)', async () => {
    const req = makeReq({ mapData: [] });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData must be an object' })
    );
  });

  test('returns 400 when mapData.metadata is missing', async () => {
    const req = makeReq({ mapData: { entities: [] } });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData.metadata is required' })
    );
  });

  test('returns 400 when mapData.metadata is not an object', async () => {
    const req = makeReq({ mapData: { metadata: 'bad', entities: [] } });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData.metadata is required' })
    );
  });

  test('returns 400 when mapData.entities is missing', async () => {
    const req = makeReq({ mapData: { metadata: { name: 'test' } } });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData.entities must be an array' })
    );
  });

  test('returns 400 when mapData.entities is an object, not an array', async () => {
    const req = makeReq({ mapData: { metadata: { name: 'x' }, entities: {} } });
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mapData.entities must be an array' })
    );
  });

  test('validation error response always has success:false', async () => {
    const req = makeReq({ mapData: null });
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Service not configured
// ─────────────────────────────────────────────────────────────
describe('syncMapTo3D — 3D service not configured', () => {
  beforeEach(() => {
    delete process.env.FLOORPLAN3D_API_URL;
  });

  test('returns 503 when FLOORPLAN3D_API_URL is not set', async () => {
    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('503 response includes code FLOORPLAN3D_NOT_CONFIGURED', async () => {
    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FLOORPLAN3D_NOT_CONFIGURED' })
    );
  });

  test('503 response has success:false', async () => {
    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.success).toBe(false);
  });

  test('axios.create is NOT called when URL is absent', async () => {
    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(axios.create).not.toHaveBeenCalled();
  });

  test('503 message mentions the service is not configured', async () => {
    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);
