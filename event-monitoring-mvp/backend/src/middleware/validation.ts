import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationResult } from 'express-validator';

// Enhanced user registration validation supporting multiple auth methods
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    authMethod: Joi.string().valid('email_password', 'phone_otp', 'social_oauth').default('email_password'),
    role: Joi.string().valid('citizen', 'operator', 'admin', 'mobile_admin', 'super_admin').default('operator'),
    profile: Joi.object({
      firstName: Joi.string().max(50).optional(),
      lastName: Joi.string().max(50).optional(),
      department: Joi.string().max(100).optional(),
      timezone: Joi.string().default('UTC'),
      preferredLanguage: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).default('en')
    }).optional(),
    deviceInfo: Joi.object({
      platform: Joi.string().valid('ios', 'android', 'web').optional(),
      version: Joi.string().optional(),
      deviceToken: Joi.string().optional()
    }).optional()
  }).custom((value, helpers) => {
    // Validation based on auth method
    if (value.authMethod === 'email_password') {
      if (!value.email || !value.password) {
        return helpers.error('custom.emailPasswordRequired');
      }
    } else if (value.authMethod === 'phone_otp') {
      if (!value.phone) {
        return helpers.error('custom.phoneRequired');
      }
    }
    return value;
  }).messages({
    'custom.emailPasswordRequired': 'Email and password are required for email authentication',
    'custom.phoneRequired': 'Phone number is required for phone authentication'
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
    return;
  }
  next();
};

// Enhanced user login validation supporting multiple auth methods
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    credential: Joi.string().required().messages({
      'string.empty': 'Email, username, or phone number is required',
      'any.required': 'Email, username, or phone number is required'
    }),
    password: Joi.string().optional(),
    otp: Joi.string().length(6).pattern(/^\d+$/).optional(),
    authMethod: Joi.string().valid('email_password', 'phone_otp').optional(),
    deviceInfo: Joi.object({
      platform: Joi.string().valid('ios', 'android', 'web').optional(),
      version: Joi.string().optional(),
      deviceToken: Joi.string().optional()
    }).optional()
  }).custom((value, helpers) => {
    // At least password or OTP must be provided
    if (!value.password && !value.otp) {
      return helpers.error('custom.authRequired');
    }
    return value;
  }).messages({
    'custom.authRequired': 'Either password or OTP code is required'
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
    return;
  }
  next();
};

// Phone verification validation
export const validatePhoneVerification = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number with country code'
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
    return;
  }
  next();
};

// Send OTP validation
export const validateSendOTP = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number with country code'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
    return;
  }
  next();
};

// Change password validation
export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
    return;
  }
  next();
};

// Camera validation
export const validateCamera = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
    streamUrl: Joi.string().uri({ scheme: ['http', 'https', 'rtsp'] }).required(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().optional()
    }).required(),
    type: Joi.string().valid('ip', 'analog', 'usb').default('ip'),
    settings: Joi.object({
      resolution: Joi.string().default('1920x1080'),
      fps: Joi.number().min(1).max(60).default(30),
      recordingEnabled: Joi.boolean().default(false)
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

// Event validation
export const validateEvent = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid(
      'person_detected',
      'vehicle_detected',
      'motion_detected',
      'unauthorized_access',
      'other'
    ).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    cameraId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().optional()
    }).required(),
    detectionData: Joi.object({
      confidence: Joi.number().min(0).max(1).required(),
      boundingBox: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
        width: Joi.number().required(),
        height: Joi.number().required()
      }).optional(),
      objectCount: Joi.number().min(0).optional(),
      aiModel: Joi.string().optional()
    }).required(),
    media: Joi.object({
      imageUrl: Joi.string().uri().optional(),
      videoUrl: Joi.string().uri().optional(),
      thumbnailUrl: Joi.string().uri().optional()
    }).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

// User validation (for admin creating users)
export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'operator').required(),
    isActive: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

// General validation middleware for express-validator
export const validation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};