import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationResult } from 'express-validator';

// User registration validation
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'operator').default('operator')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

// User login validation
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
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

// Mobile API: Verify First Responder validation
export const validateVerifyFR = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    phone: Joi.string().required().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }
  next();
};

// Mobile API: Create Report validation
export const validateCreateReport = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    phone: Joi.string().required().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    type: Joi.string().required().messages({
      'string.empty': 'Event type is required',
      'any.required': 'Event type is required'
    }),
    subType: Joi.string().optional().allow(''),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical', 'emergency').default('medium'),
    description: Joi.string().max(1000).optional().allow(''),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required().messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
      longitude: Joi.number().min(-180).max(180).required().messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      })
    }).required().messages({
      'any.required': 'Location is required'
    }),
    media: Joi.object({
      images: Joi.array().items(Joi.string().uri()).optional(),
      videos: Joi.array().items(Joi.string().uri()).optional()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }
  next();
};