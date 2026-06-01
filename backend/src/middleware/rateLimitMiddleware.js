import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

/**
 * Stricter rate limit for OTP send endpoints (abuse prevention).
 */
export const otpRateLimiter = rateLimit({
  windowMs: env.rateLimit.otpWindowMs,
  max: env.rateLimit.otpMax,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.mobileNumber || req.ip,
});

/**
 * General API rate limit.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
