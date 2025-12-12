// Shared data service for consistent mock data across components
// This ensures all components see the same cameras until real API integration is complete

import { Camera } from '../types/index';

export interface SecurityEvent {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  camera: string;
  cameraName?: string;
  timestamp: string;
  description: string;
  resolved: boolean;
  metadata?: {
    confidence?: number;
    duration?: number;
    objectCount?: number;
  };
}

// Shared mock cameras data - used by ALL components
export const MOCK_CAMERAS: Camera[] = [
  {
    _id: '1',
    name: 'Front Gate Camera',
    description: 'Main entrance monitoring',
    streamUrl: 'rtsp://192.168.1.100:554/stream',
    status: 'online',
    type: 'ip',
    location: {
      coordinates: [-74.0060, 40.7128], // NYC coordinates
      address: '123 Main St, New York, NY',
    },
    settings: {
      resolution: '1920x1080',
      fps: 30,
      recordingEnabled: true,
    },
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Parking Lot Camera',
    description: 'Vehicle monitoring area',
    streamUrl: 'rtsp://192.168.1.101:554/stream',
    status: 'online',
    type: 'ip',
    location: {
      coordinates: [-74.0070, 40.7138],
      address: '125 Main St, New York, NY',
    },
    settings: {
      resolution: '1920x1080',
      fps: 25,
      recordingEnabled: false,
    },
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Side Entrance Camera',
    description: 'Secondary access point',
    streamUrl: 'rtsp://192.168.1.102:554/stream',
    status: 'offline',
    type: 'ip',
    location: {
      coordinates: [-74.0050, 40.7118],
      address: '121 Main St, New York, NY',
    },
    settings: {
      resolution: '1280x720',
      fps: 20,
      recordingEnabled: true,
    },
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Shared mock events data - tied to the exact camera coordinates above
export const MOCK_EVENTS: SecurityEvent[] = [
  {
    _id: 'evt1',
    type: 'person_detected',
    severity: 'medium',
    location: {
      coordinates: [-74.0060, 40.7128], // EXACTLY same as Front Gate Camera
      address: '123 Main St, New York, NY',
    },
    camera: '1',
    cameraName: 'Front Gate Camera',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    description: 'Person detected at main entrance',
    resolved: false,
    metadata: {
      confidence: 0.95,
      duration: 30,
      objectCount: 1,
    },
  },
  {
    _id: 'evt2',
    type: 'motion',
    severity: 'low',
    location: {
      coordinates: [-74.0070, 40.7138], // EXACTLY same as Parking Lot Camera
      address: '125 Main St, New York, NY',
    },
    camera: '2',
    cameraName: 'Parking Lot Camera',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    description: 'Vehicle movement in parking area',
    resolved: true,
    metadata: {
      confidence: 0.87,
      duration: 45,
    },
  },
  {
    _id: 'evt3',
    type: 'intrusion',
    severity: 'high',
    location: {
      coordinates: [-74.0050, 40.7118], // EXACTLY same as Side Entrance Camera
      address: '121 Main St, New York, NY',
    },
    camera: '3',
    cameraName: 'Side Entrance Camera',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    description: 'Unauthorized access attempt detected',
    resolved: false,
    metadata: {
      confidence: 0.92,
      duration: 120,
      objectCount: 1,
    },
  },
];

// API service function that tries real API first, falls back to consistent mock data
export const fetchCamerasData = async (): Promise<Camera[]> => {
  try {
    const response = await fetch('/api/cameras', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('Using real camera data from API');
        return result.data;
      }
    }
  } catch (apiError) {
    console.log('API not available, using consistent mock data:', apiError);
  }
  
  console.log('Using shared mock camera data');
  return MOCK_CAMERAS;
};

export const fetchEventsData = async (): Promise<SecurityEvent[]> => {
  try {
    const response = await fetch('/api/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('Using real event data from API');
        return result.data;
      }
    }
  } catch (apiError) {
    console.log('API not available, using consistent mock events:', apiError);
  }
  
  console.log('Using shared mock event data');
  return MOCK_EVENTS;
};