-- Add runtime_type and gateway_url to agents table
-- runtime_type: how the agent executes and responds to chat messages
--   'cloud'    — clone git repo to cloud sandbox, AI responds based on code context (default)
--   'openclaw' — relay messages to OpenClaw gateway running on personal PC
--   'api'      — direct API call to vendor (current behavior, legacy)
-- gateway_url: endpoint URL for openclaw agents (e.g. Tailscale Funnel HTTPS URL)

ALTER TABLE agents
  ADD COLUMN runtime_type TEXT NOT NULL DEFAULT 'api'
    CHECK (runtime_type IN ('openclaw', 'cloud', 'api'));

ALTER TABLE agents
  ADD COLUMN gateway_url TEXT NOT NULL DEFAULT '';
