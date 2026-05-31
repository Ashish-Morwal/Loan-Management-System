"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const connectDatabase = async () => {
    const options = {
        autoIndex: true, // Build indexes (disable in production for better performance if indexes are pre-built)
        // Fail faster on unreachable MongoDB hosts during development
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    };
    try {
        logger_1.logger.info('Connecting to MongoDB...');
        await mongoose_1.default.connect(env_1.config.mongoUri, options);
    }
    catch (error) {
        logger_1.logger.error('Mongoose connection error:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
// Monitor connection events
mongoose_1.default.connection.on('connected', () => {
    logger_1.logger.info('MongoDB connection successfully established.');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_1.logger.error('MongoDB connection encountered an error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.logger.warn('MongoDB connection has disconnected.');
});
// Close Mongoose connection if node process terminates
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    logger_1.logger.info('MongoDB connection closed through app termination (SIGINT).');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await mongoose_1.default.connection.close();
    logger_1.logger.info('MongoDB connection closed through app termination (SIGTERM).');
    process.exit(0);
});
