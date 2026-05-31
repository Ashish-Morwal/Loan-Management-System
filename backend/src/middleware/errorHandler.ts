import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config/env';

interface MongooseCastError extends Error {
  path: string;
  value: string;
}

interface MongooseDuplicateKeyError extends Error {
  errmsg: string;
}

interface ValidationErrorItem {
  message: string;
}

interface MongooseValidationError extends Error {
  errors: Record<string, ValidationErrorItem>;
}

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
}

// Mongoose / MongoDB specific error parsers
const handleCastErrorDB = (err: MongooseCastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongooseDuplicateKeyError): AppError => {
  const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: MongooseValidationError): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(' ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: ExtendedError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details to user
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const errorHandler: ErrorRequestHandler = (
  err: ExtendedError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    const error = Object.assign(Object.create(Object.getPrototypeOf(err)), err) as ExtendedError & {
      isOperational?: boolean;
    };
    error.message = err.message;
    error.stack = err.stack;

    let appError: AppError;

    if (err.name === 'CastError') {
      appError = handleCastErrorDB(err as unknown as MongooseCastError);
    } else if (err.code === 11000) {
      appError = handleDuplicateFieldsDB(err as unknown as MongooseDuplicateKeyError);
    } else if (err.name === 'ValidationError') {
      appError = handleValidationErrorDB(err as unknown as MongooseValidationError);
    } else if (err.name === 'JsonWebTokenError') {
      appError = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      appError = handleJWTExpiredError();
    } else if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(error.message || 'Server Error', error.statusCode || 500);
      // Mark as not operational if it wasn't explicitly created as AppError
      if (!error.isOperational) {
        Object.defineProperty(appError, 'isOperational', { value: false });
      }
    }

    sendErrorProd(appError, res);
  }
};

