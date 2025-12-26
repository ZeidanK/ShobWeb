import { Response } from 'express';
import mongoose from 'mongoose';
import {
  MobileAuthenticatedRequest,
  CompanyValidateResponse,
  VerifyFRRequest,
  VerifyFRResponse,
  EventTypesResponse,
  CreateReportRequest,
  CreateReportResponse,
  GetReportsQuery,
  GetReportsResponse,
  ReportDetailResponse
} from '../types/mobile';
import { FirstResponder } from '../models/FirstResponder';
import { EventType } from '../models/EventType';
import { Event } from '../models/Event';
import { Company } from '../models/Company';

/**
 * POST /api/mobile/auth/company-validate
 * Validates company API credentials
 */
export const validateCompany = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  // Company already validated by middleware
  const response: CompanyValidateResponse = {
    valid: true,
    company: req.company
  };

  res.status(200).json(response);
};

/**
 * POST /api/mobile/auth/verify-fr
 * Checks if phone number belongs to a First Responder
 */
export const verifyFR = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body as VerifyFRRequest;

    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
      return;
    }

    // Query FirstResponder by phone
    const fr = await FirstResponder.findOne({ phone, isActive: true });

    if (!fr) {
      const response: VerifyFRResponse = {
        isFR: false
      };
      res.status(200).json(response);
      return;
    }

    const response: VerifyFRResponse = {
      isFR: true,
      frId: fr.frId,
      name: fr.name,
      role: fr.role
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Verify FR error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying first responder'
    });
  }
};

/**
 * GET /api/mobile/event-types
 * Returns available event types for the company
 */
export const getEventTypes = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Get company from middleware
    const companyId = req.company?.id;

    // Find company ObjectId
    const company = await Company.findOne({ companyId });

    // Query event types (global or company-specific)
    const eventTypes = await EventType.find({
      isActive: true,
      $or: [
        { isGlobal: true },
        { companyId: company?._id }
      ]
    }).select('typeId name severity');

    const response: EventTypesResponse = {
      eventTypes: eventTypes.map(et => ({
        id: et.typeId,
        name: et.name,
        severity: et.severity
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get event types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event types'
    });
  }
};

/**
 * Helper function to auto-add unknown taxonomy values
 */
const ensureEventTypeExists = async (
  typeName: string,
  severity: string,
  companyId?: mongoose.Types.ObjectId
): Promise<void> => {
  const existing = await EventType.findOne({ name: typeName });
  if (!existing) {
    const newEventType = new EventType({
      typeId: 'et_' + Date.now(),
      name: typeName,
      severity: severity || 'medium',
      companyId,
      isGlobal: false,
      isActive: true
    });
    await newEventType.save();
  }
};

/**
 * Helper function to map severity to priority
 */
const severityToPriority = (severity: string): 1 | 2 | 3 | 4 | 5 => {
  const mapping: Record<string, 1 | 2 | 3 | 4 | 5> = {
    'emergency': 1,
    'critical': 1,
    'high': 2,
    'medium': 3,
    'low': 4
  };
  return mapping[severity.toLowerCase()] || 3;
};

/**
 * POST /api/mobile/reports
 * Creates a new incident report
 */
export const createReport = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reportData = req.body as CreateReportRequest;

    // Basic validation
    if (!reportData.phone || !reportData.type || !reportData.location) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: phone, type, and location are required'
      });
      return;
    }

    if (reportData.location.latitude === undefined || reportData.location.longitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Location must include latitude and longitude'
      });
      return;
    }

    // Check if phone belongs to FR
    const fr = await FirstResponder.findOne({ phone: reportData.phone, isActive: true });
    const reporterType: 'FR' | 'CIVILIAN' = fr ? 'FR' : 'CIVILIAN';

    // Get company ObjectId
    const company = await Company.findOne({ companyId: req.company?.id });

    // Auto-add unknown taxonomy values
    await ensureEventTypeExists(reportData.type, reportData.severity || 'medium', company?._id);

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical', 'emergency'];
    const severity = validSeverities.includes(reportData.severity?.toLowerCase())
      ? reportData.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical' | 'emergency'
      : 'medium';

    // Create Event
    const event = new Event({
      title: `${reportData.type} - Mobile Report`,
      description: reportData.description || '',
      type: reportData.type,
      subType: reportData.subType,
      severity,
      priority: severityToPriority(severity),
      status: 'pending',
      location: {
        coordinates: [reportData.location.longitude, reportData.location.latitude]
      },
      media: {
        images: reportData.media?.images || [],
        videos: reportData.media?.videos || [],
        thumbnails: [],
        attachments: []
      },
      reporter: {
        phone: reportData.phone,
        name: fr?.name,
        isAnonymous: false,
        reporterType
      },
      source: 'mobile_app',
      companyId: company?._id,
      verified: false,
      publiclyVisible: false,
      tags: [],
      notes: [],
      workflow: [{
        status: 'pending',
        timestamp: new Date()
      }],
      resolution: {
        actions: [],
        preventiveMeasures: [],
        followUpRequired: false
      }
    });

    const savedEvent = await event.save();

    const response: CreateReportResponse = {
      success: true,
      reportId: savedEvent._id.toString(),
      reporterType
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report'
    });
  }
};

/**
 * GET /api/mobile/reports/my
 * Returns user's own submitted reports
 */
export const getMyReports = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as unknown as GetReportsQuery;
    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    // Get phone from query (required for filtering user's reports)
    const phone = req.query.phone as string;

    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required to fetch reports'
      });
      return;
    }

    // Build filter
    const filter: Record<string, any> = {
      source: 'mobile_app',
      'reporter.phone': phone
    };

    // Add optional filters
    if (query.status) {
      filter.status = query.status;
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (query.severity) {
      filter.severity = query.severity.toLowerCase();
    }
    if (query.date) {
      const date = new Date(query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = {
        $gte: date,
        $lt: nextDay
      };
    }

    // Get total count
    const total = await Event.countDocuments(filter);

    // Get reports
    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .select('type subType severity status description location createdAt');

    const reports = events.map(event => ({
      id: event._id.toString(),
      type: event.type,
      subType: event.subType,
      severity: event.severity,
      status: event.status,
      description: event.description,
      location: {
        latitude: event.location.coordinates[1],
        longitude: event.location.coordinates[0]
      },
      createdAt: event.createdAt.toISOString()
    }));

    const response: GetReportsResponse = {
      reports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + reports.length < total
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

/**
 * GET /api/mobile/reports/:id
 * Returns specific report details (own reports only)
 */
export const getReportById = async (
  req: MobileAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const phone = req.query.phone as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
      return;
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
      return;
    }

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    // Verify ownership (only allow access to own reports)
    if (phone && event.reporter.phone !== phone) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reports.'
      });
      return;
    }

    const response: ReportDetailResponse = {
      report: {
        id: event._id.toString(),
        type: event.type,
        subType: event.subType,
        severity: event.severity,
        status: event.status,
        description: event.description,
        location: {
          latitude: event.location.coordinates[1],
          longitude: event.location.coordinates[0]
        },
        media: {
          images: event.media?.images || [],
          videos: event.media?.videos || []
        },
        reporterType: event.reporter.reporterType || 'CIVILIAN',
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
};
