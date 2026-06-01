-- Audit logs table: tracks login and authentication activities
CREATE TYPE audit_action AS ENUM (
    'login_otp_sent',
    'login_otp_verified',
    'login_password',
    'login_failed',
    'register',
    'register_otp_sent',
    'logout',
    'forgot_password_otp_sent',
    'password_reset',
    'token_refresh',
    'profile_viewed'
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mobile_number VARCHAR(15),
    action audit_action NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_mobile ON audit_logs(mobile_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
