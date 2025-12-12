import { Request, Response } from 'express';
import Event from '../models/Event';
import Camera from '../models/Camera';
import { IEvent } from '../models/Event';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      severity,
      cameraId,
      startDate,
      endDate,
    } = req.query;

    // Build filter
    const filter: any = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (cameraId) filter.camera = cameraId;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(filter)
      .populate('camera', 'name')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Event.countDocuments(filter);

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

// @desc    Create event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      type,
      severity,
      camera,
      detectionData,
      metadata,
    } = req.body;

    // Verify camera exists
    const cameraDoc = await Camera.findById(camera);
    if (!cameraDoc) {
      res.status(400).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    const event = await Event.create({
      title,
      type,
      severity: severity || 'medium',
      camera,
      detectionData,
      metadata,
      timestamp: new Date(),
      status: 'open',
    });

    // Populate camera info
    const populatedEvent = await Event.findById(event._id).populate('camera', 'name');

    res.status(201).json({
      success: true,
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Create event error:', error);
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