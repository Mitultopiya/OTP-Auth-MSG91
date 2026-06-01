import pool from '../config/database.js';

/**
 * Data access layer for authentication audit logs.
 */
const AuditLogModel = {
  async create({ userId, mobileNumber, action, ipAddress, userAgent, metadata = {} }) {
    const { rows } = await pool.query(
      `INSERT INTO audit_logs (user_id, mobile_number, action, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, action, created_at`,
      [userId || null, mobileNumber || null, action, ipAddress || null, userAgent || null, JSON.stringify(metadata)]
    );
    return rows[0];
  },

  async findByUserId(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT id, action, ip_address, user_agent, metadata, created_at
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },
};

export default AuditLogModel;
