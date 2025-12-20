import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for Event document with flexible EventType system
 * 
 * Updated to use dynamic EventType references instead of hardcoded enums,
 * supporting mobile citizen reporting and enhanced workflow management.
 */
export interface IEvent extends Document {
  title: string;
  description?: string;
  eventType: {
    typeId: mongoose.Types.ObjectId; // Reference to EventType
    name: string; // Cached for performance
    category: string; // Cached for performance
  };
  // Legacy type field for backward compatibility - will be deprecated
  type?: 'security_incident' | 'traffic_violation' | 'emergency' | 'maintenance_needed' | 'user_report' | 'system_alert' | 'motion_detected' | 'person_detected' | 'vehicle_detected' | 'unauthorized_access' | 'suspicious_activity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest, 5 = lowest
  status: 'pending' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'dismissed';
  cameraId?: mongoose.Types.ObjectId; // Optional for user reports
  detectionId?: mongoose.Types.ObjectId; // Link to original detection if promoted
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
    accuracy?: number; // GPS accuracy in meters
    source?: 'gps' | 'network' | 'manual' | 'camera'; // Location data source
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
      uploadedBy?: mongoose.Types.ObjectId;
    }>;
  };
  reporter: {
    userId?: mongoose.Types.ObjectId; // If reported by registered user
    name?: string; // For anonymous reports
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    sessionId?: string; // For anonymous mobile users
    deviceInfo?: {
      platform: 'ios' | 'android' | 'web';
      version?: string;
      deviceId?: string;
    };
  };
  assignedTo?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  mobileSubmission?: {
    submittedOffline: boolean;
    submissionAttempts: number;
    clientTimestamp: Date;
    syncedAt?: Date;
    networkType?: 'wifi' | 'cellular' | 'unknown';
  };
  validation: {
    requiresApproval: boolean;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    rejectionReason?: string;
    autoApproved: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enhanced Event Schema with EventType integration
 * 
 * Supports both new EventType references and legacy type field for
 * backward compatibility during migration.
 */
const eventSchema = new Schema<IEvent>(
  {
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
    eventType: {
      typeId: {
        type: Schema.Types.ObjectId,
        ref: 'EventType',
        required: function(this: IEvent) {
          // Either eventType.typeId or legacy type field is required
          return !this.type;
        }
      },
      name: {
        type: String,
        required: function(this: IEvent) {
          return !!this.eventType?.typeId;
        }
      },
      category: {
        type: String,
        required: function(this: IEvent) {
          return !!this.eventType?.typeId;
        }
      }
    },
    // Legacy type field - will be deprecated but kept for backward compatibility
    type: {
      type: String,
      enum: ['security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 'user_report', 'system_alert', 'motion_detected', 'person_detected', 'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other'],
      required: function(this: IEvent) {
        // Either legacy type or new eventType.typeId is required
        return !this.eventType?.typeId;
      }
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: ['low', 'medium', 'high', 'critical', 'emergency'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium'
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be between 1 and 5'],
      max: [5, 'Priority must be between 1 and 5'],
      default: 3
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'acknowledged', 'investigating', 'resolved', 'closed', 'dismissed'],
        message: '{VALUE} is not a valid status'
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
        maxlength: [300, 'Address cannot exceed 300 characters']
      },
      accuracy: {
        type: Number,
        min: [0, 'Location accuracy must be positive'],
        max: [10000, 'Location accuracy seems unrealistic (max 10km)']
      },
      source: {
        type: String,
        enum: ['gps', 'network', 'manual', 'camera'],
        default: 'gps'
      }
    },
    detectionData: {
      confidence: {
        type: Number,
        min: [0, 'Confidence cannot be negative'],
        max: [1, 'Confidence cannot exceed 1']
      },
      boundingBox: {
        x: { type: Number, min: [0, 'X coordinate must be non-negative'] },
        y: { type: Number, min: [0, 'Y coordinate must be non-negative'] },
        width: { type: Number, min: [0, 'Width must be positive'] },
        height: { type: Number, min: [0, 'Height must be positive'] }
      },
      objectCount: {
        type: Number,
        min: [0, 'Object count cannot be negative']
      },
      aiModel: {
        type: String,
        trim: true
      },
      detectionTimestamp: {
        type: Date
      }
    },
    media: {
      images: {
        type: [String],
        default: [],
        validate: {
          validator: function(urls: string[]) {
            return urls.every(url => /^https?:\/\/.+/.test(url));
          },
          message: 'All image URLs must be valid HTTP/HTTPS URLs'
        }
      },
      videos: {
        type: [String],
        default: [],
        validate: {
          validator: function(urls: string[]) {
            return urls.every(url => /^https?:\/\/.+/.test(url));
          },
          message: 'All video URLs must be valid HTTP/HTTPS URLs'
        }
      },
      thumbnails: {
        type: [String],
        default: []
      },
      attachments: [{
        fileName: {
          type: String,
          required: [true, 'File name is required'],
          trim: true
        },
        fileUrl: {
          type: String,
          required: [true, 'File URL is required'],
          match: [/^https?:\/\/.+/, 'File URL must be valid HTTP/HTTPS URL']
        },
        fileType: {
          type: String,
          required: [true, 'File type is required']
        },
        fileSize: {
          type: Number,
          required: [true, 'File size is required'],
          min: [0, 'File size cannot be negative']
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
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
        maxlength: [100, 'Reporter name cannot exceed 100 characters']
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
      },
      phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
      },
      isAnonymous: {
        type: Boolean,
        required: [true, 'Anonymous flag is required'],
        default: false
      },
      sessionId: {
        type: String,
        sparse: true
      },
      deviceInfo: {
        platform: {
          type: String,
          enum: ['ios', 'android', 'web']
        },
        version: {
          type: String
        },
        deviceId: {
          type: String
        }
      }
    },
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
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    estimatedResolutionTime: {
      type: Date
    },
    actualResolutionTime: {
      type: Date
    },
    notes: [{
      content: {
        type: String,
        required: [true, 'Note content is required'],
        maxlength: [2000, 'Note content cannot exceed 2000 characters']
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Note creator is required']
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
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.every(tag => tag.length <= 50);
        },
        message: 'Each tag must be less than 50 characters'
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
        message: '{VALUE} is not a valid event source'
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
        maxlength: [1000, 'Resolution summary cannot exceed 1000 characters']
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
        min: [1, 'Satisfaction rating must be between 1 and 5'],
        max: [5, 'Satisfaction rating must be between 1 and 5']
      }
    },
    workflow: [{
      status: {
        type: String,
        required: [true, 'Workflow status is required']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Workflow user is required']
      },
      notes: {
        type: String,
        maxlength: [1000, 'Workflow notes cannot exceed 1000 characters']
      }
    }],
    mobileSubmission: {
      submittedOffline: {
        type: Boolean,
        default: false
      },
      submissionAttempts: {
        type: Number,
        default: 1,
        min: [1, 'Submission attempts must be at least 1']
      },
      clientTimestamp: {
        type: Date
      },
      syncedAt: {
        type: Date
      },
      networkType: {
        type: String,
        enum: ['wifi', 'cellular', 'unknown'],
        default: 'unknown'
      }
    },
    validation: {
      requiresApproval: {
        type: Boolean,
        default: false
      },
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: {
        type: Date
      },
      rejectedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectedAt: {
        type: Date
      },
      rejectionReason: {
        type: String,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
      },
      autoApproved: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Enhanced indexes for performance optimization
eventSchema.index({ location: '2dsphere' });
eventSchema.index({ 'eventType.typeId': 1 });
eventSchema.index({ 'eventType.category': 1 });
eventSchema.index({ type: 1 }); // Legacy support
eventSchema.index({ status: 1 });
eventSchema.index({ severity: 1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ assignedTo: 1 });
eventSchema.index({ 'reporter.userId': 1 });
eventSchema.index({ source: 1 });
eventSchema.index({ verified: 1, publiclyVisible: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ updatedAt: -1 });

// Compound indexes for common queries
eventSchema.index({ status: 1, severity: 1 });
eventSchema.index({ 'eventType.category': 1, status: 1 });
eventSchema.index({ assignedTo: 1, status: 1 });
eventSchema.index({ cameraId: 1, createdAt: -1 });

// Pre-save middleware to populate EventType cache fields
eventSchema.pre('save', async function() {
  if (this.eventType?.typeId && this.isModified('eventType.typeId')) {
    try {
      const EventType = mongoose.model('EventType');
      const eventType = await EventType.findById(this.eventType.typeId);
      if (eventType) {
        this.eventType.name = eventType.name;
        this.eventType.category = eventType.category;
        
        // Auto-populate severity and priority from EventType defaults
        if (this.isNew && !this.isModified('severity')) {
          this.severity = eventType.defaultSeverity;
        }
        if (this.isNew && !this.isModified('priority')) {
          this.priority = eventType.defaultPriority;
        }
      }
    } catch (error) {
      console.error('Error populating EventType cache fields:', error);
    }
  }
});

// Pre-save middleware to add workflow entry on status changes
eventSchema.pre('save', async function() {
  if (this.isModified('status') && !this.isNew) {
    this.workflow.push({
      status: this.status,
      timestamp: new Date(),
      userId: this.modifiedBy || this.assignedTo,
      notes: `Status changed to ${this.status}`
    });
  }
});

// Virtual for getting event type hierarchy
eventSchema.virtual('eventTypeHierarchy').get(function() {
  if (this.eventType?.name) {
    return this.eventType.name;
  }
  return this.type || 'Unknown';
});

// Virtual for checking if event is overdue
eventSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedResolutionTime) return false;
  return new Date() > this.estimatedResolutionTime && !this.resolvedAt;
});

// Virtual for getting resolution time in minutes
eventSchema.virtual('resolutionTimeMinutes').get(function() {
  if (!this.resolvedAt) return null;
  const createdAt = this.createdAt.getTime();
  const resolvedAt = this.resolvedAt.getTime();
  return Math.round((resolvedAt - createdAt) / (1000 * 60));
});

// Static method to find events by EventType
eventSchema.statics.findByEventType = function(eventTypeId: string, options: any = {}) {
  return this.find({ 
    'eventType.typeId': eventTypeId,
    ...options 
  }).populate('eventType.typeId', 'name category parentType');
};

// Static method for backward compatibility - find by legacy type
eventSchema.statics.findByLegacyType = function(type: string, options: any = {}) {
  return this.find({ 
    type: type,
    ...options 
  });
};

// Instance method to check if event can be modified by user
eventSchema.methods.canBeModifiedBy = function(userId: string, userRole: string) {
  // Super admin and admin can modify any event
  if (['super_admin', 'admin'].includes(userRole)) {
    return true;
  }
  
  // Reporter can modify their own unassigned pending events
  if (this.reporter.userId?.toString() === userId && 
      this.status === 'pending' && 
      !this.assignedTo) {
    return true;
  }
  
  // Assigned operator can modify their assigned events
  if (this.assignedTo?.toString() === userId && 
      ['operator', 'mobile_admin'].includes(userRole)) {
    return true;
  }
  
  return false;
};

export const Event = mongoose.model<IEvent>('Event', eventSchema);