"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const appError_1 = require("./utils/appError");
const apiResponse_1 = require("./utils/apiResponse");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const borrower_routes_1 = __importDefault(require("./routes/borrower.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const loan_routes_1 = __importDefault(require("./routes/loan.routes"));
const sanction_routes_1 = __importDefault(require("./routes/sanction.routes"));
const disbursement_routes_1 = __importDefault(require("./routes/disbursement.routes"));
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
const app = (0, express_1.default)();
// 1. Security Middleware
app.use((0, helmet_1.default)());
// 2. CORS Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (env_1.config.allowedOrigins.includes(origin) || env_1.config.allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(new appError_1.AppError('Not allowed by CORS', 403));
    },
    credentials: true,
}));
// 3. HTTP Request Logging Streamed through Logger
const morganStream = {
    write: (message) => logger_1.logger.info(message.trim()),
};
// Use dev format in development, combined in production
const morganFormat = env_1.config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use((0, morgan_1.default)(morganFormat, { stream: morganStream }));
// 4. Request Body Parsing
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// 5. API Routes
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/borrowers', borrower_routes_1.default);
app.use('/api/v1/upload', upload_routes_1.default);
app.use('/api/v1/loans', loan_routes_1.default);
app.use('/api/v1/sanctions', sanction_routes_1.default);
app.use('/api/v1/disbursements', disbursement_routes_1.default);
app.use('/api/v1/collections', collection_routes_1.default);
// 6. Health Check Route
app.get('/health', (_req, res) => {
    apiResponse_1.ApiResponse.send(res, 200, 'Loan Management System API is healthy', {
        uptime: process.uptime(),
        timestamp: new Date(),
        env: env_1.config.nodeEnv,
    });
});
// 6. Handle Unhandled Routes
app.all('*', (req, _res, next) => {
    next(new appError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 7. Global Error Handler Middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
