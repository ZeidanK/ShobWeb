import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  type: 'security_incident' | 'traffic_violation' | 'emergency' | 'maintenance_needed' | 'user_report' | 'system_alert' | 'motion_detected' | 'person_detected' | 'vehicle_detected' | 'unauthorized_access' | 'suspicious_activity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest, 5 = lowest
  status: 'pending' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'dismissed';
  cameraId?: mongoose.Types.ObjectId; // Optional for user reports
  detectionId?: mongoose.Types.ObjectId; // Link to original detection if promoted
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
    accuracy?: number; // GPS accuracy in meters
  };
  detectionData?: {
    confidence?: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    objectCount?: number;
    aiModel?: string;
    detectionTimestamp?: Date;
  };
  media: {
    images: string[]; // Array of image URLs
    videos: string[]; // Array of video URLs
    thumbnails: string[]; // Array of thumbnail URLs
    attachments: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      uploadedAt: Date;
    }>;
  };
  reporter: {
    userId?: mongoose.Types.ObjectId; // If reported by registered user
    name?: string; // For anonymous reports
    email?: string;
    phone?: string;
    isAnonymous: boolean;
  };
  assignedTo?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  estimatedResolutionTime?: Date;
  actualResolutionTime?: Date;
  notes: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    noteType: 'general' | 'investigation' | 'resolution' | 'escalation';
  }>;
  tags: string[];
  customFields: Map<string, any>; // Flexible custom data
  source: 'camera_system' | 'user_report' | 'ai_detection' | 'sensor_alert' | 'manual_entry' | 'mobile_app';
  verified: boolean; // Whether the event has been verified by an operator
  publiclyVisible: boolean; // Whether visible in public feeds
  resolution: {
    summary?: string;
    actions: string[];
    preventiveMeasures?: string[];
    followUpRequired: boolean;
    satisfactionRating?: number; // 1-5 if applicable
  };
  workflow: Array<{
    status: string;
    timestamp: Date;
    userId: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title must be less than 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description must be less than 1000 characters']
    },
    type: {
      type: String,
      required: true,
      enum: ['security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 'user_report', 'system_alert', 'motion_detected', 'person_detected', 'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other']
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical', 'emergency'],
      default: 'medium'
    },
    priority: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
      default: 3
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'acknowledged', 'investigating', 'resolved', 'closed', 'dismissed'],
      default: 'pending'
    },
    cameraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camera',
      required: false // Optional for user reports
    },
    detectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Detection',
      required: false
    },
    location: {
      type: {
        coordinates: {
          type: [Number],
          required: true
        },
        address: String
      },
      required: true,
      index: '2dsphere'
    },
    detectionData: {
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      objectCount: {
        type: Number,
        default: 1,
        min: 0
      },
      aiModel: String
    },
    media: {
      imageUrl: String,
      videoUrl: String,
      thumbnailUrl: String
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    notes: [{
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Note content must be less than 500 characters']
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag must be less than 50 characters']
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
eventSchema.index({ cameraId: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ severity: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ location: '2dsphere' });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ assignedTo: 1 });

// Compound indexes for common queries
eventSchema.index({ status: 1, createdAt: -1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ cameraId: 1, createdAt: -1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);