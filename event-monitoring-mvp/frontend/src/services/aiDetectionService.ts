// AI Detection service for frontend integration

export interface AIDetection {
  _id: string;
  cameraId: {
    _id: string;
    name: string;
    location: {
      coordinates: [number, number];
      address?: string;
    };
  };
  detectionId: string;
  timestamp: string;
  type: 'person' | 'vehicle' | 'unknown_object' | 'motion';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  location: {
    coordinates: [number, number];
    estimatedPosition?: [number, number];
    address?: string;
  };
  metadata: {
    aiModel: string;
    processingTime: number;
    frameNumber: number;
    objectProperties?: {
      color?: string;
      size?: string;
      direction?: string;
      speed?: number;
    };
  };
  status: 'pending_review' | 'dismissed' | 'promoted_to_event';
  reviewedBy?: {
    _id: string;
    username: string;
  };
  reviewedAt?: string;
  promotedEventId?: string;
  snapshots: {
    fullFrame: string;
    croppedObject: string;
    thumbnail: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DetectionFilters {
  status?: string;
  type?: string;
  cameraId?: string;
  minConfidence?: number;
  maxConfidence?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DetectionStats {
  statusDistribution: Array<{
    _id: string;
    count: number;
    avgConfidence: number;
  }>;
  typeDistribution: Array<{
    _id: string;
    count: number;
    avgConfidence: number;
  }>;
  confidenceDistribution: Array<{
    _id: string | number;
    count: number;
    types: string[];
  }>;
  timeline: Array<{
    _id: string;
    count: number;
    types: string[];
  }>;
}

class AIDetectionService {
  private baseUrl = '/api/detections';

  // Fetch all detections with filtering
  async fetchDetections(filters: DetectionFilters = {}): Promise<{
    success: boolean;
    data: AIDetection[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detections');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching detections:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Fetch detections within radius
  async fetchDetectionsInRadius(
    lat: number, 
    lng: number, 
    radius: number = 1000,
    filters: Partial<DetectionFilters> = {}
  ): Promise<{
    success: boolean;
    data: AIDetection[];
    center: { lat: number; lng: number };
    radius: number;
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`${this.baseUrl}/radius?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detections in radius');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching detections in radius:', error);
      return {
        success: false,
        data: [],
        center: { lat, lng },
        radius,
        error: error.message
      };
    }
  }

  // Fetch single detection
  async fetchDetection(id: string): Promise<{
    success: boolean;
    data?: AIDetection;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detection');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching detection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Promote detection to event
  async promoteToEvent(
    detectionId: string, 
    eventData?: {
      type?: string;
      severity?: string;
      description?: string;
      metadata?: any;
    }
  ): Promise<{
    success: boolean;
    data?: { detection: AIDetection; event: any };
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${detectionId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ eventData })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to promote detection');
      }

      return result;
    } catch (error: any) {
      console.error('Error promoting detection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Dismiss detection
  async dismissDetection(
    detectionId: string, 
    reason?: string
  ): Promise<{
    success: boolean;
    data?: AIDetection;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${detectionId}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to dismiss detection');
      }

      return result;
    } catch (error: any) {
      console.error('Error dismissing detection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fetch detection statistics
  async fetchDetectionStats(
    startDate?: string,
    endDate?: string,
    cameraId?: string
  ): Promise<{
    success: boolean;
    data?: DetectionStats;
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (cameraId) queryParams.append('cameraId', cameraId);

      const response = await fetch(`${this.baseUrl}/stats?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detection statistics');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching detection statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create mock detection data for development
  generateMockDetections(cameras: any[]): AIDetection[] {
    const mockDetections: AIDetection[] = [];
    
    cameras.forEach((camera, index) => {
      // Create 2-3 detections per camera
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const types = ['person', 'vehicle', 'motion', 'unknown_object'] as const;
        const statuses = ['pending_review', 'dismissed', 'promoted_to_event'] as const;
        
        mockDetections.push({
          _id: `detection_${camera._id}_${i}`,
          cameraId: {
            _id: camera._id,
            name: camera.name,
            location: camera.location
          },
          detectionId: `AI_${Date.now()}_${index}_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          type: types[Math.floor(Math.random() * types.length)],
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
          boundingBox: {
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: Math.random() * 200 + 50,
            height: Math.random() * 300 + 100
          },
          location: {
            coordinates: [
              camera.location.coordinates[0] + (Math.random() - 0.5) * 0.001,
              camera.location.coordinates[1] + (Math.random() - 0.5) * 0.001
            ],
            address: camera.location.address
          },
          metadata: {
            aiModel: ['YOLO-v8', 'ResNet-50', 'MobileNet-v3'][Math.floor(Math.random() * 3)],
            processingTime: Math.random() * 100 + 50,
            frameNumber: Math.floor(Math.random() * 10000),
            objectProperties: {
              color: ['red', 'blue', 'white', 'black', 'gray'][Math.floor(Math.random() * 5)],
              size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
            }
          },
          status: statuses[Math.floor(Math.random() * statuses.length)],
          snapshots: {
            fullFrame: `https://picsum.photos/800/600?random=${index}_${i}_1`,
            croppedObject: `https://picsum.photos/200/200?random=${index}_${i}_2`,
            thumbnail: `https://picsum.photos/100/100?random=${index}_${i}_3`
          },
          createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    return mockDetections.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const aiDetectionService = new AIDetectionService();
export default aiDetectionService;
