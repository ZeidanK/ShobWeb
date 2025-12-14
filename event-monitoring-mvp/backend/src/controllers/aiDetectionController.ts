import { Request, Response } from 'express';
import { AIDetection, IAIDetection } from '../models/AIDetection';
import { Event } from '../models/Event';
import { Camera } from '../models/Camera';
import mongoose from 'mongoose';

export class AIDetectionController {
  
  // Get all detections with filtering and pagination
  static async getDetections(req: Request, res: Response) {
    try {
      const {
        status,
        type,
        cameraId,
        minConfidence,
        maxConfidence,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      // Build filter query
      const filter: any = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (cameraId) {
        filter.cameraId = cameraId;
      }
      
      if (minConfidence || maxConfidence) {
        filter.confidence = {};
        if (minConfidence) filter.confidence.$gte = parseFloat(minConfidence as string);
        if (maxConfidence) filter.confidence.$lte = parseFloat(maxConfidence as string);
      }
      
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate as string);
        if (endDate) filter.timestamp.$lte = new Date(endDate as string);
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with population
      const detections = await AIDetection.find(filter)
        .populate('cameraId', 'name location streamUrl')
        .populate('reviewedBy', 'username')
        .populate('promotedEventId', 'type severity')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const total = await AIDetection.countDocuments(filter);

      res.json({
        success: true,
        data: detections,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      });

    } catch (error: any) {
      console.error('Error fetching detections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch detections',
        error: error.message
      });
    }
  }

  // Get detections within radius of a point
  static async getDetectionsInRadius(req: Request, res: Response) {
    try {
      const { lat, lng, radius = 1000 } = req.query;
      const { status, type, minConfidence } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const coordinates: [number, number] = [
        parseFloat(lng as string),
        parseFloat(lat as string)
      ];

      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (minConfidence) filters.confidence = { $gte: parseFloat(minConfidence as string) };

      const detections = await AIDetection.findInRadius(
        coordinates,
        parseInt(radius as string),
        filters
      ).populate('cameraId', 'name location');

      res.json({
        success: true,
        data: detections,
        center: { lat: parseFloat(lat as string), lng: parseFloat(lng as string) },
        radius: parseInt(radius as string)
      });

    } catch (error: any) {
      console.error('Error fetching detections in radius:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch detections in radius',
        error: error.message
      });
    }
  }

  // Get single detection by ID
  static async getDetectionById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid detection ID'
        });
      }

      const detection = await AIDetection.findById(id)
        .populate('cameraId', 'name location streamUrl')
        .populate('reviewedBy', 'username')
        .populate('promotedEventId');

      if (!detection) {
        return res.status(404).json({
          success: false,
          message: 'Detection not found'
        });
      }

      res.json({
        success: true,
        data: detection
      });

    } catch (error: any) {
      console.error('Error fetching detection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch detection',
        error: error.message
      });
    }
  }

  // Promote detection to event
  static async promoteToEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { eventData } = req.body;
      const userId = (req as any).user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid detection ID'
        });
      }

      const detection = await AIDetection.findById(id).populate('cameraId');

      if (!detection) {
        return res.status(404).json({
          success: false,
          message: 'Detection not found'
        });
      }

      if (detection.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: 'Only pending detections can be promoted'
        });
      }

      // Create new event from detection
      const newEventData = {
        type: eventData?.type || detection.type,
        severity: eventData?.severity || 'medium',
        location: detection.location,
        camera: detection.cameraId._id,
        timestamp: detection.timestamp,
        description: eventData?.description || `AI detected ${detection.type} with ${Math.round(detection.confidence * 100)}% confidence`,
        resolved: false,
        metadata: {
          aiDetectionId: detection._id,
          confidence: detection.confidence,
          boundingBox: detection.boundingBox,
          aiModel: detection.metadata.aiModel,
          ...eventData?.metadata
        },
        createdBy: userId
      };

      const event = new Event(newEventData);
      await event.save();

      // Update detection status
      detection.status = 'promoted_to_event';
      detection.reviewedBy = userId;
      detection.reviewedAt = new Date();
      detection.promotedEventId = event._id;
      await detection.save();

      res.status(201).json({
        success: true,
        message: 'Detection promoted to event successfully',
        data: {
          detection,
          event
        }
      });

    } catch (error: any) {
      console.error('Error promoting detection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to promote detection',
        error: error.message
      });
    }
  }

  // Dismiss detection as false positive
  static async dismissDetection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid detection ID'
        });
      }

      const detection = await AIDetection.findById(id);

      if (!detection) {
        return res.status(404).json({
          success: false,
          message: 'Detection not found'
        });
      }

      if (detection.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: 'Only pending detections can be dismissed'
        });
      }

      await detection.dismiss(userId, reason);

      res.json({
        success: true,
        message: 'Detection dismissed successfully',
        data: detection
      });

    } catch (error: any) {
      console.error('Error dismissing detection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to dismiss detection',
        error: error.message
      });
    }
  }

  // Get detection statistics
  static async getDetectionStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, cameraId } = req.query;

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      // Build match stage for aggregation
      const matchStage: any = {};
      if (dateRange) {
        matchStage.timestamp = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }
      if (cameraId) {
        matchStage.cameraId = new mongoose.Types.ObjectId(cameraId as string);
      }

      const [statusStats, typeStats, confidenceStats, timelineStats] = await Promise.all([
        // Status distribution
        AIDetection.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgConfidence: { $avg: '$confidence' }
            }
          }
        ]),

        // Type distribution
        AIDetection.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              avgConfidence: { $avg: '$confidence' }
            }
          }
        ]),

        // Confidence distribution
        AIDetection.aggregate([
          { $match: matchStage },
          {
            $bucket: {
              groupBy: '$confidence',
              boundaries: [0, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0],
              default: 'other',
              output: {
                count: { $sum: 1 },
                types: { $addToSet: '$type' }
              }
            }
          }
        ]),

        // Timeline data (by hour for last 24h, by day for longer periods)
        AIDetection.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: dateRange && 
                    (dateRange.end.getTime() - dateRange.start.getTime()) > 7 * 24 * 60 * 60 * 1000 
                    ? '%Y-%m-%d' : '%Y-%m-%d %H:00',
                  date: '$timestamp'
                }
              },
              count: { $sum: 1 },
              types: { $addToSet: '$type' }
            }
          },
          { $sort: { '_id': 1 } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          statusDistribution: statusStats,
          typeDistribution: typeStats,
          confidenceDistribution: confidenceStats,
          timeline: timelineStats,
          dateRange: dateRange || { start: null, end: null }
        }
      });

    } catch (error: any) {
      console.error('Error fetching detection stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch detection statistics',
        error: error.message
      });
    }
  }

  // Create detection (for AI service)
  static async createDetection(req: Request, res: Response) {
    try {
      const detectionData = req.body;

      // Validate camera exists
      const camera = await Camera.findById(detectionData.cameraId);
      if (!camera) {
        return res.status(400).json({
          success: false,
          message: 'Invalid camera ID'
        });
      }

      // Use camera location if detection location not provided
      if (!detectionData.location) {
        detectionData.location = {
          coordinates: camera.location.coordinates,
          address: camera.location.address
        };
      }

      const detection = new AIDetection(detectionData);
      await detection.save();

      // Populate camera data for response
      await detection.populate('cameraId', 'name location');

      res.status(201).json({
        success: true,
        message: 'Detection created successfully',
        data: detection
      });

    } catch (error: any) {
      console.error('Error creating detection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create detection',
        error: error.message
      });
    }
  }
}

export default AIDetectionController;