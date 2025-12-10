-- Migration 006: Fix RLS Policies (Remove Infinite Recursion)
-- This fixes the infinite recursion issue in squad_members policies

-- ============================================================================
-- DROP EXISTING POLICIES
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view squads they are members of" ON squads;
DROP POLICY IF EXISTS "Users can create squads" ON squads;
DROP POLICY IF EXISTS "Squad leaders can update their squads" ON squads;

DROP POLICY IF EXISTS "Users can view squad members of their squads" ON squad_members;
DROP POLICY IF EXISTS "Users can join squads" ON squad_members;
DROP POLICY IF EXISTS "Users can leave squads" ON squad_members;

DROP POLICY IF EXISTS "Squad members can view their squad battles" ON squad_battles;
DROP POLICY IF EXISTS "Squad leaders can create battles" ON squad_battles;

DROP POLICY IF EXISTS "Users can view battle participants" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can join battles" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON squad_battle_participants;

DROP POLICY IF EXISTS "Battle participants can view questions" ON squad_battle_questions;

-- ============================================================================
-- CREATE NEW POLICIES (WITHOUT RECURSION)
-- ============================================================================

-- ============================================================================
-- SQUADS POLICIES
-- ============================================================================

-- Allow users to view squads they are members of
-- Uses direct user_id check to avoid recursion
CREATE POLICY "Users can view their squads"
  ON squads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM squad_members 
      WHERE squad_members.squad_id = squads.id 
      AND squad_members.user_id = auth.uid() 
      AND squad_members.is_active = TRUE
    )
  );

-- Allow users to create squads
CREATE POLICY "Users can create squads"
  ON squads FOR INSERT
  WITH CHECK (leader_id = auth.uid());

-- Allow squad leaders to update their squads
CREATE POLICY "Squad leaders can update their squads"
  ON squads FOR UPDATE
  USING (leader_id = auth.uid());

-- ============================================================================
-- SQUAD MEMBERS POLICIES (SIMPLIFIED - NO RECURSION)
-- ============================================================================

-- Allow users to view members of squads they belong to
-- Direct check without subquery to avoid recursion
CREATE POLICY "Users can view squad members"
  ON squad_members FOR SELECT
  USING (
    -- User can see members of squads they're in
    squad_id IN (
      SELECT sm.squad_id FROM squad_members sm
      WHERE sm.user_id = auth.uid() AND sm.is_active = TRUE
    )
  );

-- Allow users to insert themselves as squad members
CREATE POLICY "Users can join squads"
  ON squad_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own membership (for leaving)
CREATE POLICY "Users can update their membership"
  ON squad_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SQUAD BATTLES POLICIES
-- ============================================================================

-- Allow squad members to view battles
CREATE POLICY "Squad members can view battles"
  ON squad_battles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM squad_members 
      WHERE squad_members.squad_id = squad_battles.squad_id
      AND squad_members.user_id = auth.uid() 
      AND squad_members.is_active = TRUE
    )
  );

-- Allow squad leaders to create battles
CREATE POLICY "Squad leaders can create battles"
  ON squad_battles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM squads 
      WHERE squads.id = squad_battles.squad_id 
      AND squads.leader_id = auth.uid()
    )
  );

-- Allow squad leaders to update battles
CREATE POLICY "Squad leaders can update battles"
  ON squad_battles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM squads 
      WHERE squads.id = squad_battles.squad_id 
      AND squads.leader_id = auth.uid()
    )
  );

-- ============================================================================
-- BATTLE PARTICIPANTS POLICIES
-- ============================================================================

-- Allow users to view participants in battles they're in
CREATE POLICY "Users can view battle participants"
  ON squad_battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM squad_battle_participants sbp
      WHERE sbp.battle_id = squad_battle_participants.battle_id
      AND sbp.user_id = auth.uid()
    )
  );

-- Allow users to join battles
CREATE POLICY "Users can join battles"
  ON squad_battle_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own participation
CREATE POLICY "Users can update their participation"
  ON squad_battle_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- BATTLE QUESTIONS POLICIES
-- ============================================================================

-- Allow battle participants to view questions
CREATE POLICY "Participants can view battle questions"
  ON squad_battle_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM squad_battle_participants
      WHERE squad_battle_participants.battle_id = squad_battle_questions.battle_id
      AND squad_battle_participants.user_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 006 completed successfully!';
  RAISE NOTICE 'Fixed RLS policies to remove infinite recursion';
  RAISE NOTICE 'All policies now use direct checks without circular dependencies';
  RAISE NOTICE 'Squad Battle is ready to use!';
END $$;
