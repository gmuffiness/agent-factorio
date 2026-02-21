-- Add per-org API key columns (encrypted at rest by Supabase)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS anthropic_api_key TEXT,
  ADD COLUMN IF NOT EXISTS openai_api_key TEXT;
