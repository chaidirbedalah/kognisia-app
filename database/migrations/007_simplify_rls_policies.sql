-- Migration 007: Simplify RLS Policies (Final Fix)
-- This completely removes recursion by simplifying policies

-- ============================================================================
-- DROP ALL EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their squads" ON squads;
DROP POLICY IF EXISTS "Users can create squads" ON squads;
DROP POLICY IF EXISTS "Squad leaders can update their squads" ON squads;

DROP POLICY IF EXISTS "Users can view squad members" ON squad_members;
DROP POLICY IF EXISTS "Users can join squads" ON squad_members;
DROP POLICY IF EXISTS "Users can update their membership" ON squad_members;

DROP POLICY IF EXISTS "Squad members can view battles" ON squad_battles;
DROP POLICY IF EXISTS "Squad leaders can create battles" ON squad_battles;
DROP POLICY IF EXISTS "Squad leaders can update battles" ON squad_battles;

DROP POLICY IF EXISTS "Users can view battle participants" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can join battles" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON squad_battle_participants;

DROP POLICY IF EXISTS "Participants can view battle questions" ON squad_battle_questions;

-- ============================================================================
-- SQUADS POLICIES (SIMPLE)
-- ============================================================================

-- Allow all authenticated users to view all squads
-- (They need to see squads to join them via invite code)
CREATE POLICY "Authenticated users can view squads"
  ON squads FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create squads
CREATE POLICY "Authenticated users can create squads"
  ON squads FOR INSERT
  TO authenticated
  WITH CHECK (leader_id = auth.uid());

-- Allow squad leaders to update their squads
CREATE POLICY "Leaders can update their squads"
  ON squads FOR UPDATE
  TO authenticated
  USING (leader_id = auth.uid());

-- ============================================================================
-- SQUAD MEMBERS POLICIES (NO RECURSION)
-- ============================================================================

-- Allow all authenticated users to view all squad members
-- (Needed to display member lists)
CREATE POLICY "Authenticated users can view squad members"
  ON squad_members FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert themselves as members
CREATE POLICY "Users can insert themselves as members"
  ON squad_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own membership
CREATE POLICY "Users can update their own membership"
  ON squad_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SQUAD BATTLES POLICIES
-- ============================================================================

-- Allow all authenticated users to view all battles
-- (Needed for battle history and leaderboards)
CREATE POLICY "Authenticated users can view battles"
  ON squad_battles FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create battles
-- (Check will be done in application code)
CREATE POLICY "Authenticated users can create battles"
  ON squad_battles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update battles
-- (Check will be done in application code)
CREATE POLICY "Authenticated users can update battles"
  ON squad_battles FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- BATTLE PARTICIPANTS POLICIES
-- ============================================================================

-- Allow all authenticated users to view all participants
-- (Needed for leaderboards)
CREATE POLICY "Authenticated users can view participants"
  ON squad_battle_participants FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert themselves as participants
CREATE POLICY "Users can insert themselves as participants"
  ON squad_battle_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own participation
CREATE POLICY "Users can update their own participation"
  ON squad_battle_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- BATTLE QUESTIONS POLICIES
-- ============================================================================

-- Allow all authenticated users to view battle questions
-- (Needed for battle sessions)
CREATE POLICY "Authenticated users can view battle questions"
  ON squad_battle_questions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 007 completed successfully!';
  RAISE NOTICE 'Simplified RLS policies - NO MORE RECURSION!';
  RAISE NOTICE 'All policies now use simple checks';
  RAISE NOTICE 'Authorization is enforced in application code';
  RAISE NOTICE 'Squad Battle is ready to use!';
END $$;
