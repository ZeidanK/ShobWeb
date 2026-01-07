import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Event, IEvent } from '../models/Event';
import mongoose from 'mongoose';

// Validation rules for creating events
export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),

  body('type')
    .isIn(['security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 'user_report', 'system_alert', 'motion_detected', 'person_detected', 'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other'])
    .withMessage('Invalid event type'),

  body('severity')
    .isIn(['low', 'medium', 'high', 'critical', 'emergency'])
    .withMessage('Invalid severity level'),

  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid coordinate ranges');
      }
      return true;
    }),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),

  body('cameraId')
    .optional()
    .isMongoId()
    .withMessage('Invalid camera ID'),

  body('detectionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid detection ID'),

  body('reporter.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reporter name must be less than 100 characters'),

  body('reporter.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('source')
    .optional()
    .isIn(['camera_system', 'user_report', 'ai_detection', 'sensor_alert', 'manual_entry', 'mobile_app'])
    .withMessage('Invalid source'),
];

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      type,
      severity,
      priority = 3,
      location,
      cameraId,
      detectionId,
      detectionData,
      media,
      reporter,
      tags = [],
      source = 'user_report',
      publiclyVisible = false,
      customFields
    } = req.body;

    // Set reporter information
    const reporterData = {
      userId: req.user?.id, // From auth middleware
      name: reporter?.name,
      email: reporter?.email,
      phone: reporter?.phone,
      isAnonymous: reporter?.isAnonymous || false
    };

    const eventData: Partial<IEvent> = {
      title,
      description,
      type,
      severity,
      priority,
      location,
      cameraId: cameraId ? new mongoose.Types.ObjectId(cameraId) : undefined,
      detectionId: detectionId ? new mongoose.Types.ObjectId(detectionId) : undefined,
      detectionData,
      media: {
        images: media?.images || [],
        videos: media?.videos || [],
        thumbnails: media?.thumbnails || [],
        attachments: media?.attachments || []
      },
      reporter: reporterData,
      tags,
      source,
      publiclyVisible,
      customFields: customFields ? new Map(Object.entries(customFields)) : new Map(),
      status: 'pending',
      verified: false
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    // Populate references for response
    await savedEvent.populate([
      { path: 'cameraId', select: 'name location' },
      { path: 'assignedTo', select: 'username email' },
      { path: 'reporter.userId', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent
    });

  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Get all events with filtering, pagination, and search
// @route   GET /api/events
// @access  Private
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query filters
    const filter: any = {};

    // Add other filters as needed
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    const events = await Event.find(filter)
      .populate('cameraId', 'name location')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);
    const pageNum = page;
    const limitNum = limit;

    res.json({
      success: true,
      count: events.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).populate('camera', 'name description');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('camera', 'name');

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update event status
// @route   PATCH /api/events/:id/status
// @access  Private
export const updateEventStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Update status and related fields
    event.status = status;
    if (notes) event.notes = notes;
    
    // Set timestamps based on status
    switch (status) {
      case 'acknowledged':
        event.acknowledgedAt = new Date();
        event.acknowledgedBy = req.user?.userId;
        break;
      case 'investigating':
        if (!event.acknowledgedAt) {
          event.acknowledgedAt = new Date();
          event.acknowledgedBy = req.user?.userId;
        }
        break;
      case 'resolved':
        event.resolvedAt = new Date();
        event.resolvedBy = req.user?.userId;
        break;
      case 'closed':
        if (!event.resolvedAt) {
          event.resolvedAt = new Date();
          event.resolvedBy = req.user?.userId;
        }
        break;
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id).populate('camera', 'name');

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private
export const getEventStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    // Aggregate statistics
    const stats = await Event.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: '$status',
          },
          bySeverity: {
            $push: '$severity',
          },
          byType: {
            $push: '$type',
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      byStatus: [],
      bySeverity: [],
      byType: [],
    };

    // Count by categories
    const statusCounts = result.byStatus.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const severityCounts = result.bySeverity.reduce((acc: any, severity: string) => {
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    const typeCounts = result.byType.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        period,
        total: result.total,
        byStatus: statusCounts,
        bySeverity: severityCounts,
        byType: typeCounts,
      },
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};