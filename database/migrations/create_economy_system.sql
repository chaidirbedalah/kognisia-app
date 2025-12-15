-- Economy System (XP & Tickets)
-- Creates core tables and RLS policies for server-authoritative gamification economy
-- Date: 2025-12-14

-- XP Events: immutable ledger of XP gains
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL, -- e.g., 'daily_challenge', 'mini_tryout', 'squad_battle', 'cohort'
  difficulty TEXT NULL CHECK (difficulty IN ('easy','medium','hots')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket wallet: current balance (soft cap enforced in server logic)
CREATE TABLE IF NOT EXISTS ticket_wallet (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket transactions: immutable ledger of earn/spend
CREATE TABLE IF NOT EXISTS ticket_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL, -- positive for earn, negative for spend
  reason TEXT NOT NULL, -- e.g., 'daily_challenge_reward', 'cohort_entry', 'war_room_entry'
  reference_id UUID NULL, -- optional session/battle/cohort id for idempotency checks
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple XP summary materialized view (optional, can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS xp_totals AS
SELECT user_id, COALESCE(SUM(amount), 0) AS total_xp
FROM xp_events
GROUP BY user_id;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_wallet_user_id ON ticket_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transactions_user_id ON ticket_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transactions_reference ON ticket_transactions(reference_id);

-- Enable RLS
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- xp_events: users can view their own events; inserts only via service role or validated user
CREATE POLICY IF NOT EXISTS xp_events_select_own ON xp_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS xp_events_insert_own ON xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ticket_wallet: users can view their own wallet; updates only via service role or validated logic
CREATE POLICY IF NOT EXISTS ticket_wallet_select_own ON ticket_wallet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS ticket_wallet_update_own ON ticket_wallet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS ticket_wallet_insert_own ON ticket_wallet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ticket_transactions: users can view their own transactions; inserts own
CREATE POLICY IF NOT EXISTS ticket_transactions_select_own ON ticket_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS ticket_transactions_insert_own ON ticket_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helpers: ensure wallet row exists
CREATE OR REPLACE FUNCTION ensure_ticket_wallet(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ticket_wallet (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: refresh XP totals
CREATE OR REPLACE FUNCTION refresh_xp_totals()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY xp_totals;
END;
$$ LANGUAGE plpgsql;

