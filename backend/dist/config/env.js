"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env variables from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const getRequiredEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but missing.`);
    }
    return value;
};
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: getRequiredEnv('MONGO_URI'),
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000'],
};
