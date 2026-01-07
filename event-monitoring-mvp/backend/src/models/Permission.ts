import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for Permission document
 * 
 * This model defines granular permissions that can be assigned to users,
 * allowing super admins to create flexible authorization systems without
 * code changes. Supports resource-specific permissions and dynamic assignment.
 */
export interface IPermission extends Document {
  name: string;
  description?: string;
  resource: string; // e.g., 'events', 'cameras', 'users', 'reports', 'eventTypes'
  actions: string[]; // e.g., ['read', 'create', 'update', 'delete', 'assign', 'approve']
  scope: 'global' | 'location' | 'department' | 'self' | 'assigned';
  conditions?: {
    locations?: mongoose.Types.ObjectId[]; // Geographic restrictions
    departments?: string[]; // Department-based restrictions
    severity?: ('low' | 'medium' | 'high' | 'critical' | 'emergency')[]; // Severity limitations
    timeRestrictions?: {
      allowedHours: { start: number; end: number }[];
      allowedDays: number[]; // 0-6 (Sunday-Saturday)
      timezone: string;
    };
    ipWhitelist?: string[]; // IP-based restrictions
  };
  metadata: {
    createdBy: mongoose.Types.ObjectId;
    lastModifiedBy: mongoose.Types.ObjectId;
    isSystemPermission: boolean; // Cannot be deleted by users
    version: number;
    tags: string[];
  };
  usage: {
    assignedToUsers: number;
    assignedToRoles: number;
    lastAssigned?: Date;
  };
}

/**
 * Permission Schema Definition
 * 
 * Defines granular permissions with flexible conditions and scope controls
 * for implementing fine-grained authorization systems.
 */
const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Permission name must be at least 3 characters'],
    maxlength: [100, 'Permission name cannot exceed 100 characters'],
    match: [/^[a-zA-Z0-9_.-]+$/, 'Permission name can only contain letters, numbers, underscores, dots, and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: {
      values: [
        'events', 'cameras', 'users', 'reports', 'eventTypes', 
        'permissions', 'analytics', 'settings', 'notifications',
        'mobile_users', 'ai_detections', 'media', 'locations'
      ],
      message: '{VALUE} is not a valid resource'
    }
  },
  actions: {
    type: [String],
    required: [true, 'At least one action must be specified'],
    validate: {
      validator: function(actions: string[]) {
        const validActions = [
          'read', 'create', 'update', 'delete', 'assign', 'approve',
          'reject', 'escalate', 'export', 'import', 'archive', 
          'restore', 'comment', 'share', 'download', 'upload'
        ];
        return actions.length > 0 && actions.every(action => validActions.includes(action));
      },
      message: 'Invalid action in actions array'
    }
  },
  scope: {
    type: String,
    required: [true, 'Scope is required'],
    enum: {
      values: ['global', 'location', 'department', 'self', 'assigned'],
      message: '{VALUE} is not a valid scope'
    },
    default: 'self'
  },
  conditions: {
    locations: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      default: []
    },
    departments: {
      type: [String],
      default: []
    },
    severity: {
      type: [String],
      enum: ['low', 'medium', 'high', 'critical', 'emergency'],
      default: []
    },
    timeRestrictions: {
      allowedHours: [{
        start: {
          type: Number,
          min: [0, 'Hour must be between 0 and 23'],
          max: [23, 'Hour must be between 0 and 23']
        },
        end: {
          type: Number,
          min: [0, 'Hour must be between 0 and 23'],
          max: [23, 'Hour must be between 0 and 23']
        }
      }],
      allowedDays: {
        type: [Number],
        validate: {
          validator: function(days: number[]) {
            return days.every(day => day >= 0 && day <= 6);
          },
          message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    ipWhitelist: {
      type: [String],
      validate: {
        validator: function(ips: string[]) {
          const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
          return ips.every(ip => ipRegex.test(ip) || cidrRegex.test(ip));
        },
        message: 'Invalid IP address or CIDR notation in whitelist'
      }
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
    isSystemPermission: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be positive']
    },
    tags: {
      type: [String],
      default: []
    }
  },
  usage: {
    assignedToUsers: {
      type: Number,
      default: 0,
      min: [0, 'Assigned to users count cannot be negative']
    },
    assignedToRoles: {
      type: Number,
      default: 0,
      min: [0, 'Assigned to roles count cannot be negative']
    },
    lastAssigned: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
PermissionSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ resource: 1, actions: 1 });
PermissionSchema.index({ scope: 1 });
PermissionSchema.index({ 'metadata.isSystemPermission': 1 });

// Prevent deletion of system permissions
PermissionSchema.pre('deleteOne', { document: true, query: false }, async function() {
  if (this.metadata.isSystemPermission) {
    throw new Error(`Cannot delete system permission '${this.name}'`);
  }
  
  // Check if permission is assigned to any users or roles
  if (this.usage.assignedToUsers > 0 || this.usage.assignedToRoles > 0) {
    throw new Error(`Cannot delete permission '${this.name}' as it is currently assigned to users or roles`);
  }
});

// Update version on modification
PermissionSchema.pre('save', function() {
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }
});

