import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser & { userId?: string; };
}

/**
 * Enhanced Authentication Middleware
 * Validates JWT tokens and loads user with permissions
 */
export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied',
        requiresAuth: true
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId)
      .populate('permissions.granted', 'name resource actions scope')
      .populate('permissions.inherited', 'name resource actions scope')
      .select('-password -authentication.otpSecret -authentication.recoveryTokens');

    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false,
        message: 'Token is not valid or user is inactive',
        requiresAuth: true
      });
      return;
    }

    // Check if account is locked
    if (user.isLocked) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        lockoutUntil: user.authentication.lockoutUntil
      });
      return;
    }

    // Add userId for backward compatibility
    req.user = { ...user.toObject(), userId: user._id.toString() };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid',
      requiresAuth: true
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient role permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user?.role
      });
      return;
    }
    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permissionName: string, options: {
  resource?: string;
  action?: string;
  allowSelfAccess?: boolean;
} = {}) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          message: 'Authentication required',
          requiresAuth: true
        });
        return;
      }

      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check self-access for certain operations
      if (options.allowSelfAccess) {
        const targetUserId = req.params.userId || req.params.id || req.body.userId;
        if (targetUserId && targetUserId === req.user._id.toString()) {
          return next();
        }
      }

      // Context for permission checking
      const context = {
        location: req.body?.location || req.query?.location,
        severity: req.body?.severity || req.query?.severity,
        currentTime: new Date(),
        userIp: req.ip
      };

      const hasPermission = await req.user.hasPermission(permissionName, context);
      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this operation',
          requiredPermission: permissionName
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission validation failed'
      });
    }
  };
};

/**
 * Legacy middleware for backward compatibility
 */
export const adminOnly = requireRole(['admin', 'super_admin']);
export const operatorOrAdmin = requireRole(['operator', 'admin', 'mobile_admin', 'super_admin']);

/**
 * Mobile-optimized auth middleware (more lenient error handling)
 */
export const mobileAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                 req.header('X-Mobile-Token'); // Alternative header for mobile apps

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        requiresAuth: true,
        mobileOptimized: true
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId)
      .select('-password -authentication.otpSecret -authentication.recoveryTokens');

    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid session. Please log in again.',
        requiresAuth: true,
        mobileOptimized: true
      });
      return;
    }

    // Update last activity for mobile users
    if (user.authMethod === 'phone_otp') {
      user.updateLastActivity();
    }

    req.user = { ...user.toObject(), userId: user._id.toString() };
    next();
  } catch (error) {
    console.error('Mobile auth error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Session expired. Please log in again.',
      requiresAuth: true,
      mobileOptimized: true
    });
  }
};

/**
 * Optional auth middleware - doesn't require authentication but loads user if token is present
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId)
      .select('-password -authentication.otpSecret -authentication.recoveryTokens');

    if (user && user.isActive) {
      req.user = { ...user.toObject(), userId: user._id.toString() };
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};