-- 1. conversation_participants junction table
CREATE TABLE conversation_participants (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL,
  UNIQUE(conversation_id, agent_id)
);
CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_agent ON conversation_participants(agent_id);

-- 2. messages에 agent_id 추가 (어떤 에이전트가 응답했는지)
ALTER TABLE messages ADD COLUMN agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL;

-- 3. conversations에서 agent_id를 nullable로 변경 (하위호환)
ALTER TABLE conversations ALTER COLUMN agent_id DROP NOT NULL;

-- 4. 기존 대화 데이터 마이그레이션: 기존 agent_id → participants로 복사
INSERT INTO conversation_participants (id, conversation_id, agent_id, joined_at)
SELECT 'cp-' || id, id, agent_id, created_at FROM conversations WHERE agent_id IS NOT NULL;
