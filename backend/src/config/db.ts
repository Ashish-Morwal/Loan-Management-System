import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const options = {
    autoIndex: true, // Build indexes (disable in production for better performance if indexes are pre-built)
    // Fail faster on unreachable MongoDB hosts during development
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  };

  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, options);
  } catch (error) {
    logger.error('Mongoose connection error:', error as Error);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection successfully established.');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection encountered an error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection has disconnected.');
});

// Close Mongoose connection if node process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination (SIGINT).');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination (SIGTERM).');
  process.exit(0);
});
