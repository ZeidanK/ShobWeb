import express from 'express';
import { AIDetectionController } from '../controllers/aiDetectionController';
import { auth } from '../middleware/auth';
import { validation } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const promoteValidation = [
  body('eventData.type')
    .optional()
    .isIn(['motion', 'person_detected', 'vehicle_detected', 'intrusion', 'anomaly'])
    .withMessage('Invalid event type'),
  body('eventData.severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('eventData.description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
];

const radiusValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage('Radius must be between 1 and 50000 meters'),
];

const createDetectionValidation = [
  body('cameraId')
    .isMongoId()
    .withMessage('Invalid camera ID'),
  body('detectionId')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Detection ID is required'),
  body('timestamp')
    .isISO8601()
    .withMessage('Invalid timestamp'),
  body('type')
    .isIn(['person', 'vehicle', 'unknown_object', 'motion'])
    .withMessage('Invalid detection type'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  body('boundingBox.x')
    .isFloat({ min: 0 })
    .withMessage('Invalid bounding box X coordinate'),
  body('boundingBox.y')
    .isFloat({ min: 0 })
    .withMessage('Invalid bounding box Y coordinate'),
  body('boundingBox.width')
    .isFloat({ min: 0 })
    .withMessage('Invalid bounding box width'),
  body('boundingBox.height')
    .isFloat({ min: 0 })
    .withMessage('Invalid bounding box height'),
  body('metadata.aiModel')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('AI model name is required'),
  body('metadata.processingTime')
    .isFloat({ min: 0 })
    .withMessage('Invalid processing time'),
  body('metadata.frameNumber')
    .isInt({ min: 0 })
    .withMessage('Invalid frame number'),
  body('snapshots.fullFrame')
    .isURL()
    .withMessage('Invalid full frame URL'),
  body('snapshots.croppedObject')
    .isURL()
    .withMessage('Invalid cropped object URL'),
  body('snapshots.thumbnail')
    .isURL()
    .withMessage('Invalid thumbnail URL'),
];

// Routes

/**
 * @route   GET /api/detections
 * @desc    Get all AI detections with filtering and pagination
 * @access  Private
 */
router.get('/', auth, AIDetectionController.getDetections);

/**
 * @route   GET /api/detections/radius
 * @desc    Get detections within radius of a point
 * @access  Private
 */
router.get('/radius', 
  auth, 
  radiusValidation, 
  validation, 
  AIDetectionController.getDetectionsInRadius
);

/**
 * @route   GET /api/detections/stats
 * @desc    Get detection statistics
 * @access  Private
 */
router.get('/stats', auth, AIDetectionController.getDetectionStats);

/**
 * @route   GET /api/detections/:id
 * @desc    Get single detection by ID
 * @access  Private
 */
router.get('/:id', auth, AIDetectionController.getDetectionById);

/**
 * @route   POST /api/detections
 * @desc    Create new detection (for AI service)
 * @access  Private (AI Service)
 */
router.post('/', 
  auth, 
  createDetectionValidation, 
  validation, 
  AIDetectionController.createDetection
);

/**
 * @route   POST /api/detections/:id/promote
 * @desc    Promote detection to event
 * @access  Private
 */
router.post('/:id/promote', 
  auth, 
  promoteValidation, 
  validation, 
  AIDetectionController.promoteToEvent
);

/**
 * @route   POST /api/detections/:id/dismiss
 * @desc    Dismiss detection as false positive
 * @access  Private
 */
router.post('/:id/dismiss', 
  auth, 
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long'),
  validation,
  AIDetectionController.dismissDetection
);

export default router;