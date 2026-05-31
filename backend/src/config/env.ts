import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  allowedOrigins: string[];
}

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but missing.`);
  }
  return value;
};

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: getRequiredEnv('MONGO_URI'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],
};
