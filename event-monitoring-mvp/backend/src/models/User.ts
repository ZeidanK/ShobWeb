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
  phone?: string; // For phone authentication
  roles: UserRole[]; // Array of roles for flexible assignment
  authMethod: 'email_password' | 'phone_otp' | 'social_oauth' | 'anonymous';
  oauthProvider?: string;
  oauthId?: string;
  authentication: {
    failedAttempts: number;
    lockoutUntil?: Date;
    lastLoginAt?: Date;
    twoFactorEnabled: boolean;
  };
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
  isLocked: boolean;
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
  phone: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(phone: string) {
        return !phone || /^\+?[1-9]\d{1,14}$/.test(phone);
      },
      message: 'Invalid phone number format'
    }
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
    enum: ['email_password', 'phone_otp', 'social_oauth', 'anonymous'],
    default: 'email_password'
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
  authentication: {
    failedAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: Date,
    lastLoginAt: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ roles: 1 });
userSchema.index({ isActive: 1 });

// Virtual properties
userSchema.virtual('isLocked').get(function() {
  return this.authentication.lockoutUntil && this.authentication.lockoutUntil > new Date();
});

// Static methods
userSchema.statics.findByCredential = async function(credential: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  let query: any = {};
  
  if (emailRegex.test(credential)) {
    query = { email: credential.toLowerCase() };
  } else if (phoneRegex.test(credential)) {
    query = { phone: credential };
  } else {
    query = { username: credential };
  }
  
  return this.findOne(query).select('+password');
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has permission
userSchema.methods.hasPermission = function(resource: string, action: string): boolean {
  return this.permissions.some((permission: Permission) => 
    permission.resource === resource && 
    permission.action === action && 
    permission.granted
  );
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username || this.email || 'Unknown User';
});

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema);
