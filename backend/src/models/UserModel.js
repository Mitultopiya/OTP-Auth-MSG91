import pool from '../config/database.js';

/**
 * Data access layer for users table.
 */
const UserModel = {
  async findByMobile(mobileNumber) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE mobile_number = $1',
      [mobileNumber]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, full_name, mobile_number, is_mobile_verified, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ fullName, mobileNumber, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, mobile_number, password_hash, is_mobile_verified)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, full_name, mobile_number, is_mobile_verified, created_at`,
      [fullName, mobileNumber, passwordHash]
    );
    return rows[0];
  },

  async updatePassword(userId, passwordHash) {
    const { rows } = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, full_name, mobile_number`,
      [passwordHash, userId]
    );
    return rows[0] || null;
  },

  async markMobileVerified(mobileNumber) {
    await pool.query(
      'UPDATE users SET is_mobile_verified = TRUE, updated_at = NOW() WHERE mobile_number = $1',
      [mobileNumber]
    );
  },
};

export default UserModel;
