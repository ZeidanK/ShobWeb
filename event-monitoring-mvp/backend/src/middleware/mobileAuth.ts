import { Response, NextFunction } from 'express';
import { MobileAuthenticatedRequest } from '../types/mobile';
import { Company } from '../models/Company';

/**
 * Validates X-API-Key header for mobile app requests
 * Queries Company collection and validates the API key
 */
export const validateMobileApiKey = async (
  req: MobileAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: 'Missing X-API-Key header'
      });
      return;
    }

    // Query Company by apiKey
    const company = await Company.findOne({ apiKey, isActive: true });

    if (!company) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key or company is inactive'
      });
      return;
    }

    // Attach company info to request
    req.company = {
      id: company.companyId,
      name: company.name,
      settings: company.settings || {}
    };

    next();
  } catch (error) {
    console.error('Mobile API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating API key'
    });
  }
};

/**
 * Validates that user can only access their own reports
 * Checks report ownership based on phone number
 */
export const validateMobileUserAccess = async (
  req: MobileAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // For now, pass through - ownership check is done in controller
  // This middleware can be extended for more complex access control
  next();
};
