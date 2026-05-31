import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';
import { ApiResponse } from './utils/apiResponse';
import authRouter from './routes/auth.routes';
import borrowerRouter from './routes/borrower.routes';
import uploadRouter from './routes/upload.routes';
import loanRouter from './routes/loan.routes';
import sanctionRouter from './routes/sanction.routes';
import disbursementRouter from './routes/disbursement.routes';
import collectionRouter from './routes/collection.routes';

const app = express();

// 1. Security Middleware
app.use(helmet());

// 2. CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (config.allowedOrigins.includes(origin) || config.allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
  })
);

// 3. HTTP Request Logging Streamed through Logger
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};

// Use dev format in development, combined in production
const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: morganStream }));

// 4. Request Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. API Routes
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/borrowers', borrowerRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/loans', loanRouter);
app.use('/api/v1/sanctions', sanctionRouter);
app.use('/api/v1/disbursements', disbursementRouter);
app.use('/api/v1/collections', collectionRouter);

// 6. Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  ApiResponse.send(res, 200, 'Loan Management System API is healthy', {
    uptime: process.uptime(),
    timestamp: new Date(),
    env: config.nodeEnv,
  });
});

// 6. Handle Unhandled Routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 7. Global Error Handler Middleware
app.use(errorHandler);

export default app;
