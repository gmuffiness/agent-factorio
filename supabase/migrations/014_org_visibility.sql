-- Add visibility column to organizations
ALTER TABLE organizations
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('public', 'private'));
