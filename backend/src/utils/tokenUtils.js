import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Signs a JWT access token for the given user payload.
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

/**
 * Signs a JWT refresh token (longer-lived).
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

/**
 * Verifies access token; throws on invalid/expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

/**
 * Verifies refresh token; throws on invalid/expired.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Hashes a refresh token for secure DB storage.
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parses refresh token expiry from env (e.g. "7d" -> Date).
 */
export function getRefreshTokenExpiry() {
  const match = env.jwt.refreshExpiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return expiresAt;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const expiresAt = new Date();
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  expiresAt.setTime(expiresAt.getTime() + value * multipliers[unit]);
  return expiresAt;
}
