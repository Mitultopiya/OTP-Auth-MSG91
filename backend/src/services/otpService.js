import bcrypt from 'bcrypt';
import OtpModel from '../models/OtpModel.js';
import { sendOtpSms } from './smsService.js';
import { generateOtp, getOtpExpiry } from '../utils/otpGenerator.js';
import { AppError } from '../utils/AppError.js';
import env from '../config/env.js';

const SALT_ROUNDS = 10;

/**
 * Creates, stores, and sends an OTP for the given purpose.
 */
export async function createAndSendOtp(mobileNumber, purpose) {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = getOtpExpiry();

  await OtpModel.invalidatePrevious(mobileNumber, purpose);
  const record = await OtpModel.create({
    mobileNumber,
    otpHash,
    purpose,
    expiresAt,
  });

  await sendOtpSms(mobileNumber, otp);

  return {
    otpId: record.id,
    expiresAt: record.expires_at,
    // Only expose OTP in development for testing
    ...(env.nodeEnv === 'development' && !env.msg91.authKey ? { devOtp: otp } : {}),
  };
}

/**
 * Verifies OTP against stored hash; enforces attempt limits and expiry.
 */
export async function verifyOtp(mobileNumber, purpose, otpInput) {
  const record = await OtpModel.findLatestValid(mobileNumber, purpose);

  if (!record) {
    throw new AppError('OTP expired or not found. Please request a new one.', 400);
  }

  if (record.attempts >= record.max_attempts) {
    await OtpModel.markUsed(record.id);
    throw new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 429);
  }

  const isValid = await bcrypt.compare(otpInput, record.otp_hash);

  if (!isValid) {
    const updated = await OtpModel.incrementAttempts(record.id);
    const remaining = updated.max_attempts - updated.attempts;
    throw new AppError(
      `Invalid OTP. ${remaining} attempt(s) remaining.`,
      400
    );
  }

  await OtpModel.markUsed(record.id);
  return { verified: true, otpId: record.id };
}
