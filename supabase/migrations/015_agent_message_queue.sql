-- Agent message queue for polling-based relay (OpenClaw without Funnel)
CREATE TABLE IF NOT EXISTS agent_message_queue (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  user_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_amq_agent_status ON agent_message_queue(agent_id, status);
CREATE INDEX idx_amq_created ON agent_message_queue(created_at);

-- Poll token for connector authentication
ALTER TABLE agents ADD COLUMN IF NOT EXISTS poll_token TEXT;

-- Enable RLS (service role bypasses)
ALTER TABLE agent_message_queue ENABLE ROW LEVEL SECURITY;
