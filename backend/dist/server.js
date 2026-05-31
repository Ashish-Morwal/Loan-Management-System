"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const logger_1 = require("./utils/logger");
// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger_1.logger.error(err);
    process.exit(1);
});
const startServer = async () => {
    // 1. Connect to Database
    await (0, db_1.connectDatabase)();
    // 2. Start HTTP Server
    const server = app_1.default.listen(env_1.config.port, () => {
        logger_1.logger.info(`Server is running in ${env_1.config.nodeEnv} mode on port ${env_1.config.port}`);
    });
    // Handle Unhandled Rejections
    process.on('unhandledRejection', (err) => {
        logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
        if (err instanceof Error) {
            logger_1.logger.error(err);
        }
        else {
            logger_1.logger.error(String(err));
        }
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer().catch((err) => {
    logger_1.logger.error('Failed to start server:', err);
    process.exit(1);
});
