import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { config } from '../config/env';

interface DecodedToken {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authentication Middleware: Verify JWT and attach user to request object.
 * Returns 401 Unauthorized if invalid or missing token.
 */
export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // 1. Check if token is provided in the Authorization header
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.debug('AUTH MIDDLEWARE', {
      authorizationHeader: req.headers.authorization,
      tokenExists: !!token,
      route: req.originalUrl,
      method: req.method,
    });

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2. Verify token signature and expiration
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

    console.debug('AUTH MIDDLEWARE DECODED TOKEN', {
      id: decoded.id,
      role: decoded.role,
      exp: decoded.exp,
    });

    // 3. Check if user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      console.debug('AUTH MIDDLEWARE USER NOT FOUND', { userId: decoded.id });
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4. Check if user is active
    if (!currentUser.isActive) {
      console.debug('AUTH MIDDLEWARE USER INACTIVE', { userId: currentUser._id.toString() });
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // 5. Attach user document to the request
    req.user = currentUser;
    next();
  }
);

/**
 * Authorization Middleware: Restrict access to specific roles.
 * Returns 403 Forbidden if user's role does not match.
 */
export const authorizeMiddleware = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // 1. Verify user is authenticated
    if (!req.user) {
      console.debug('AUTHORIZATION FAILED', {
        reason: 'missing req.user',
        route: req.originalUrl,
        allowedRoles: roles,
      });
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    console.debug('AUTHORIZATION CHECK', {
      userId: req.user._id.toString(),
      userRole: req.user.role,
      allowedRoles: roles,
      route: req.originalUrl,
      method: req.method,
    });

    // 2. Verify role matches
    if (!roles.includes(req.user.role)) {
      console.debug('AUTHORIZATION FAILED ROLE MISMATCH', {
        userRole: req.user.role,
        allowedRoles: roles,
        route: req.originalUrl,
      });
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
