-- Add registered_by to agents (tracks which org member registered the agent)

ALTER TABLE agents ADD COLUMN registered_by TEXT REFERENCES org_members(id) ON DELETE SET NULL;
CREATE INDEX idx_agents_registered_by ON agents(registered_by);
