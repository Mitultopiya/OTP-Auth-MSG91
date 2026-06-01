import pool from '../config/database.js';
import env from '../config/env.js';

/**
 * Data access layer for OTP records.
 */
const OtpModel = {
  /**
   * Invalidates previous unused OTPs for same mobile + purpose.
   */
  async invalidatePrevious(mobileNumber, purpose) {
    await pool.query(
      `UPDATE otps SET is_used = TRUE
       WHERE mobile_number = $1 AND purpose = $2 AND is_used = FALSE`,
      [mobileNumber, purpose]
    );
  },

  async create({ mobileNumber, otpHash, purpose, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO otps (mobile_number, otp_hash, purpose, max_attempts, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, mobile_number, purpose, attempts, max_attempts, expires_at, created_at`,
      [mobileNumber, otpHash, purpose, env.otp.maxAttempts, expiresAt]
    );
    return rows[0];
  },

  async findLatestValid(mobileNumber, purpose) {
    const { rows } = await pool.query(
      `SELECT * FROM otps
       WHERE mobile_number = $1 AND purpose = $2
         AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobileNumber, purpose]
    );
    return rows[0] || null;
  },

  async incrementAttempts(otpId) {
    const { rows } = await pool.query(
      `UPDATE otps SET attempts = attempts + 1
       WHERE id = $1
       RETURNING attempts, max_attempts`,
      [otpId]
    );
    return rows[0];
  },

  async markUsed(otpId) {
    await pool.query('UPDATE otps SET is_used = TRUE WHERE id = $1', [otpId]);
  },
};

export default OtpModel;
