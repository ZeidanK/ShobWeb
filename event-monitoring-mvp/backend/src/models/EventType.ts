import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for Event Type document
 * 
 * This model supports a flexible hierarchical event type system where
 * types can have subtypes, allowing for dynamic management by mobile
 * teams and administrators without code changes.
 */
export interface IEventType extends Document {
  name: string;
  description?: string;
  category: 'security' | 'traffic' | 'emergency' | 'maintenance' | 'social' | 'environmental' | 'infrastructure' | 'other';
  parentType?: mongoose.Types.ObjectId; // Reference to parent type for subtypes
  isActive: boolean;
  isPublic: boolean; // Can be used by citizen reporters
  requiresVerification: boolean; // Needs operator approval
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  defaultPriority: 1 | 2 | 3 | 4 | 5;
  requiredFields: string[]; // Array of required field names for this event type
  allowedRoles: string[]; // Which user roles can create events of this type
  autoAssignmentRules?: {
    severity?: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
    location?: {
      type: 'Point';
      coordinates: [number, number];
      radius: number; // In meters
    };
    timeRange?: {
      startHour: number; // 0-23
      endHour: number; // 0-23
    };
    assignTo?: mongoose.Types.ObjectId; // User ID to auto-assign
  };
  metadata: {
    createdBy: mongoose.Types.ObjectId;
    lastModifiedBy: mongoose.Types.ObjectId;
    version: number;
    tags: string[];
    externalId?: string; // For mobile team integration
  };
  statistics: {
    totalEvents: number;
    lastUsed?: Date;
    avgResolutionTime?: number; // In minutes
  };
}

/**
 * Event Type Schema Definition
 * 
 * Supports hierarchical event types with flexible validation rules,
 * auto-assignment capabilities, and comprehensive metadata tracking.
 */
const EventTypeSchema = new Schema<IEventType>({
  name: {
    type: String,
    required: [true, 'Event type name is required'],
    trim: true,
    minlength: [2, 'Event type name must be at least 2 characters'],
    maxlength: [100, 'Event type name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['security', 'traffic', 'emergency', 'maintenance', 'social', 'environmental', 'infrastructure', 'other'],
      message: '{VALUE} is not a valid category'
    }
  },
  parentType: {
    type: Schema.Types.ObjectId,
    ref: 'EventType',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  requiresVerification: {
    type: Boolean,
    default: true
  },
  defaultSeverity: {
    type: String,
    required: [true, 'Default severity is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical', 'emergency'],
      message: '{VALUE} is not a valid severity level'
    },
    default: 'medium'
  },
  defaultPriority: {
    type: Number,
    required: [true, 'Default priority is required'],
    min: [1, 'Priority must be between 1 and 5'],
    max: [5, 'Priority must be between 1 and 5'],
    default: 3
  },
  requiredFields: {
    type: [String],
    default: ['title', 'location']
  },
  allowedRoles: {
    type: [String],
    required: [true, 'At least one allowed role must be specified'],
    validate: {
      validator: function(roles: string[]) {
        const validRoles = ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin'];
        return roles.every(role => validRoles.includes(role)) && roles.length > 0;
      },
      message: 'Invalid user role in allowedRoles array'
    }
  },
  autoAssignmentRules: {
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'emergency']
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(coordinates: number[]) {
            return coordinates && coordinates.length === 2;
          },
          message: 'Location coordinates must be [longitude, latitude]'
        }
      },
      radius: {
        type: Number,
        min: [0, 'Radius must be positive']
      }
    },
    timeRange: {
      startHour: {
        type: Number,
        min: [0, 'Start hour must be between 0 and 23'],
        max: [23, 'Start hour must be between 0 and 23']
      },
      endHour: {
        type: Number,
        min: [0, 'End hour must be between 0 and 23'],
        max: [23, 'End hour must be between 0 and 23']
      }
    },
    assignTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Last modified by user is required']
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be positive']
    },
    tags: {
      type: [String],
      default: []
    },
    externalId: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  statistics: {
    totalEvents: {
      type: Number,
      default: 0,
      min: [0, 'Total events cannot be negative']
    },
    lastUsed: {
      type: Date
    },
    avgResolutionTime: {
      type: Number,
      min: [0, 'Average resolution time cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
EventTypeSchema.index({ name: 1, parentType: 1 }, { unique: true });
EventTypeSchema.index({ category: 1 });
EventTypeSchema.index({ isActive: 1, isPublic: 1 });
EventTypeSchema.index({ allowedRoles: 1 });
EventTypeSchema.index({ 'metadata.externalId': 1 }, { sparse: true });
EventTypeSchema.index({ 'autoAssignmentRules.location': '2dsphere' });

// Virtual for getting all subtypes
EventTypeSchema.virtual('subtypes', {
  ref: 'EventType',
  localField: '_id',
  foreignField: 'parentType'
});

// Virtual for getting full hierarchical path
EventTypeSchema.virtual('fullPath').get(function() {
  if (this.parentType) {
    return `${this.parentType.name || 'Unknown'} > ${this.name}`;
  }
  return this.name;
});

// Middleware to prevent deletion of event types that are in use
EventTypeSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const Event = mongoose.model('Event');
  const eventsUsingType = await Event.countDocuments({ 
    $or: [
      { 'eventType.typeId': this._id },
      { type: this.name } // Backward compatibility check
    ]
  });
  
  if (eventsUsingType > 0) {
    throw new Error(`Cannot delete event type '${this.name}' as it is being used by ${eventsUsingType} events`);
  }
});

// Middleware to update version number on modification
EventTypeSchema.pre('save', function() {
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }
});

// Static method to get event types by category
EventTypeSchema.statics.getByCategory = function(category: string, includeInactive = false) {
  const query: any = { category };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).populate('parentType', 'name').sort({ name: 1 });
};

// Static method to get public event types for mobile app
EventTypeSchema.statics.getPublicTypes = function() {
  return this.find({ 
    isActive: true, 
    isPublic: true,
    allowedRoles: { $in: ['citizen'] }
  }).populate('parentType', 'name').sort({ category: 1, name: 1 });
};

// Instance method to check if user can use this event type
EventTypeSchema.methods.canBeUsedBy = function(userRole: string) {
  return this.isActive && this.allowedRoles.includes(userRole);
};

// Instance method to get complete hierarchy
EventTypeSchema.methods.getHierarchy = async function() {
  const hierarchy = [this.name];
  let current = this;
  
  while (current.parentType) {
    current = await this.model('EventType').findById(current.parentType);
    if (current) {
      hierarchy.unshift(current.name);
    } else {
      break;
    }
  }
  
  return hierarchy.join(' > ');
};

export const EventType = mongoose.model<IEventType>('EventType', EventTypeSchema);