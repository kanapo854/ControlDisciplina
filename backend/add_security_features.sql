-- Migration: Add MFA and password policy fields to users table
-- Add password history table

-- Add fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_expired BOOLEAN DEFAULT FALSE;

-- Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_changed_at ON password_history(changed_at DESC);

-- Set last_password_change to current timestamp for existing users (if NULL)
UPDATE users 
SET last_password_change = CURRENT_TIMESTAMP 
WHERE last_password_change IS NULL;

-- Comment the table
COMMENT ON TABLE password_history IS 'Stores password history to prevent reuse of last 5 passwords';
COMMENT ON COLUMN users.mfa_enabled IS 'Whether MFA/2FA is enabled for this user';
COMMENT ON COLUMN users.mfa_secret IS 'Secret key for TOTP-based MFA (currently unused, email OTP in use)';
COMMENT ON COLUMN users.last_password_change IS 'Timestamp of last password change for expiration tracking';
COMMENT ON COLUMN users.password_expired IS 'Whether password has expired and needs reset';
