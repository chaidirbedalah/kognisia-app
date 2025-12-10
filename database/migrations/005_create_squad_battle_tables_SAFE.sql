-- Migration 005: Create Squad Battle Tables (SAFE VERSION)
-- This migration creates all tables needed for Squad Battle feature
-- SAFE: Drops existing tables first to avoid conflicts

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if any) - IN CORRECT ORDER
-- ============================================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS squad_battle_questions CASCADE;
DROP TABLE IF EXISTS squad_battle_participants CASCADE;
DROP TABLE IF EXISTS squad_battles CASCADE;
DROP TABLE IF EXISTS squad_members CASCADE;
DROP TABLE IF EXISTS squads CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_invite_code() CASCADE;
DROP FUNCTION IF EXISTS update_squad_updated_at() CASCADE;

-- ============================================================================
-- SQUADS TABLE
-- ============================================================================

CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 30),
  invite_code TEXT UNIQUE NOT NULL CHECK (char_length(invite_code) = 6),
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 8 CHECK (max_members >= 2 AND max_members <= 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for squads
CREATE INDEX idx_squads_leader_id ON squads(leader_id);
CREATE INDEX idx_squads_invite_code ON squads(invite_code);
CREATE INDEX idx_squads_is_active ON squads(is_active);

-- ============================================================================
-- SQUAD MEMBERS TABLE
-- ============================================================================

CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(squad_id, user_id)
);

-- Indexes for squad_members
CREATE INDEX idx_squad_members_squad_id ON squad_members(squad_id);
CREATE INDEX idx_squad_members_user_id ON squad_members(user_id);
CREATE INDEX idx_squad_members_is_active ON squad_members(is_active);

-- ============================================================================
-- SQUAD BATTLES TABLE
-- ============================================================================

CREATE TABLE squad_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  total_questions INTEGER DEFAULT 10 CHECK (total_questions >= 5 AND total_questions <= 20),
  time_limit_minutes INTEGER DEFAULT 15 CHECK (time_limit_minutes >= 5 AND time_limit_minutes <= 30),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for squad_battles
CREATE INDEX idx_squad_battles_squad_id ON squad_battles(squad_id);
CREATE INDEX idx_squad_battles_status ON squad_battles(status);
CREATE INDEX idx_squad_battles_started_at ON squad_battles(started_at);

-- ============================================================================
-- SQUAD BATTLE PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE squad_battle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES squad_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  accuracy DECIMAL(5,2) DEFAULT 0.00,
  rank INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_id, user_id)
);

-- Indexes for squad_battle_participants
CREATE INDEX idx_squad_battle_participants_battle_id ON squad_battle_participants(battle_id);
CREATE INDEX idx_squad_battle_participants_user_id ON squad_battle_participants(user_id);
CREATE INDEX idx_squad_battle_participants_score ON squad_battle_participants(score DESC);

-- ============================================================================
-- SQUAD BATTLE QUESTIONS TABLE
-- ============================================================================

CREATE TABLE squad_battle_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES squad_battles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_id, question_id),
  UNIQUE(battle_id, question_order)
);

-- Indexes for squad_battle_questions
CREATE INDEX idx_squad_battle_questions_battle_id ON squad_battle_questions(battle_id);
CREATE INDEX idx_squad_battle_questions_question_id ON squad_battle_questions(question_id);
CREATE INDEX idx_squad_battle_questions_order ON squad_battle_questions(battle_id, question_order);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique 6-digit invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code (uppercase)
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM squads WHERE invite_code = code) INTO exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update squad updated_at timestamp
CREATE OR REPLACE FUNCTION update_squad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_squad_updated_at
  BEFORE UPDATE ON squads
  FOR EACH ROW
  EXECUTE FUNCTION update_squad_updated_at();

CREATE TRIGGER trigger_update_squad_battle_updated_at
  BEFORE UPDATE ON squad_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_squad_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_questions ENABLE ROW LEVEL SECURITY;

-- Squads policies
CREATE POLICY "Users can view squads they are members of"
  ON squads FOR SELECT
  USING (
    id IN (
      SELECT squad_id FROM squad_members 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can create squads"
  ON squads FOR INSERT
  WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Squad leaders can update their squads"
  ON squads FOR UPDATE
  USING (leader_id = auth.uid());

-- Squad members policies
CREATE POLICY "Users can view squad members of their squads"
  ON squad_members FOR SELECT
  USING (
    squad_id IN (
      SELECT squad_id FROM squad_members 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can join squads"
  ON squad_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave squads"
  ON squad_members FOR UPDATE
  USING (user_id = auth.uid());

-- Squad battles policies
CREATE POLICY "Squad members can view their squad battles"
  ON squad_battles FOR SELECT
  USING (
    squad_id IN (
      SELECT squad_id FROM squad_members 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Squad leaders can create battles"
  ON squad_battles FOR INSERT
  WITH CHECK (
    squad_id IN (
      SELECT id FROM squads WHERE leader_id = auth.uid()
    )
  );

-- Battle participants policies
CREATE POLICY "Users can view battle participants"
  ON squad_battle_participants FOR SELECT
  USING (
    battle_id IN (
      SELECT sb.id FROM squad_battles sb
      JOIN squad_members sm ON sb.squad_id = sm.squad_id
      WHERE sm.user_id = auth.uid() AND sm.is_active = TRUE
    )
  );

CREATE POLICY "Users can join battles"
  ON squad_battle_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON squad_battle_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Battle questions policies
CREATE POLICY "Battle participants can view questions"
  ON squad_battle_questions FOR SELECT
  USING (
    battle_id IN (
      SELECT battle_id FROM squad_battle_participants
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

-- Test invite code generation
SELECT generate_invite_code() as sample_invite_code;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 005 completed successfully!';
  RAISE NOTICE 'Created tables: squads, squad_members, squad_battles, squad_battle_participants, squad_battle_questions';
  RAISE NOTICE 'Created helper function: generate_invite_code()';
  RAISE NOTICE 'Enabled RLS policies for all Squad Battle tables';
  RAISE NOTICE 'Ready for Squad Battle feature implementation!';
END $$;
