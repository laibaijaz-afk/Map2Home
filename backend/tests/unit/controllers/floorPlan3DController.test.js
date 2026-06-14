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

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.message).toMatch(/not configured/i);
  });
});

// ─────────────────────────────────────────────────────────────
// Successful 3D service response
// ─────────────────────────────────────────────────────────────
describe('syncMapTo3D — successful 3D generation', () => {
  test('happy path: returns 200 with success:true when service responds', async () => {
    mockPost.mockResolvedValue({
      data: {
        model: { url: 'https://cdn.example.com/model.glb', format: 'glb' },
      },
    });

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
    expect(res.status).not.toHaveBeenCalled(); // no error status set
  });

  test('response includes model.url from the upstream service', async () => {
    mockPost.mockResolvedValue({
      data: { model: { url: 'https://cdn.example.com/house.glb' } },
    });

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.model.url).toBe('https://cdn.example.com/house.glb');
  });

  test('response includes the revision that was sent in the payload', async () => {
    mockPost.mockResolvedValue({ data: { model: {} } });

    const req = makeReq({ revision: 12345 });
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.revision).toBe(12345);
  });

  test('handles upstream data where model is nested under result.model', async () => {
    mockPost.mockResolvedValue({
      data: { result: { model: { url: 'https://cdn.example.com/nested.glb', format: 'obj' } } },
    });

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.model.url).toBe('https://cdn.example.com/nested.glb');
    expect(jsonArg.model.format).toBe('obj');
  });

  test('model.url is null when upstream provides no URL field', async () => {
    mockPost.mockResolvedValue({ data: { model: {} } });

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.model.url).toBeNull();
  });

  test('revision defaults to a number (Date.now) when not provided in request', async () => {
    mockPost.mockResolvedValue({ data: { model: {} } });

    const req = makeReq({ revision: undefined });
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(typeof jsonArg.revision).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────
// Error handling from upstream 3D service
// ─────────────────────────────────────────────────────────────
describe('syncMapTo3D — upstream errors', () => {
  test('returns 502 when the 3D service throws without a response', async () => {
    mockPost.mockRejectedValue(new Error('Connection refused'));

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  test('returns the upstream HTTP status when service returns a 4xx error', async () => {
    const err = new Error('Bad request');
    err.response = { status: 422, data: { message: 'Invalid payload' } };
    mockPost.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('error response includes success:false', async () => {
    mockPost.mockRejectedValue(new Error('Upstream down'));

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.success).toBe(false);
  });

  test('error response includes code FLOORPLAN3D_UPSTREAM_ERROR', async () => {
    mockPost.mockRejectedValue(new Error('Timeout'));

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.code).toBe('FLOORPLAN3D_UPSTREAM_ERROR');
  });

  test('error message echoes upstream error text', async () => {
    const err = new Error('Service temporarily overloaded');
    err.response = { status: 503, data: { message: 'Service temporarily overloaded' } };
    mockPost.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.message).toContain('Service temporarily overloaded');
  });

  test('retries on 500 errors (mockPost called more than once)', async () => {
    const err = new Error('Internal server error');
    err.response = { status: 500, data: {} };
    // All attempts fail
    mockPost.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    // DEFAULT_RETRIES=2 → 1 initial + 2 retries = 3 total attempts
    expect(mockPost.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test('does NOT retry on 400 (non-retryable client error)', async () => {
    const err = new Error('Bad request');
    err.response = { status: 400, data: {} };
    mockPost.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();

    await syncMapTo3D(req, res);

    // Should only attempt once
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
