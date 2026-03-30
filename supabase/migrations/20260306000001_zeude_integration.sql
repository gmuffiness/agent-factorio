-- Zeude Integration: Team standard MCP servers, skills, hooks, usage events, skill keywords

-- ── Team Standard MCP Servers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_standard_mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  command TEXT NOT NULL DEFAULT '',
  args JSONB NOT NULL DEFAULT '[]',
  env JSONB NOT NULL DEFAULT '{}',
  is_global BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT REFERENCES org_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_standard_mcp_servers_org_id ON team_standard_mcp_servers(org_id);

ALTER TABLE team_standard_mcp_servers ENABLE ROW LEVEL SECURITY;

-- ── Team Standard Skills ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_standard_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  keywords JSONB NOT NULL DEFAULT '[]',
  secondary_keywords JSONB NOT NULL DEFAULT '[]',
  is_global BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT REFERENCES org_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_standard_skills_org_id ON team_standard_skills(org_id);
CREATE INDEX IF NOT EXISTS idx_team_standard_skills_slug ON team_standard_skills(org_id, slug);

ALTER TABLE team_standard_skills ENABLE ROW LEVEL SECURITY;

-- ── Team Standard Hooks ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_standard_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('UserPromptSubmit', 'Stop', 'PreToolUse', 'PostToolUse')),
  description TEXT NOT NULL DEFAULT '',
  script_content TEXT NOT NULL DEFAULT '',
  script_type TEXT NOT NULL DEFAULT 'bash',
  env JSONB NOT NULL DEFAULT '{}',
  is_global BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT REFERENCES org_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_standard_hooks_org_id ON team_standard_hooks(org_id);

ALTER TABLE team_standard_hooks ENABLE ROW LEVEL SECURITY;

-- ── Usage Events ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('session_start', 'session_end', 'prompt', 'tool_use')),
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,6) NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_agent_created ON usage_events(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_org_created ON usage_events(org_id, created_at);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- ── Add keywords columns to existing skills table ─────────────────────────────
ALTER TABLE skills ADD COLUMN IF NOT EXISTS keywords JSONB NOT NULL DEFAULT '[]';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS secondary_keywords JSONB NOT NULL DEFAULT '[]';
