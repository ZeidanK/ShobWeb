import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  type: string;
  subType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'pending' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'dismissed';
  cameraId?: mongoose.Types.ObjectId;
  detectionId?: mongoose.Types.ObjectId;
  location: {
    coordinates: [number, number];
    address?: string;
    accuracy?: number;
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
    images: string[];
    videos: string[];
    thumbnails: string[];
    attachments: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      uploadedAt: Date;
    }>;
  };
  reporter: {
    userId?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    reporterType?: 'FR' | 'CIVILIAN';
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
  customFields: Map<string, any>;
  source: 'camera_system' | 'user_report' | 'ai_detection' | 'sensor_alert' | 'manual_entry' | 'mobile_app';
  companyId?: mongoose.Types.ObjectId;
  verified: boolean;
  publiclyVisible: boolean;
  resolution: {
    summary?: string;
    actions: string[];
    preventiveMeasures?: string[];
    followUpRequired: boolean;
    satisfactionRating?: number;
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
      trim: true
    },
    subType: {
      type: String,
      trim: true
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
      required: false
    },
    detectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Detection',
      required: false
    },
    location: {
      coordinates: {
        type: [Number],
        required: true
      },
      address: String,
      accuracy: Number
    },
    detectionData: {
      confidence: {
        type: Number,
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
      aiModel: String,
      detectionTimestamp: Date
    },
    media: {
      images: [{
        type: String
      }],
      videos: [{
        type: String
      }],
      thumbnails: [{
        type: String
      }],
      attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: Date
      }]
    },
    reporter: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      phone: String,
      isAnonymous: {
        type: Boolean,
        default: false
      },
      reporterType: {
        type: String,
        enum: ['FR', 'CIVILIAN']
      }
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
    estimatedResolutionTime: Date,
    actualResolutionTime: Date,
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
      },
      noteType: {
        type: String,
        enum: ['general', 'investigation', 'resolution', 'escalation'],
        default: 'general'
      }
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag must be less than 50 characters']
    }],
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    source: {
      type: String,
      required: true,
      enum: ['camera_system', 'user_report', 'ai_detection', 'sensor_alert', 'manual_entry', 'mobile_app'],
      default: 'manual_entry'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    verified: {
      type: Boolean,
      default: false
    },
    publiclyVisible: {
      type: Boolean,
      default: false
    },
    resolution: {
      summary: String,
      actions: [{
        type: String
      }],
      preventiveMeasures: [{
        type: String
      }],
      followUpRequired: {
        type: Boolean,
        default: false
      },
      satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    workflow: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
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
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ assignedTo: 1 });
eventSchema.index({ source: 1 });
eventSchema.index({ 'reporter.phone': 1 });
eventSchema.index({ companyId: 1 });

// Compound indexes for common queries
eventSchema.index({ status: 1, createdAt: -1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ cameraId: 1, createdAt: -1 });
eventSchema.index({ source: 1, 'reporter.phone': 1, createdAt: -1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
