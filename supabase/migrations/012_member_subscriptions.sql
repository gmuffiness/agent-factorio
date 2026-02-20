-- Member AI service subscriptions
CREATE TABLE member_subscriptions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL DEFAULT 'other',
  cost_type TEXT NOT NULL DEFAULT 'subscription' CHECK (cost_type IN ('subscription', 'api', 'hybrid')),
  monthly_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'pay_as_you_go')),
  auto_detected BOOLEAN NOT NULL DEFAULT false,
  detection_source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_member_subs_member ON member_subscriptions(member_id);
CREATE INDEX idx_member_subs_org ON member_subscriptions(org_id);
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
