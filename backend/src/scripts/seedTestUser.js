import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

/** Default test account — override via .env if needed */
const TEST_USER = {
  fullName: process.env.TEST_USER_NAME || 'Test User',
  mobileNumber: process.env.TEST_USER_MOBILE || '8128187135',
  password: process.env.TEST_USER_PASSWORD || 'Testing123',
};

const SALT_ROUNDS = 12;

async function seedTestUser() {
  const { fullName, mobileNumber, password } = TEST_USER;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existing = await pool.query(
    'SELECT id FROM users WHERE mobile_number = $1',
    [mobileNumber]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users
       SET full_name = $1, password_hash = $2, is_mobile_verified = TRUE, is_active = TRUE, updated_at = NOW()
       WHERE mobile_number = $3`,
      [fullName, passwordHash, mobileNumber]
    );
    console.log('Test user updated.');
  } else {
    await pool.query(
      `INSERT INTO users (full_name, mobile_number, password_hash, is_mobile_verified, is_active)
       VALUES ($1, $2, $3, TRUE, TRUE)`,
      [fullName, mobileNumber, passwordHash]
    );
    console.log('Test user created.');
  }

  console.log('');
  console.log('--- Test login credentials ---');
  console.log(`Mobile:  +91 ${mobileNumber}`);
  console.log(`Password: ${password}`);
  console.log('Login at: http://localhost:5173/login (Password tab)');
  console.log('');
}

seedTestUser()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
