import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

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