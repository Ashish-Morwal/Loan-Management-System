"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const seedUsers = [
    {
        name: 'System Admin',
        email: 'admin@test.com',
        password: 'Password@123',
        role: 'ADMIN',
    },
    {
        name: 'Sales Executive',
        email: 'sales@test.com',
        password: 'Password@123',
        role: 'SALES',
    },
    {
        name: 'Sanction Officer',
        email: 'sanction@test.com',
        password: 'Password@123',
        role: 'SANCTION',
    },
    {
        name: 'Disbursement Officer',
        email: 'disbursement@test.com',
        password: 'Password@123',
        role: 'DISBURSEMENT',
    },
    {
        name: 'Collection Officer',
        email: 'collection@test.com',
        password: 'Password@123',
        role: 'COLLECTION',
    },
    {
        name: 'Borrower Client',
        email: 'borrower@test.com',
        password: 'Password@123',
        role: 'BORROWER',
    },
];
const seed = async () => {
    try {
        // 1. Establish DB Connection
        await (0, db_1.connectDatabase)();
        logger_1.logger.info('Database connected successfully. Commencing seeding...');
        // 2. Iterate and create users conditionally
        for (const userData of seedUsers) {
            const userExists = await User_1.User.findOne({ email: userData.email });
            if (!userExists) {
                // Calling .create triggers Mongoose pre-save schema middleware to hash password
                await User_1.User.create(userData);
                logger_1.logger.info(`Successfully seeded user: ${userData.email} (Role: ${userData.role})`);
            }
            else {
                logger_1.logger.info(`Skipped user (already exists): ${userData.email}`);
            }
        }
        logger_1.logger.info('Seeding operation completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('Error occurred during database seeding:', error);
    }
    finally {
        // 3. Cleanup DB Connection
        await mongoose_1.default.disconnect();
        logger_1.logger.info('Database connection closed.');
        process.exit(0);
    }
};
// Execute seed command
seed().catch((err) => {
    logger_1.logger.error('Unhandled seed execution error:', err);
    process.exit(1);
});
