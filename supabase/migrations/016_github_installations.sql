-- GitHub App installations linked to organizations
CREATE TABLE github_installations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  installation_id BIGINT NOT NULL,
  github_account_login TEXT NOT NULL,
  github_account_type TEXT NOT NULL,
  installed_by TEXT REFERENCES org_members(id),
  created_at TEXT NOT NULL DEFAULT now()::text,
  updated_at TEXT NOT NULL DEFAULT now()::text,
  UNIQUE(org_id, installation_id)
);

ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_github_installations_org ON github_installations(org_id);
