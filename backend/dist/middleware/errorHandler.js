"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
// Mongoose / MongoDB specific error parsers
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new appError_1.AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const value = match ? match[0] : 'unknown';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new appError_1.AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(' ')}`;
    return new appError_1.AppError(message, 400);
};
const handleJWTError = () => new appError_1.AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new appError_1.AppError('Your token has expired! Please log in again.', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        success: false,
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
        });
    }
    else {
        // Programming or other unknown error: don't leak details to user
        logger_1.logger.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};
const errorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (env_1.config.nodeEnv === 'development') {
        sendErrorDev(err, res);
    }
    else {
        const error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
        error.message = err.message;
        error.stack = err.stack;
        let appError;
        if (err.name === 'CastError') {
            appError = handleCastErrorDB(err);
        }
        else if (err.code === 11000) {
            appError = handleDuplicateFieldsDB(err);
        }
        else if (err.name === 'ValidationError') {
            appError = handleValidationErrorDB(err);
        }
        else if (err.name === 'JsonWebTokenError') {
            appError = handleJWTError();
        }
        else if (err.name === 'TokenExpiredError') {
            appError = handleJWTExpiredError();
        }
        else if (error instanceof appError_1.AppError) {
            appError = error;
        }
        else {
            appError = new appError_1.AppError(error.message || 'Server Error', error.statusCode || 500);
            // Mark as not operational if it wasn't explicitly created as AppError
            if (!error.isOperational) {
                Object.defineProperty(appError, 'isOperational', { value: false });
            }
        }
        sendErrorProd(appError, res);
    }
};
exports.errorHandler = errorHandler;
