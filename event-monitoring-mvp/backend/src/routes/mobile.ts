import express from 'express';
import {
  validateCompany,
  verifyFR,
  getEventTypes,
  createReport,
  getMyReports,
  getReportById
} from '../controllers/mobileController';
import { validateMobileApiKey, validateMobileUserAccess } from '../middleware/mobileAuth';
import { validateVerifyFR, validateCreateReport } from '../middleware/validation';

const router = express.Router();

/**
 * Mobile App Integration Routes
 * Base path: /api/mobile
 */

// Auth endpoints
router.post('/auth/company-validate', validateMobileApiKey, validateCompany);
router.post('/auth/verify-fr', validateMobileApiKey, validateVerifyFR, verifyFR);

// Event types
router.get('/event-types', validateMobileApiKey, getEventTypes);

// Reports
router.post('/reports', validateMobileApiKey, validateCreateReport, createReport);
router.get('/reports/my', validateMobileApiKey, validateMobileUserAccess, getMyReports);
router.get('/reports/:id', validateMobileApiKey, validateMobileUserAccess, getReportById);

export default router;
