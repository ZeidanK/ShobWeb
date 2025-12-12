/**
 * Event Monitoring System - TypeScript Type Definitions
 * 
 * This file contains all the TypeScript interfaces and types used throughout
 * the Event Monitoring MVP application. These types ensure type safety and
 * provide clear contracts for data structures across frontend components.
 */

/**
 * User Interface Type
 * Represents a system user with authentication and role-based access
 * 
 * @interface User
 * @property {string} _id - Unique MongoDB ObjectId for the user
 * @property {string} username - Unique username for login
 * @property {string} email - User's email address
 * @property {string} role - User's role determining permissions ('admin' | 'operator')
 * @property {boolean} isActive - Whether the user account is active
 * @property {string} [lastLogin] - ISO timestamp of last successful login (optional)
 * @property {string} createdAt - ISO timestamp when user was created
 * @property {string} updatedAt - ISO timestamp when user was last modified
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Camera Interface Type
 * Represents a camera device in the monitoring system
 * 
 * @interface Camera
 * @property {string} _id - Unique MongoDB ObjectId for the camera
 * @property {string} name - Human-readable name for the camera
 * @property {string} [description] - Optional description of camera placement/purpose
 * @property {string} streamUrl - URL for accessing the camera's video stream
 * @property {Object} location - Geographic location data
 * @property {[number, number]} location.coordinates - [longitude, latitude] coordinates
 * @property {string} [location.address] - Human-readable address (optional)
 * @property {string} status - Current operational status of the camera
 * @property {string} type - Type of camera hardware connection
 * @property {Object} settings - Camera configuration settings
 * @property {string} settings.resolution - Video resolution (e.g., "1920x1080")
 * @property {number} settings.fps - Frames per second for video capture
 * @property {boolean} settings.recordingEnabled - Whether continuous recording is enabled
 * @property {boolean} isActive - Whether the camera is active in the system
 * @property {string} createdBy - User ID who created this camera entry
 * @property {string} createdAt - ISO timestamp when camera was added
 * @property {string} updatedAt - ISO timestamp when camera was last modified
 */
