/**
 * Camera Service
 * Handles all API communication regarding cameras.
 *
 * FILE: frontend/src/services/cameraService.ts
 */

const API_URL = 'http://localhost:5000/api'; // Backend base URL

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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete camera');
  }
};
