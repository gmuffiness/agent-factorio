-- CLI login sessions for magic link email verification
CREATE TABLE cli_login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  user_id UUID,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Index for polling lookups
CREATE INDEX idx_cli_login_sessions_token ON cli_login_sessions (token);

-- Auto-cleanup expired sessions
CREATE INDEX idx_cli_login_sessions_expires ON cli_login_sessions (expires_at);

ALTER TABLE cli_login_sessions ENABLE ROW LEVEL SECURITY;
