const axios = require('axios');

const DEFAULT_TIMEOUT_MS = Number(process.env.FLOORPLAN3D_TIMEOUT_MS || 20000);
const DEFAULT_RETRIES = Number(process.env.FLOORPLAN3D_RETRIES || 2);
const DEFAULT_API_PATH = process.env.FLOORPLAN3D_API_PATH || '/generate-3d';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const validateMapData = (mapData) => {
  if (!isObject(mapData)) return 'mapData must be an object';
  if (!isObject(mapData.metadata)) return 'mapData.metadata is required';
  if (!Array.isArray(mapData.entities)) return 'mapData.entities must be an array';
  return null;
};

const createAxiosClient = () => {
  const baseURL = process.env.FLOORPLAN3D_API_URL;
  if (!baseURL) return null;

  return axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FLOORPLAN3D_API_KEY ? { Authorization: `Bearer ${process.env.FLOORPLAN3D_API_KEY}` } : {})
    }
  });
};

const forwardTo3DService = async (client, payload) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= DEFAULT_RETRIES) {
    try {
      const response = await client.post(DEFAULT_API_PATH, payload);
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryable = !status || status >= 500 || status === 429;
      if (!retryable || attempt === DEFAULT_RETRIES) break;
      attempt += 1;
    }
  }

  throw lastError || new Error('3D service request failed');
};

const syncMapTo3D = async (req, res) => {
  const { mapData, source = 'studio', revision } = req.body || {};
  const validationError = validateMapData(mapData);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const client = createAxiosClient();
  if (!client) {
    return res.status(503).json({
      success: false,
      message: '3D service is not configured on server',
      code: 'FLOORPLAN3D_NOT_CONFIGURED'
    });
  }

  const payload = {
    mapData,
    source,
    revision: revision ?? Date.now(),
    userId: req.user?.id || null
  };

  try {
    const data = await forwardTo3DService(client, payload);
    const model =
      isObject(data?.model) ? data.model :
      isObject(data?.result?.model) ? data.result.model :
      {};

    return res.json({
      success: true,
      revision: payload.revision,
      model: {
        url: model.url || model.modelUrl || null,
        format: model.format || null,
        mapData: model.mapData || data?.mapData || null
      },
      raw: process.env.NODE_ENV === 'development' ? data : undefined
    });
  } catch (error) {
    const upstreamStatus = error?.response?.status || 502;
    const upstreamMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      '3D service unavailable';

    return res.status(upstreamStatus).json({
      success: false,
      message: `3D generation failed: ${upstreamMessage}`,
      code: 'FLOORPLAN3D_UPSTREAM_ERROR'
    });
  }
};

module.exports = {
  syncMapTo3D
};
