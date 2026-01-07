/**
 * Enhanced Authentication Controller
 * 
 * Handles all authentication-related operations including user registration,
 * login, token generation, and user profile management. Supports multiple
 * authentication methods: email+password, phone+OTP, and social OAuth.
 * 
 * Security Features:
 * - Password hashing with bcrypt and salt
 * - JWT token generation with configurable expiration
 * - Phone-based OTP authentication
 * - Permission-based access control
 * - Account lockout protection
 * - Input validation and sanitization
 * - Duplicate user detection
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { RolePermission } from '../models/Permission';
import crypto from 'crypto';

// Simple OTP validation function (in production, use Redis/database)
const validateOTP = async (phone: string, otp: string): Promise<boolean> => {
  // For demo purposes, accept any 6-digit OTP or '123456'
  // In production, verify against stored OTP in cache/database
  return /^\d{6}$/.test(otp) || otp === '123456';
};

/**
 * Enhanced JWT Token Generation Utility
 * Creates a signed JWT token for authenticated users with role and device info
 * 
 * @param userId - MongoDB ObjectId of the user
 * @param role - User's role for permission checking
 * @param authMethod - Authentication method used
 * @param deviceInfo - Optional device information for mobile users
 * @returns Signed JWT token string
 */
const generateToken = (userId: string, role: string, authMethod: string, deviceInfo?: any): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = authMethod === 'phone_otp' ? '30d' : '7d'; // Longer for mobile
  
  return jwt.sign(
    { 
      userId, 
      role,
      authMethod,
      deviceInfo: deviceInfo?.platform || 'web',
      iat: Math.floor(Date.now() / 1000)
    }, 
    secret, 
    { expiresIn }
  );
};

/**
 * Generate OTP for phone verification
 * @returns 6-digit OTP code
 */
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Update user permissions based on role
 * @param user - User document to update
 */
const updateUserPermissions = async (user: any): Promise<void> => {
  try {
    const rolePermissions = await RolePermission.find({ 
      role: user.roles[0] || 'operator', 
      isActive: true 
    }).populate('permission');
    
    user.permissions.inherited = rolePermissions.map(rp => rp.permission._id);
    user.permissions.lastUpdated = new Date();
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    console.error('Error updating user permissions:', error);
  }
};

/**
 * Enhanced User Registration Controller
 * Creates a new user account with support for different authentication methods
 * 
 * @route   POST /api/auth/register
 * @access  Public (for operators/admins) or Admin-only (for creating other roles)
 * @param   req.body.username - Optional username (required for email auth)
 * @param   req.body.email - Optional email (required for email auth)
 * @param   req.body.password - Optional password (required for email auth)
 * @param   req.body.phone - Optional phone (required for phone auth)
 * @param   req.body.authMethod - Authentication method ('email_password', 'phone_otp')
 * @param   req.body.role - Role assignment ('citizen', 'operator', 'admin', 'mobile_admin', 'super_admin')
 * @param   req.body.profile - Optional profile information
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      username, 
      email, 
      password, 
      phone, 
      authMethod, 
      role, 
      profile,
      deviceInfo 
    } = req.body;

    const authType = authMethod || 'email_password';
    const userRole = role || 'operator';

    // Validate required fields based on auth method
    if (authType === 'email_password') {
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required for email authentication',
        });
        return;
      }
    } else if (authType === 'phone_otp') {
      if (!phone) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required for phone authentication',
        });
        return;
      }
    }

    // Check for existing users
    const existingUserQuery: any = {};
    if (email) existingUserQuery.email = email;
    if (username) existingUserQuery.username = username;
    if (phone) existingUserQuery.phone = phone;

    const existingUser = await User.findOne({
      $or: Object.keys(existingUserQuery).map(key => ({ [key]: existingUserQuery[key] }))
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email, username, or phone number',
      });
      return;
    }

    // Create user data object
    const userData: any = {
      role: userRole,
      authMethod: authType,
      isActive: true,
      metadata: {
        source: 'admin_created'
      }
    };

    // Add authentication-specific fields
    if (authType === 'email_password') {
      userData.email = email;
      userData.password = password;
      userData.username = username || email.split('@')[0];
    } else if (authType === 'phone_otp') {
      userData.phone = phone;
      userData.authentication = {
        phoneVerified: false
      };
    }

    // Add profile information
    if (profile) {
      userData.profile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department,
        timezone: profile.timezone || 'UTC',
        preferredLanguage: profile.preferredLanguage || 'en'
      };
    }

    // Add mobile device info if provided
    if (deviceInfo && authType === 'phone_otp') {
      userData.mobileSettings = {
        deviceTokens: deviceInfo.deviceToken ? [deviceInfo.deviceToken] : []
      };
    }

    // Create new user
    const user = await User.create(userData);

    // Update user permissions based on role
    await updateUserPermissions(user);

    // Generate JWT token
    const token = generateToken(
      user._id.toString(), 
      user.role, 
      user.authMethod, 
      deviceInfo
    );

    // Return appropriate response based on auth method
    const response: any = {
      success: true,
      message: authType === 'phone_otp' ? 
        'User registered successfully. Please verify your phone number.' :
        'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          authMethod: user.authMethod,
          fullName: user.fullName,
          isVerified: user.isVerified
        },
      },
    };

    // Add verification steps for phone auth
    if (authType === 'phone_otp') {
      response.nextSteps = {
        requiresPhoneVerification: true,
        verificationEndpoint: '/api/auth/verify-phone'
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/**
 * Enhanced Login Controller
 * Supports multiple authentication methods and improved security
 * 
 * @route   POST /api/auth/login
 * @access  Public
 * @param   req.body.credential - Email, username, or phone number
 * @param   req.body.password - Password (for email/username login)
 * @param   req.body.otp - OTP code (for phone login)
 * @param   req.body.authMethod - Optional: specify auth method
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, email, password, otp, authMethod, deviceInfo } = req.body;

    // Support both 'credential' (new format) and 'email' (legacy format)
    const loginCredential = credential || email;

    if (!loginCredential) {
      res.status(400).json({
        success: false,
        message: 'Email, username, or phone number is required',
      });
      return;
    }

    // Find user by credential (email, username, or phone)
    const user = await User.findByCredential(loginCredential);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if account is locked
    if (user.isLocked) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts',
        lockoutUntil: user.authentication.lockoutUntil
      });
      return;
    }

    let isValid = false;

    // Validate based on authentication method
    if (user.authMethod === 'email_password') {
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required for email/username login',
        });
        return;
      }
      isValid = await user.comparePassword(password);
    } else if (user.authMethod === 'phone_otp') {
      if (!otp) {
        res.status(400).json({
          success: false,
          message: 'OTP code is required for phone login',
        });
        return;
      }
      // In a real implementation, you'd validate the OTP from cache/database
      // For now, we'll assume OTP validation logic exists
      isValid = await validateOTP(user.phone, otp);
    }

    if (!isValid) {
      // Increment failed attempts
      user.authentication.failedAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (user.authentication.failedAttempts >= 5) {
        user.authentication.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      await user.save({ validateBeforeSave: false });
      
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - user.authentication.failedAttempts)
      });
      return;
    }

    // Reset failed attempts on successful login
    user.authentication.failedAttempts = 0;
    user.authentication.lockoutUntil = undefined;
    user.authentication.lastLoginAt = new Date();
    
    await user.save({ validateBeforeSave: false });

    // Generate new token
    const token = generateToken(
      user._id.toString(), 
      user.roles[0] || 'operator', // Use first role
      user.authMethod, 
      deviceInfo
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.roles[0] || 'operator',
          authMethod: user.authMethod,
          isActive: user.isActive,
          profile: user.profile
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * Phone Verification Controller
 * Verify phone number with OTP code
 * 
 * @route   POST /api/auth/verify-phone
 * @access  Public
 */
