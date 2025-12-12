import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  type: 'person_detected' | 'vehicle_detected' | 'motion_detected' | 'unauthorized_access' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  cameraId: mongoose.Types.ObjectId;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  detectionData: {
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    objectCount?: number;
    aiModel?: string;
  };
  media: {
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  assignedTo?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  notes: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  tags: string[];
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
      enum: ['person_detected', 'vehicle_detected', 'motion_detected', 'unauthorized_access', 'other']
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'acknowledged', 'investigating', 'resolved', 'closed'],
      default: 'open'
    },
    cameraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camera',
      required: [true, 'Camera ID is required']
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