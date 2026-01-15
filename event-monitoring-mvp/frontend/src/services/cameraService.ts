/**
 * Camera Service
 * Handles all API communication regarding cameras.
 *
 * FILE: frontend/src/services/cameraService.ts
 */

/**
 * Backend base URL
 * Uses env var when available (Docker / deployed), falls back to localhost.
 */
const API_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  function clearAuthStorage() {
  // Token is stored in localStorage and auth state is persisted by redux-persist.
  // If backend rejects the token (401), force a clean re-login.
  localStorage.removeItem('token');
  localStorage.removeItem('persist:root');
}



/**
 * Helper function to retrieve JWT token from localStorage
 * and attach it to Authorization headers.
 */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};


/**
 * Interface for Camera creation data
 * Must match backend camera validation schema
 */
export interface CreateCameraData {
  name: string;
  description?: string;
  type: 'ip' | 'analog' | 'usb';
  streamUrl: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  settings?: {
    resolution: string;
    fps: number;
    recordingEnabled: boolean;
  };
}

/**
 * Sends a POST request to create a new camera
 * @param cameraData - Camera object to store in DB
 */
export const addCamera = async (cameraData: CreateCameraData) => {
  const response = await fetch(`${API_URL}/cameras`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Attach auth token
    },
    body: JSON.stringify(cameraData),
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to add camera');
  }

  return data;
};

/**
 * Fetches all cameras from the backend
 */
export const getCameras = async () => {
  const response = await fetch(`${API_URL}/cameras`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch cameras');
  }

  // Backend returns: { success: true, data: [...] }
  return data.data;
};


/**
 * Updates camera status (online/offline/maintenance)
 * Backend: PATCH /api/cameras/:id/status
 */
export const setCameraStatus = async (
  cameraId: string,
  status: 'online' | 'offline' | 'maintenance'
) => {
  const response = await fetch(`${API_URL}/cameras/${cameraId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  if (response.status === 401) {
  clearAuthStorage();
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update camera status');
  }

  // backend returns { success: true, data: camera }
  return data.data;
};

/**
 * Deletes a camera (soft delete in backend)
 * Backend: DELETE /api/cameras/:id
 */
export const deleteCamera = async (cameraId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/cameras/${cameraId}`, {
    method: 'DELETE',
    headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    }, 
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete camera');
  }
};

// -----------------------------
// VMS Integration (Frontend API)
// -----------------------------

/**
 * VMS provider values must match the backend VmsServer model enum.
 */
export type VmsProvider = 'shinobi' | 'zoneminder' | 'agentdvr' | 'other';

