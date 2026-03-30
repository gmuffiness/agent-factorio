-- Add 'Notification' to the allowed hook event types
ALTER TABLE team_standard_hooks DROP CONSTRAINT IF EXISTS team_standard_hooks_event_check;
ALTER TABLE team_standard_hooks ADD CONSTRAINT team_standard_hooks_event_check
  CHECK (event IN ('UserPromptSubmit', 'Stop', 'PreToolUse', 'PostToolUse', 'Notification'));
