export interface User {
    id: string;
    username: string;
    hashedPassword: string;
    role: 'admin' | 'operator';
}

export interface Camera {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    streamUrl: string;
}

export interface Event {
    id: string;
    timestamp: Date;
    cameraId: string;
    eventType: 'person_detected' | 'vehicle_detected' | 'suspicious_behavior' | 'abandoned_object';
    snapshotUrl?: string;
    status: 'new' | 'acknowledged' | 'resolved' | 'closed';
}