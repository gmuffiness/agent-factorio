-- Session tracking: add active session columns to agents + create activity_events table

-- ── Session columns on agents ─────────────────────────────────────────────────
-- session_id: UUID of the current Claude Code session (null when idle)
-- session_started_at: when the current session began
-- current_task: short description of what the agent is doing right now
ALTER TABLE agents ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS current_task TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_agents_session_id ON agents(session_id) WHERE session_id IS NOT NULL;

-- ── Activity Events ───────────────────────────────────────────────────────────
-- Records fine-grained activity events emitted by the CLI daemon during a session.
-- event_type values:
--   session_start  — session opened
--   session_end    — session closed (daemon exit / stop hook)
--   tool_use       — a tool was invoked (tool_name populated)
--   task_update    — agent updated its current_task description
--   heartbeat      — periodic keep-alive ping from the daemon
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'session_start',
    'session_end',
    'tool_use',
    'task_update',
    'heartbeat'
  )),
  tool_name TEXT,
  task_description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_agent_session
  ON activity_events(agent_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_events_org_recent
  ON activity_events(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_events_session_id
  ON activity_events(session_id);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
