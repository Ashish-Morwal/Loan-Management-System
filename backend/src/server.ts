import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { logger } from './utils/logger';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

const startServer = async () => {
  // 1. Connect to Database
  await connectDatabase();

  // 2. Start HTTP Server
  const server = app.listen(config.port, () => {
    logger.info(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err: unknown) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
    if (err instanceof Error) {
      logger.error(err);
    } else {
      logger.error(String(err));
    }
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