export interface VmsServer {
  _id: string;
  name: string;
  provider: VmsProvider;
  baseUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVmsServerData {
  name: string;
  provider: VmsProvider;
  baseUrl: string;
  auth?: {
    /**
     * Shinobi needs BOTH:
     * - apiKey
     * - groupKey
     * These are stored in MongoDB and are never serialized back to the frontend
     * because VmsServer.ts strips `auth` in toJSON/toObject.
     */
    apiKey?: string;
    groupKey?: string;

    // Other providers may use username/password instead
    username?: string;
    password?: string;
  };
}

export interface VmsMonitor {
  mid?: string;
  id?: string;
  name?: string;
  title?: string;
  details?: string;
}

export interface UpdateVmsServerData {
  name?: string;
  provider?: VmsProvider;
  baseUrl?: string;
  auth?: {
    apiKey?: string;
    groupKey?: string;
    username?: string;
    password?: string;
  };
  isActive?: boolean;
}


/**
 * Small helper to parse JSON safely.
 * Why: backend always returns JSON, but if a proxy/error returns empty body
 * we don't want parsing to crash the UI.
 */
const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

/**
 * GET /api/vms/servers
 * Fetch list of active VMS servers.
 * Admin-only on backend (requires admin/super_admin JWT).
 */
export const getVmsServers = async (): Promise<VmsServer[]> => {
  const response = await fetch(`${API_URL}/vms/servers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch VMS servers');
  }

  return data.data;
};

/**
 * POST /api/vms/servers
 * Create/register a VMS server record in our DB.
 * Admin-only on backend (requires admin/super_admin JWT).
 */
export const createVmsServer = async (payload: CreateVmsServerData): Promise<VmsServer> => {
  const response = await fetch(`${API_URL}/vms/servers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create VMS server');
  }

  return data.data;
};

/**
 * PATCH /api/vms/servers/:id
 * Update VMS server details (including auth for providers like Shinobi).
 */
export const updateVmsServer = async (
  serverId: string,
  payload: UpdateVmsServerData
): Promise<VmsServer> => {
  const response = await fetch(`${API_URL}/vms/servers/${serverId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update VMS server');
  }

  return data.data;
};

/**
 * GET /api/vms/servers/:id/monitors
 * Fetch monitors from a VMS server (Shinobi).
 */
export const getVmsMonitors = async (serverId: string): Promise<VmsMonitor[]> => {
  const response = await fetch(`${API_URL}/vms/servers/${serverId}/monitors`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch VMS monitors');
  }

  return data.data;
};

/**
 * POST /api/vms/servers/:id/monitors/import
 * Batch-import monitors into cameras.
 */
export const importVmsMonitors = async (
  serverId: string,
  payload: {
    monitorIds?: string[];
    defaultLocation?: { coordinates: [number, number]; address?: string };
    source?: string;
  }
) => {
  const response = await fetch(`${API_URL}/vms/servers/${serverId}/monitors/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to import VMS monitors');
  }

  return data.data;
};

/**
 * DELETE /api/vms/servers/:id
 * Soft-removes a VMS server by marking it inactive.
 */
export const deleteVmsServer = async (serverId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/vms/servers/${serverId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete VMS server');
  }
};

/**
 * POST /api/cameras/:id/vms/connect
 * Connect a camera record to a chosen VMS server (mapping only for now).
 * Admin-only on backend (requires admin/super_admin JWT).
 */
export const connectCameraToVms = async (
  cameraId: string,
  payload: { serverId: string; monitorId?: string }
) => {
  const response = await fetch(`${API_URL}/cameras/${cameraId}/vms/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to connect camera to VMS');
  }

  return data.data;
};

/**
 * POST /api/cameras/:id/vms/disconnect
 * Clears camera.vms mapping.
 * Admin-only on backend (requires admin/super_admin JWT).
 */
export const disconnectCameraFromVms = async (cameraId: string) => {
  const response = await fetch(`${API_URL}/cameras/${cameraId}/vms/disconnect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
  clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to disconnect camera from VMS');
  }

  return data.data;
};

/**
 * GET /api/cameras/:id/vms/streams
 * Returns RTSP + VMS mapping + placeholders for live/playback URLs.
 * Auth-only on backend.
 */
export const getCameraVmsStreams = async (cameraId: string) => {
  const response = await fetch(`${API_URL}/cameras/${cameraId}/vms/streams`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
  clearAuthStorage();
  }
  
  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch camera stream info');
  }

  return data.data;
};

/**
 * POST /api/cameras/test-connection
 * Server-side reachability check for RTSP/HTTP stream URLs.
 */
export const testCameraConnection = async (payload: {
  streamUrl: string;
  mode?: 'rtsp' | 'vms';
  vmsServerId?: string;
  monitorId?: string;
}): Promise<{ ok: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/cameras/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to test stream URL');
  }

  return data;
};

/**
 * DELETE /api/cameras/source/:source
 * Bulk delete cameras by metadata.source.
 */
export const deleteCamerasBySource = async (source: string): Promise<void> => {
  const response = await fetch(`${API_URL}/cameras/source/${source}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (response.status === 401) {
    clearAuthStorage();
  }

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete cameras');
  }
};
