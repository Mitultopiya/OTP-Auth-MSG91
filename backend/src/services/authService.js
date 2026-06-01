import bcrypt from 'bcrypt';
import UserModel from '../models/UserModel.js';
import RefreshTokenModel from '../models/RefreshTokenModel.js';
import AuditLogModel from '../models/AuditLogModel.js';
import { createAndSendOtp, verifyOtp } from './otpService.js';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '../utils/tokenUtils.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 12;

function getClientMeta(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    userAgent: req.headers['user-agent'] || null,
  };
}

async function issueTokens(user, req) {
  const payload = { userId: user.id, mobile: user.mobile_number };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  await RefreshTokenModel.create({
    userId: user.id,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshToken, user };
}

/**
 * Register: send OTP to verify mobile before account creation.
 */
export async function sendRegisterOtp(mobileNumber, req) {
  const existing = await UserModel.findByMobile(mobileNumber);
  if (existing) {
    throw new AppError('Mobile number already registered. Please login.', 409);
  }

  const result = await createAndSendOtp(mobileNumber, 'register');
  const meta = getClientMeta(req);
  await AuditLogModel.create({
    mobileNumber,
    action: 'register_otp_sent',
    ...meta,
  });
  return result;
}

/**
 * Complete registration after OTP verification.
 */
export async function registerUser({ fullName, mobileNumber, password, otp }, req) {
  await verifyOtp(mobileNumber, 'register', otp);

  const existing = await UserModel.findByMobile(mobileNumber);
  if (existing) {
    throw new AppError('Mobile number already registered.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ fullName, mobileNumber, passwordHash });

  const tokens = await issueTokens(user, req);
  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'register',
    ...meta,
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
    },
    ...tokens,
  };
}

/**
 * Password login with mobile + password.
 */
export async function loginWithPassword(mobileNumber, password, req) {
  const user = await UserModel.findByMobile(mobileNumber);
  const meta = getClientMeta(req);

  if (!user || !user.is_active) {
    await AuditLogModel.create({
      mobileNumber,
      action: 'login_failed',
      ...meta,
      metadata: { reason: 'user_not_found' },
    });
    throw new AppError('Invalid mobile number or password.', 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    await AuditLogModel.create({
      userId: user.id,
      mobileNumber,
      action: 'login_failed',
      ...meta,
      metadata: { reason: 'invalid_password' },
    });
    throw new AppError('Invalid mobile number or password.', 401);
  }

  const tokens = await issueTokens(user, req);
  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'login_password',
    ...meta,
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * OTP login: send OTP to registered mobile.
 */
export async function sendLoginOtp(mobileNumber, req) {
  const user = await UserModel.findByMobile(mobileNumber);
  if (!user) {
    throw new AppError('Mobile number not registered. Please sign up first.', 404);
  }

  const result = await createAndSendOtp(mobileNumber, 'login');
  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'login_otp_sent',
    ...meta,
  });
  return result;
}

/**
 * OTP login: verify OTP and issue tokens.
 */
export async function loginWithOtp(mobileNumber, otp, req) {
  const user = await UserModel.findByMobile(mobileNumber);
  if (!user) {
    throw new AppError('Mobile number not registered.', 404);
  }

  await verifyOtp(mobileNumber, 'login', otp);
  const tokens = await issueTokens(user, req);
  const meta = getClientMeta(req);

  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'login_otp_verified',
    ...meta,
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Forgot password: send OTP.
 */
export async function sendForgotPasswordOtp(mobileNumber, req) {
  const user = await UserModel.findByMobile(mobileNumber);
  if (!user) {
    throw new AppError('Mobile number not registered.', 404);
  }

  const result = await createAndSendOtp(mobileNumber, 'forgot_password');
  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'forgot_password_otp_sent',
    ...meta,
  });
  return result;
}

/**
 * Reset password after OTP verification.
 */
export async function resetPassword({ mobileNumber, otp, newPassword }, req) {
  const user = await UserModel.findByMobile(mobileNumber);
  if (!user) {
    throw new AppError('Mobile number not registered.', 404);
  }

  await verifyOtp(mobileNumber, 'forgot_password', otp);
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await UserModel.updatePassword(user.id, passwordHash);

  // Revoke all refresh tokens on password reset
  await RefreshTokenModel.revokeAllForUser(user.id);

  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId: user.id,
    mobileNumber,
    action: 'password_reset',
    ...meta,
  });

  return { message: 'Password reset successfully. Please login with your new password.' };
}

/**
 * Refresh access token using valid refresh token.
 */
export async function refreshAccessToken(refreshToken, req) {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshTokenModel.findByHash(tokenHash);

  if (!stored || !stored.is_active) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const accessToken = signAccessToken({
    userId: stored.user_id,
    mobile: stored.mobile_number,
  });

  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId: stored.user_id,
    mobileNumber: stored.mobile_number,
    action: 'token_refresh',
    ...meta,
  });

  return { accessToken };
}

/**
 * Logout: revoke refresh token.
 */
export async function logout(refreshToken, req) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshTokenModel.findByHash(tokenHash);
    await RefreshTokenModel.revoke(tokenHash);

    if (stored) {
      const meta = getClientMeta(req);
      await AuditLogModel.create({
        userId: stored.user_id,
        mobileNumber: stored.mobile_number,
        action: 'logout',
        ...meta,
      });
    }
  }
  return { message: 'Logged out successfully.' };
}

/**
 * Get user profile by ID.
 */
export async function getProfile(userId, req) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const meta = getClientMeta(req);
  await AuditLogModel.create({
    userId,
    mobileNumber: user.mobile_number,
    action: 'profile_viewed',
    ...meta,
  });

  return {
    id: user.id,
    fullName: user.full_name,
    mobileNumber: user.mobile_number,
    isMobileVerified: user.is_mobile_verified,
    createdAt: user.created_at,
  };
}