export interface Camera {
  _id: string;
  name: string;
  description?: string;
  streamUrl: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  type: 'ip' | 'analog' | 'usb';
  settings: {
    resolution: string;
    fps: number;
    recordingEnabled: boolean;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event Interface Type
 * Represents a security event detected by the AI monitoring system
 * 
 * @interface Event
 * @property {string} _id - Unique MongoDB ObjectId for the event
 * @property {string} title - Brief title describing the event
 * @property {string} [description] - Optional detailed description
 * @property {string} type - Category of event detected by AI
 * @property {string} severity - Priority level for response planning
 * @property {string} status - Current investigation/response status
 * @property {string} cameraId - ID of camera that captured this event
 * @property {Object} location - Geographic location where event occurred
 * @property {[number, number]} location.coordinates - [longitude, latitude] coordinates
 * @property {string} [location.address] - Human-readable address (optional)
 * @property {Object} detectionData - AI detection metadata
 * @property {number} detectionData.confidence - AI confidence score (0-1)
 */
export interface Event {
  _id: string;
  title: string;
  description?: string;
  type: 'person_detected' | 'vehicle_detected' | 'motion_detected' | 'unauthorized_access' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  cameraId: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  detectionData: {
    confidence: number;               // AI confidence score (0.0 to 1.0)
    boundingBox?: {                  // Object detection bounding box (optional)
      x: number;                     // X coordinate of top-left corner
      y: number;                     // Y coordinate of top-left corner  
      width: number;                 // Width of bounding box
      height: number;                // Height of bounding box
    };
    objectCount?: number;            // Number of objects detected (optional)
    aiModel?: string;                // AI model used for detection (optional)
  };
  media?: {                          // Associated media files (optional)
    imageUrl?: string;               // URL to captured image
    videoUrl?: string;               // URL to captured video clip
    thumbnailUrl?: string;           // URL to thumbnail image
  };
  assignedTo?: string;               // User ID assigned to handle this event (optional)
  acknowledgedBy?: string;           // User ID who acknowledged the event (optional)
  acknowledgedAt?: string;           // ISO timestamp when event was acknowledged (optional)
  resolvedBy?: string;               // User ID who resolved the event (optional)
  resolvedAt?: string;               // ISO timestamp when event was resolved (optional)
  notes: Array<{                     // Investigation notes array
    content: string;                 // Note content
    createdBy: string;               // User ID who created the note
    createdAt: string;               // ISO timestamp when note was created
  }>;
  tags: string[];                    // Array of tags for categorization
  createdAt: string;                 // ISO timestamp when event was created
  updatedAt: string;                 // ISO timestamp when event was last updated
}

/**
 * API Response Types
 * Standard response formats for all API endpoints
 */

/**
 * Generic API Response
 * Standard wrapper for all API responses
 * 
 * @interface ApiResponse
 * @template T - Type of data being returned
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [message] - Optional human-readable message
 * @property {T} [data] - Response data (optional, type varies)
 * @property {string} [error] - Error message if operation failed (optional)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paginated API Response
 * For endpoints that return paginated results
 * 
 * @interface PaginatedResponse
 * @template T - Type of items in the paginated array
 * @extends ApiResponse<T[]>
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number (1-based)
 * @property {number} pagination.limit - Items per page
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.pages - Total number of pages
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Authentication Types
 * Types related to user authentication and registration
 */

/**
 * Login Request
 * Data structure for user login requests
 * 
 * @interface LoginRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration Request
 * Data structure for new user registration
 * 
 * @interface RegisterRequest
 * @property {string} username - Desired username
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} [role] - Optional role assignment (defaults to 'operator')
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'operator';
}

/**
 * Authentication Response
 * Response data after successful login/registration
 * 
 * @interface AuthResponse
 * @property {string} token - JWT authentication token
 * @property {User} user - Complete user data object
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Form Types
 * Types for form data structures used in the UI
 */

/**
 * Camera Form Data
 * Form structure for creating/editing cameras
 * 
 * @interface CameraForm
 * @property {string} name - Camera name
 * @property {string} [description] - Optional description
 * @property {string} streamUrl - Video stream URL
 * @property {Object} location - Geographic location
 */
export interface CameraForm {
  name: string;
  description?: string;
  streamUrl: string;
  location: {
    coordinates: [number, number];   // [longitude, latitude]
    address?: string;                // Optional human-readable address
  };
  type: 'ip' | 'analog' | 'usb';    // Camera connection type
  settings: {
    resolution: string;              // Video resolution (e.g., "1920x1080")
    fps: number;                     // Frames per second
    recordingEnabled: boolean;       // Whether continuous recording is enabled
  };
}

/**
 * Event Filters
 * Filter criteria for querying events
 * 
 * @interface EventFilters
 * @property {string} [status] - Filter by event status (optional)
 * @property {string} [type] - Filter by event type (optional)
 * @property {string} [severity] - Filter by severity level (optional)
 * @property {string} [cameraId] - Filter by specific camera (optional)
 * @property {string} [startDate] - Filter events from this date (optional, ISO string)
 * @property {string} [endDate] - Filter events until this date (optional, ISO string)
 * @property {number} [page] - Page number for pagination (optional)
 * @property {number} [limit] - Items per page for pagination (optional)
 */
export interface EventFilters {
  status?: string;
  type?: string;
  severity?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Map and Geographic Types
 * Types related to map visualization and geographic data
 */

/**
 * Map Viewport Configuration
 * Defines the current view state of the map
 * 
 * @interface MapViewport
 * @property {number} latitude - Center latitude of the map view
 * @property {number} longitude - Center longitude of the map view
 * @property {number} zoom - Zoom level of the map (higher = more zoomed in)
 */
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

/**
 * Map Marker Data
 * Represents a marker (camera or event) displayed on the map
 * 
 * @interface MarkerData
 * @property {string} id - Unique identifier for the marker
 * @property {[number, number]} coordinates - [longitude, latitude] position
 * @property {string} type - Type of marker ('camera' for cameras, 'event' for events)
 * @property {Camera | Event} data - Associated data object (Camera or Event)
 */
export interface MarkerData {
  id: string;
  coordinates: [number, number];
  type: 'camera' | 'event';
  data: Camera | Event;
}