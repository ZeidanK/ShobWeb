import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

/**
 * Interface for User document - Web application users only
 * 
 * Mobile users authenticate through their own app and are not stored here.
 * We only receive event submissions from mobile users, not their auth data.
 */
export interface IUser extends Document {
  username?: string;
  email: string; // Required for web users
  password: string; // Required for web authentication
  roles: UserRole[]; // Array of roles for flexible assignment
  authMethod: 'email' | 'oauth';
  oauthProvider?: string;
  oauthId?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    department?: string;
  };
  permissions: Permission[];
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User roles for web application
export type UserRole = 'operator' | 'admin' | 'mobile_admin' | 'super_admin';

// Permission structure for granular access control
export interface Permission {
  resource: string;
  action: string;
  granted: boolean;
  conditions?: {
    ownOnly?: boolean;
    timeRestriction?: string;
    locationRestriction?: string;
  };
}
/**
 * User Schema for web application users only
 * 
 * Mobile authentication is handled separately - we only receive events from mobile users
 */
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  roles: [{
    type: String,
    enum: ['operator', 'admin', 'mobile_admin', 'super_admin'],
    default: 'operator'
  }],
  authMethod: {
    type: String,
    enum: ['email', 'oauth'],
    default: 'email'
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'microsoft', 'github']
  },
  oauthId: String,
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: String,
    department: String
  },
  permissions: [{
    resource: { type: String, required: true },
    action: { type: String, required: true },
    granted: { type: Boolean, default: true },
    conditions: {
      ownOnly: Boolean,
      timeRestriction: String,
      locationRestriction: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: Date,
  lastLoginAt: Date
}, {
  timestamps: true
});
        maxlength: [50, 'First name cannot exceed 50 characters']
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
      },
      avatar: {
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Avatar must be a valid URL'
        }
      },
      department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot exceed 100 characters']
      },
      location: {
        coordinates: {
          type: [Number],
          validate: {
            validator: function(coordinates: number[]) {
              return !coordinates || (coordinates.length === 2 && 
                     coordinates[0] >= -180 && coordinates[0] <= 180 &&
                     coordinates[1] >= -90 && coordinates[1] <= 90);
            },
            message: 'Location coordinates must be [longitude, latitude] within valid ranges'
          }
        },
        address: {
          type: String,
          trim: true,
          maxlength: [200, 'Address cannot exceed 200 characters']
        },
        accuracy: {
          type: Number,
          min: [0, 'Location accuracy must be positive']
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      preferredLanguage: {
        type: String,
        default: 'en',
        match: [/^[a-z]{2}(-[A-Z]{2})?$/, 'Language code must be in format "en" or "en-US"']
      }
    },
    permissions: {
      granted: {
        type: [Schema.Types.ObjectId],
        ref: 'Permission',
        default: []
      },
      inherited: {
        type: [Schema.Types.ObjectId],
        ref: 'Permission',
        default: []
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    mobileSettings: {
      deviceTokens: {
        type: [String],
        default: []
      },
      appVersion: {
        type: String,
        match: [/^\d+\.\d+\.\d+$/, 'App version must be in format "1.0.0"']
      },
      osVersion: {
        type: String
      },
      lastActiveLocation: {
        coordinates: {
          type: [Number],
          validate: {
            validator: function(coordinates: number[]) {
              return !coordinates || (coordinates.length === 2 && 
                     coordinates[0] >= -180 && coordinates[0] <= 180 &&
                     coordinates[1] >= -90 && coordinates[1] <= 90);
            },
            message: 'Last active location must be [longitude, latitude] within valid ranges'
          }
        },
        timestamp: {
          type: Date
        }
      }
    },
    authentication: {
      phoneVerified: {
        type: Boolean,
        default: false
      },
      emailVerified: {
        type: Boolean,
        default: false
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      lastPasswordChange: {
        type: Date
      },
      failedAttempts: {
        type: Number,
        default: 0,
        max: [10, 'Failed attempts cannot exceed 10']
      },
      lockoutUntil: {
        type: Date
      },
      otpSecret: {
        type: String,
        select: false
      },
      recoveryTokens: {
        type: [String],
        select: false,
        default: []
      }
    },
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      source: {
        type: String,
        required: [true, 'User source is required'],
        enum: {
          values: ['admin_created', 'self_registered', 'mobile_app', 'system_import'],
          message: '{VALUE} is not a valid user source'
        },
        default: 'self_registered'
      },
      tags: {
        type: [String],
        default: []
      },
      notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
      }
    },
    usage: {
      eventsCreated: {
        type: Number,
        default: 0,
        min: [0, 'Events created count cannot be negative']
      },
      eventsAssigned: {
        type: Number,
        default: 0,
        min: [0, 'Events assigned count cannot be negative']
      },
      lastActivityAt: {
        type: Date
      },
      loginCount: {
        type: Number,
        default: 0,
        min: [0, 'Login count cannot be negative']
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance optimization
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ 'authentication.phoneVerified': 1 });
userSchema.index({ 'authentication.emailVerified': 1 });
userSchema.index({ 'profile.location': '2dsphere' });
userSchema.index({ lastLogin: -1 });

// Validation: Ensure at least username OR phone exists
userSchema.pre('validate', function() {
  if (!this.username && !this.phone) {
    this.invalidate('username', 'Either username or phone number is required');
  }
  
  // Ensure authentication method matches available credentials
  if (this.authMethod === 'email_password' && (!this.email || !this.password)) {
    this.invalidate('authMethod', 'Email and password required for email_password authentication');
  }
  
  if (this.authMethod === 'phone_otp' && !this.phone) {
    this.invalidate('authMethod', 'Phone number required for phone_otp authentication');
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.authentication.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update inherited permissions when role changes
userSchema.pre('save', async function() {
  if (this.isModified('role')) {
    try {
      const RolePermission = mongoose.model('RolePermission');
      const rolePermissions = await RolePermission.find({ 
        role: this.role, 
        isActive: true 
      }).populate('permission');
      
      this.permissions.inherited = rolePermissions.map(rp => rp.permission._id);
      this.permissions.lastUpdated = new Date();
    } catch (error) {
      console.error('Error updating inherited permissions:', error);
    }
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    throw new Error('Password not set for this user');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has specific permission
userSchema.methods.hasPermission = async function(permissionName: string, context?: any): Promise<boolean> {
  try {
    const Permission = mongoose.model('Permission');
    
    // Get all user permissions (granted + inherited)
    const allPermissionIds = [...this.permissions.granted, ...this.permissions.inherited];
    const permissions = await Permission.find({ 
      _id: { $in: allPermissionIds },
      name: permissionName
    });
    
    if (permissions.length === 0) {
      return false;
    }
    
    // Check if any permission applies to the given context
    return permissions.some(permission => {
      return permission.appliesToConditions(context || {});
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Get all permissions for user's role
userSchema.methods.getRolePermissions = async function(): Promise<mongoose.Types.ObjectId[]> {
  try {
    const RolePermission = mongoose.model('RolePermission');
    const rolePermissions = await RolePermission.find({ 
      role: this.role, 
      isActive: true 
    });
    return rolePermissions.map(rp => rp.permission);
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return [];
  }
};

// Update last activity timestamp
userSchema.methods.updateLastActivity = async function(): Promise<void> {
  this.usage.lastActivityAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim() || this.username || 'Anonymous';
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return this.authentication.lockoutUntil && this.authentication.lockoutUntil > new Date();
});

// Static method to find user by username, email, or phone
userSchema.statics.findByCredential = function(credential: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  let query = {};
  
  if (emailRegex.test(credential)) {
    query = { email: credential.toLowerCase() };
  } else if (phoneRegex.test(credential)) {
    query = { phone: credential };
  } else {
    query = { username: credential };
  }
  
  return this.findOne({ ...query, isActive: true }).select('+password +authentication.otpSecret');
};

// Static method to get users by role
userSchema.statics.getByRole = function(role: string, includeInactive = false) {
  const query: any = { role };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ 'profile.lastName': 1, 'profile.firstName': 1, username: 1 });
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.authentication.otpSecret;
  delete obj.authentication.recoveryTokens;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema);