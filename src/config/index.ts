import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redis: {
    host: string;
    port: number;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  bcryptRounds: number;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logLevel: string;
  corsOrigin: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    db: Number.parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;