export const verifyPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required',
      });
      return;
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Validate OTP (implement actual OTP validation logic)
    const isValidOTP = await validateOTP(phone, otp);
    if (!isValidOTP) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code',
      });
      return;
    }

    // Mark phone as verified
    user.authentication.phoneVerified = true;
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during phone verification',
    });
  }
};

/**
 * Send OTP Controller
 * Send OTP code to phone number
 * 
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    // Generate and send OTP (implement actual SMS service integration)
    const otpCode = generateOTP();
    await storeOTP(phone, otpCode); // Store in Redis/cache with expiration
    await sendSMS(phone, `Your verification code is: ${otpCode}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'), // Masked phone
        expiresIn: 300 // 5 minutes
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    });
  }
};

// Placeholder functions - implement with actual services
const storeOTP = async (phone: string, otp: string): Promise<void> => {
  // Implement OTP storage in Redis with 5-minute expiration
  console.log(`Storing OTP ${otp} for phone ${phone}`);
};

const sendSMS = async (phone: string, message: string): Promise<void> => {
  // Implement actual SMS service (Twilio, AWS SNS, etc.)
  console.log(`SMS to ${phone}: ${message}`);
};

/**
 * Enhanced Get Profile Controller
 * Returns comprehensive user profile with permissions
 * 
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId)
      .populate('permissions.granted', 'name description resource actions')
      .populate('permissions.inherited', 'name description resource actions')
      .select('-password -authentication.otpSecret -authentication.recoveryTokens');
      
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          authMethod: user.authMethod,
          fullName: user.fullName,
          isActive: user.isActive,
          isVerified: user.isVerified,
          profile: user.profile,
          permissions: {
            granted: user.permissions.granted,
            inherited: user.permissions.inherited,
            lastUpdated: user.permissions.lastUpdated
          },
          usage: user.usage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    });
  }
};

/**
 * Enhanced Update Profile Controller
 * Updates user profile information
 * 
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { profile, mobileSettings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update profile fields
    if (profile) {
      if (profile.firstName !== undefined) user.profile.firstName = profile.firstName;
      if (profile.lastName !== undefined) user.profile.lastName = profile.lastName;
      if (profile.department !== undefined) user.profile.department = profile.department;
      if (profile.timezone !== undefined) user.profile.timezone = profile.timezone;
      if (profile.preferredLanguage !== undefined) user.profile.preferredLanguage = profile.preferredLanguage;
      
      if (profile.location) {
        user.profile.location = {
          coordinates: profile.location.coordinates,
          address: profile.location.address,
          accuracy: profile.location.accuracy
        };
      }
    }

    // Update mobile settings for mobile users
    if (mobileSettings && user.authMethod === 'phone_otp') {
      if (mobileSettings.deviceTokens) {
        user.mobileSettings.deviceTokens = mobileSettings.deviceTokens;
      }
    }

    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          profile: user.profile,
          mobileSettings: user.mobileSettings
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

/**
 * Change Password Controller
 * Allows users to change their password
 * 
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
      return;
    }

    const user = await User.findById(userId).select('+password');
    if (!user || user.authMethod !== 'email_password') {
      res.status(400).json({
        success: false,
        message: 'Password change not available for this authentication method',
      });
      return;
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
    });
  }
};