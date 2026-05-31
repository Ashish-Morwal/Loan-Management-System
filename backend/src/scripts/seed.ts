import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { User, UserRole } from '../models/User';
import { logger } from '../utils/logger';

const seedUsers = [
  {
    name: 'System Admin',
    email: 'admin@test.com',
    password: 'Password@123',
    role: 'ADMIN' as UserRole,
  },
  {
    name: 'Sales Executive',
    email: 'sales@test.com',
    password: 'Password@123',
    role: 'SALES' as UserRole,
  },
  {
    name: 'Sanction Officer',
    email: 'sanction@test.com',
    password: 'Password@123',
    role: 'SANCTION' as UserRole,
  },
  {
    name: 'Disbursement Officer',
    email: 'disbursement@test.com',
    password: 'Password@123',
    role: 'DISBURSEMENT' as UserRole,
  },
  {
    name: 'Collection Officer',
    email: 'collection@test.com',
    password: 'Password@123',
    role: 'COLLECTION' as UserRole,
  },
  {
    name: 'Borrower Client',
    email: 'borrower@test.com',
    password: 'Password@123',
    role: 'BORROWER' as UserRole,
  },
];

const seed = async () => {
  try {
    // 1. Establish DB Connection
    await connectDatabase();
    logger.info('Database connected successfully. Commencing seeding...');

    // 2. Iterate and create users conditionally
    for (const userData of seedUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        // Calling .create triggers Mongoose pre-save schema middleware to hash password
        await User.create(userData);
        logger.info(`Successfully seeded user: ${userData.email} (Role: ${userData.role})`);
      } else {
        logger.info(`Skipped user (already exists): ${userData.email}`);
      }
    }

    logger.info('Seeding operation completed successfully!');
  } catch (error) {
    logger.error('Error occurred during database seeding:', error as Error);
  } finally {
    // 3. Cleanup DB Connection
    await mongoose.disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  }
};

// Execute seed command
seed().catch((err) => {
  logger.error('Unhandled seed execution error:', err);
  process.exit(1);
});
