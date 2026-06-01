import env from '../config/env.js';

/**
 * Generates a numeric OTP of configured length.
 */
export function generateOtp() {
  const length = env.otp.length;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Returns expiry timestamp for OTP (default 5 minutes).
 */
export function getOtpExpiry() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + env.otp.expiryMinutes);
  return expiresAt;
}
