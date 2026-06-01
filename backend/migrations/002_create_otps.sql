-- OTPs table: stores OTP records with expiry and attempt tracking
CREATE TYPE otp_purpose AS ENUM ('login', 'register', 'forgot_password');

CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose otp_purpose NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otps_mobile_purpose ON otps(mobile_number, purpose);
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);
