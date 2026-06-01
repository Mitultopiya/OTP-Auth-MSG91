import pool from '../config/database.js';

/**
 * Data access layer for refresh tokens.
 */
const RefreshTokenModel = {
  async create({ userId, tokenHash, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  },

  async findByHash(tokenHash) {
    const { rows } = await pool.query(
      `SELECT rt.*, u.id AS user_id, u.full_name, u.mobile_number, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1
         AND rt.revoked_at IS NULL
         AND rt.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async revoke(tokenHash) {
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    );
  },

  async revokeAllForUser(userId) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  },
};

export default RefreshTokenModel;
