import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  verifyPhone, 
  sendOTP, 
  changePassword 
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { 
  validateRegistration, 
  validateLogin, 
  validatePhoneVerification,
  validateSendOTP,
  validateChangePassword 
} from '../middleware/validation';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (supports email+password and phone+OTP)
// @access  Public (for operators/admins) or Admin-only (for creating other roles)
router.post('/register', validateRegistration, register);

// @route   POST /api/auth/login
// @desc    Login user (supports multiple authentication methods)
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', validateSendOTP, sendOTP);

// @route   POST /api/auth/verify-phone
// @desc    Verify phone number with OTP
// @access  Public
router.post('/verify-phone', validatePhoneVerification, verifyPhone);

// @route   GET /api/auth/profile
// @desc    Get current user profile with permissions
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile information
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, validateChangePassword, changePassword);

export default router;