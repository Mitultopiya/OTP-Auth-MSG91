import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration with sensible defaults.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
  },
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    templateId: process.env.MSG91_TEMPLATE_ID,
    senderId: process.env.MSG91_SENDER_ID || 'OTPAUTH',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimit: {
    otpWindowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS, 10) || 900000,
    otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX, 10) || 5,
  },
};

/** Validate required secrets at startup */
export function validateEnv() {
  const hasDb =
    (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('${')) ||
    (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);

  if (!hasDb) {
    throw new Error(
      'Missing database config: set DATABASE_URL or DB_HOST, DB_USER, DB_NAME (and DB_PASSWORD)'
    );
  }

  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default env;
