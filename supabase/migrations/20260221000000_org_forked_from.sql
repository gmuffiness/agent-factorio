ALTER TABLE organizations ADD COLUMN forked_from TEXT REFERENCES organizations(id) ON DELETE SET NULL;
