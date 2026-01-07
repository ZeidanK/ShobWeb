import mongoose, { Document, Schema } from 'mongoose';

/**
 * Enhanced Event interface with mobile support and EventType integration
 */
export interface IEvent extends Document {
  title: string;
  description?: string;
  type: string; // Legacy field for backward compatibility  
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'pending' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'dismissed';
  cameraId?: mongoose.Types.ObjectId;
  detectionId?: mongoose.Types.ObjectId;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
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
    author: mongoose.Types.ObjectId;
    timestamp: Date;
    noteType: 'general' | 'investigation' | 'resolution' | 'escalation';
    isInternal: boolean;
  }>;
  tags: string[];
  customFields: Map<string, any>;
  source: 'camera_system' | 'user_report' | 'ai_detection' | 'sensor_alert' | 'manual_entry' | 'mobile_app';
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

/**
 * Enhanced Event Schema with mobile support and backward compatibility
 */
const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters'],
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description must be less than 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: [
        'security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 
        'user_report', 'system_alert', 'motion_detected', 'person_detected', 
        'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other'
      ],
      message: 'Invalid event type'
    }
  },
  severity: {
    type: String,
    required: [true, 'Event severity is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical', 'emergency'],
      message: 'Invalid severity level'
    },
    default: 'medium'
  },
  priority: {
    type: Number,
    required: [true, 'Event priority is required'],
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  status: {
    type: String,
    required: [true, 'Event status is required'],
    enum: {
      values: ['pending', 'acknowledged', 'investigating', 'resolved', 'closed', 'dismissed'],
      message: 'Invalid event status'
    },
    default: 'pending'
  },
  cameraId: {
    type: Schema.Types.ObjectId,
    ref: 'Camera'
  },
  detectionId: {
    type: Schema.Types.ObjectId,
    ref: 'AIDetection'
  },
  location: {
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coordinates: number[]) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 &&
                 coordinates[1] >= -90 && coordinates[1] <= 90;
        },
        message: 'Location coordinates must be [longitude, latitude] within valid ranges'
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address must be less than 500 characters']
    },
    accuracy: {
      type: Number,
      min: [0, 'Location accuracy must be positive'],
      max: [10000, 'Location accuracy seems too high']
    }
  },
  detectionData: {
    confidence: {
      type: Number,
      min: [0, 'Confidence must be between 0 and 1'],
      max: [1, 'Confidence must be between 0 and 1']
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
      min: [0, 'Object count cannot be negative']
    },
    aiModel: {
      type: String,
      trim: true
    },
    detectionTimestamp: Date
  },
  media: {
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(images: string[]) {
          return images.length <= 10;
        },
        message: 'Too many images (max 10)'
      }
    },
    videos: {
      type: [String],
      default: [],
      validate: {
        validator: function(videos: string[]) {
          return videos.length <= 5;
        },
        message: 'Too many videos (max 5)'
      }
    },
    thumbnails: {
      type: [String],
      default: []
    },
    attachments: [{
      fileName: {
        type: String,
        required: true,
        trim: true
      },
      fileUrl: {
        type: String,
        required: true,
        trim: true
      },
      fileType: {
        type: String,
        required: true,
        trim: true
      },
      fileSize: {
        type: Number,
        required: true,
        min: [0, 'File size cannot be negative']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  reporter: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Reporter name must be less than 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(email: string) {
          return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(phone: string) {
          return !phone || /^\+?[1-9]\d{1,14}$/.test(phone);
        },
        message: 'Invalid phone number format'
      }
    },
    isAnonymous: {
      type: Boolean,
      required: [true, 'Anonymous flag is required'],
      default: false
    }
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  estimatedResolutionTime: Date,
  actualResolutionTime: Date,
  notes: [{
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [2000, 'Note content must be less than 2000 characters']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note author is required']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    noteType: {
      type: String,
      enum: ['general', 'investigation', 'resolution', 'escalation'],
      default: 'general'
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 20;
      },
      message: 'Too many tags (max 20)'
    }
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  source: {
    type: String,
    required: [true, 'Event source is required'],
    enum: {
      values: ['camera_system', 'user_report', 'ai_detection', 'sensor_alert', 'manual_entry', 'mobile_app'],
      message: 'Invalid event source'
    },
    default: 'manual_entry'
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
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution summary must be less than 1000 characters']
    },
    actions: {
      type: [String],
      default: []
    },
    preventiveMeasures: {
      type: [String],
      default: []
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    satisfactionRating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ severity: 1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ cameraId: 1 });
eventSchema.index({ 'reporter.userId': 1 });
eventSchema.index({ assignedTo: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ source: 1 });
eventSchema.index({ verified: 1 });
eventSchema.index({ publiclyVisible: 1 });

// Virtual fields
eventSchema.virtual('isResolved').get(function() {
  return ['resolved', 'closed'].includes(this.status);
});

eventSchema.virtual('isOverdue').get(function() {
  return this.estimatedResolutionTime && 
         this.estimatedResolutionTime < new Date() && 
         !this.isResolved;
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Auto-resolve timestamp
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.actualResolutionTime = new Date();
  }

  // Add to workflow
  if (this.isModified('status')) {
    this.workflow.push({
      status: this.status,
      timestamp: new Date(),
      userId: this.assignedTo || this.reporter.userId,
      notes: `Status changed to ${this.status}`
    } as any);
  }

  next();
});

// Instance methods
eventSchema.methods.addNote = function(content: string, author: mongoose.Types.ObjectId, type = 'general', isInternal = false) {
  this.notes.push({
    content,
    author,
    timestamp: new Date(),
    noteType: type,
    isInternal
  });
  return this.save();
};

eventSchema.methods.assign = function(userId: mongoose.Types.ObjectId, assignedBy?: mongoose.Types.ObjectId) {
  this.assignedTo = userId;
  this.workflow.push({
    status: 'assigned',
    timestamp: new Date(),
    userId: assignedBy || userId,
    notes: `Event assigned to user ${userId}`
  });
  return this.save();
};

export const Event = mongoose.model<IEvent>('Event', eventSchema);