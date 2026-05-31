"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const appError_1 = require("../utils/appError");
const asyncHandler_1 = require("../utils/asyncHandler");
const env_1 = require("../config/env");
/**
 * Authentication Middleware: Verify JWT and attach user to request object.
 * Returns 401 Unauthorized if invalid or missing token.
 */
exports.authMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    // 1. Check if token is provided in the Authorization header
    let token;
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
        return next(new appError_1.AppError('You are not logged in. Please log in to get access.', 401));
    }
    // 2. Verify token signature and expiration
    const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    console.debug('AUTH MIDDLEWARE DECODED TOKEN', {
        id: decoded.id,
        role: decoded.role,
        exp: decoded.exp,
    });
    // 3. Check if user still exists in the database
    const currentUser = await User_1.User.findById(decoded.id);
    if (!currentUser) {
        console.debug('AUTH MIDDLEWARE USER NOT FOUND', { userId: decoded.id });
        return next(new appError_1.AppError('The user belonging to this token no longer exists.', 401));
    }
    // 4. Check if user is active
    if (!currentUser.isActive) {
        console.debug('AUTH MIDDLEWARE USER INACTIVE', { userId: currentUser._id.toString() });
        return next(new appError_1.AppError('Your account has been deactivated. Please contact support.', 403));
    }
    // 5. Attach user document to the request
    req.user = currentUser;
    next();
});
/**
 * Authorization Middleware: Restrict access to specific roles.
 * Returns 403 Forbidden if user's role does not match.
 */
const authorizeMiddleware = (roles) => {
    return (req, _res, next) => {
        // 1. Verify user is authenticated
        if (!req.user) {
            console.debug('AUTHORIZATION FAILED', {
                reason: 'missing req.user',
                route: req.originalUrl,
                allowedRoles: roles,
            });
            return next(new appError_1.AppError('You are not logged in. Please log in to get access.', 401));
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
            return next(new appError_1.AppError('You do not have permission to perform this action.', 403));
        }
        next();
    };
};
exports.authorizeMiddleware = authorizeMiddleware;