// Static method to get permissions by resource
PermissionSchema.statics.getByResource = function(resource: string, actions?: string[]) {
  const query: any = { resource };
  if (actions && actions.length > 0) {
    query.actions = { $in: actions };
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to get all available resources
PermissionSchema.statics.getResources = function() {
  return this.distinct('resource');
};

// Instance method to check if permission applies to specific conditions
PermissionSchema.methods.appliesToConditions = function(checkConditions: {
  location?: string;
  department?: string;
  severity?: string;
  currentTime?: Date;
  userIp?: string;
}) {
  // Check location restrictions
  if (this.conditions?.locations?.length > 0 && checkConditions.location) {
    if (!this.conditions.locations.includes(checkConditions.location)) {
      return false;
    }
  }
  
  // Check department restrictions
  if (this.conditions?.departments?.length > 0 && checkConditions.department) {
    if (!this.conditions.departments.includes(checkConditions.department)) {
      return false;
    }
  }
  
  // Check severity restrictions
  if (this.conditions?.severity?.length > 0 && checkConditions.severity) {
    if (!this.conditions.severity.includes(checkConditions.severity as any)) {
      return false;
    }
  }
  
  // Check time restrictions
  if (this.conditions?.timeRestrictions && checkConditions.currentTime) {
    const time = checkConditions.currentTime;
    const hour = time.getHours();
    const day = time.getDay();
    
    if (this.conditions.timeRestrictions.allowedDays?.length > 0) {
      if (!this.conditions.timeRestrictions.allowedDays.includes(day)) {
        return false;
      }
    }
    
    if (this.conditions.timeRestrictions.allowedHours?.length > 0) {
      const isInAllowedHours = this.conditions.timeRestrictions.allowedHours.some(
        range => hour >= range.start && hour <= range.end
      );
      if (!isInAllowedHours) {
        return false;
      }
    }
  }
  
  // Check IP restrictions
  if (this.conditions?.ipWhitelist?.length > 0 && checkConditions.userIp) {
    // Simple IP check (production should use more sophisticated IP matching)
    if (!this.conditions.ipWhitelist.includes(checkConditions.userIp)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Interface for Role-Permission Assignment
 * 
 * Links roles to permissions with optional condition overrides
 */
export interface IRolePermission extends Document {
  role: 'citizen' | 'operator' | 'admin' | 'mobile_admin' | 'super_admin';
  permission: mongoose.Types.ObjectId;
  conditionOverrides?: {
    scope?: 'global' | 'location' | 'department' | 'self' | 'assigned';
    locations?: mongoose.Types.ObjectId[];
    departments?: string[];
  };
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  isActive: boolean;
}

const RolePermissionSchema = new Schema<IRolePermission>({
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin'],
      message: '{VALUE} is not a valid role'
    }
  },
  permission: {
    type: Schema.Types.ObjectId,
    ref: 'Permission',
    required: [true, 'Permission is required']
  },
  conditionOverrides: {
    scope: {
      type: String,
      enum: ['global', 'location', 'department', 'self', 'assigned']
    },
    locations: {
      type: [Schema.Types.ObjectId],
      ref: 'Location'
    },
    departments: {
      type: [String]
    }
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by user is required']
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate role-permission assignments
RolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
export const RolePermission = mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);