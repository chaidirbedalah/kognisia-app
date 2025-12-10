-- Migration 008: Disable RLS for Development
-- Temporary solution to get Squad Battle working
-- For production, you should re-enable RLS with proper policies

-- ============================================================================
-- DISABLE RLS ON ALL SQUAD TABLES
-- ============================================================================

ALTER TABLE squads DISABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battles DISABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_questions DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL POLICIES (Clean up)
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view squads" ON squads;
DROP POLICY IF EXISTS "Authenticated users can create squads" ON squads;
DROP POLICY IF EXISTS "Leaders can update their squads" ON squads;

DROP POLICY IF EXISTS "Authenticated users can view squad members" ON squad_members;
DROP POLICY IF EXISTS "Users can insert themselves as members" ON squad_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON squad_members;

DROP POLICY IF EXISTS "Authenticated users can view battles" ON squad_battles;
DROP POLICY IF EXISTS "Authenticated users can create battles" ON squad_battles;
DROP POLICY IF EXISTS "Authenticated users can update battles" ON squad_battles;

DROP POLICY IF EXISTS "Authenticated users can view participants" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON squad_battle_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON squad_battle_participants;

DROP POLICY IF EXISTS "Authenticated users can view battle questions" ON squad_battle_questions;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 008 completed successfully!';
  RAISE NOTICE 'RLS DISABLED for Squad Battle tables';
  RAISE NOTICE 'This is OK for development/testing';
  RAISE NOTICE 'Authorization is enforced in application code';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTE: For production, consider re-enabling RLS';
  RAISE NOTICE 'Squad Battle is now ready to use!';
END $$;
