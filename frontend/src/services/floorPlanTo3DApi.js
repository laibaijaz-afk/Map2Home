const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const syncFloorPlanTo3D = async ({ mapData, token, revision, source = 'studio' }) => {
  if (!token) {
    throw new Error('Authentication required for 3D sync.');
  }

  const response = await fetch(`${API_URL}/floorplan-3d/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      mapData,
      revision,
      source
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `3D sync failed (${response.status})`);
  }

  return data;
};
