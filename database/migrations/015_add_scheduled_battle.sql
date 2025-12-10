-- Migration 015: Add Scheduled Battle Support
-- Adds scheduling functionality for squad battles

-- ============================================================================
-- UPDATE SQUAD_BATTLES TABLE
-- ============================================================================

-- Add scheduled_start_at column
ALTER TABLE squad_battles
ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMPTZ;

-- Update status check constraint to include 'scheduled'
ALTER TABLE squad_battles
DROP CONSTRAINT IF EXISTS squad_battles_status_check;

ALTER TABLE squad_battles
ADD CONSTRAINT squad_battles_status_check 
CHECK (status IN ('scheduled', 'waiting', 'active', 'completed', 'cancelled'));

-- Add index for scheduled battles
CREATE INDEX IF NOT EXISTS idx_squad_battles_scheduled 
ON squad_battles(scheduled_start_at) 
WHERE status = 'scheduled';

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_squad_battles_status 
ON squad_battles(status);

-- ============================================================================
-- CREATE BATTLE_NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES squad_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('battle_scheduled', 'battle_starting', 'battle_started')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Prevent duplicate notifications
  UNIQUE(battle_id, user_id, notification_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_battle_notifications_user 
ON battle_notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_battle_notifications_battle 
ON battle_notifications(battle_id);

-- ============================================================================
-- CREATE FUNCTION: Auto-start scheduled battles
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_start_scheduled_battles()
RETURNS void AS $$
DECLARE
  v_battle_record RECORD;
  v_squad_members UUID[];
BEGIN
  -- Find battles that should start now
  FOR v_battle_record IN 
    SELECT id, squad_id, scheduled_start_at
    FROM squad_battles
    WHERE status = 'scheduled'
    AND scheduled_start_at <= NOW()
  LOOP
    -- Update battle status to active
    UPDATE squad_battles
    SET 
      status = 'active',
      started_at = NOW(),
      updated_at = NOW()
    WHERE id = v_battle_record.id;
    
    -- Get all squad members
    SELECT ARRAY_AGG(user_id) INTO v_squad_members
    FROM squad_members
    WHERE squad_id = v_battle_record.squad_id
    AND is_active = TRUE;
    
    -- Create notifications for all members
    INSERT INTO battle_notifications (battle_id, user_id, notification_type, message)
    SELECT 
      v_battle_record.id,
      unnest(v_squad_members),
      'battle_started',
      'Battle has started! Join now or you will lose!'
    ON CONFLICT (battle_id, user_id, notification_type) DO NOTHING;
    
    RAISE NOTICE 'Auto-started battle: %', v_battle_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE FUNCTION: Send battle reminders
-- ============================================================================

CREATE OR REPLACE FUNCTION send_battle_reminders()
RETURNS void AS $$
DECLARE
  v_battle_record RECORD;
  v_squad_members UUID[];
BEGIN
  -- Find battles starting in 5 minutes
  FOR v_battle_record IN 
    SELECT id, squad_id, scheduled_start_at
    FROM squad_battles
    WHERE status = 'scheduled'
    AND scheduled_start_at > NOW()
    AND scheduled_start_at <= NOW() + INTERVAL '5 minutes'
  LOOP
    -- Get all squad members
    SELECT ARRAY_AGG(user_id) INTO v_squad_members
    FROM squad_members
    WHERE squad_id = v_battle_record.squad_id
    AND is_active = TRUE;
    
    -- Create reminder notifications
    INSERT INTO battle_notifications (battle_id, user_id, notification_type, message)
    SELECT 
      v_battle_record.id,
      unnest(v_squad_members),
      'battle_starting',
      'Battle starting in 5 minutes! Be there or beware!'
    ON CONFLICT (battle_id, user_id, notification_type) DO NOTHING;
    
    RAISE NOTICE 'Sent reminders for battle: %', v_battle_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE FUNCTION: Notify squad members about new battle
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_squad_battle_scheduled()
RETURNS TRIGGER AS $$
DECLARE
  v_squad_members UUID[];
  v_scheduled_time TEXT;
BEGIN
  -- Only for scheduled battles
  IF NEW.status = 'scheduled' AND NEW.scheduled_start_at IS NOT NULL THEN
    -- Get all squad members
    SELECT ARRAY_AGG(user_id) INTO v_squad_members
    FROM squad_members
    WHERE squad_id = NEW.squad_id
    AND is_active = TRUE;
    
    -- Format scheduled time
    v_scheduled_time := TO_CHAR(NEW.scheduled_start_at, 'DD Mon YYYY, HH24:MI');
    
    -- Create notifications for all members
    INSERT INTO battle_notifications (battle_id, user_id, notification_type, message)
    SELECT 
      NEW.id,
      unnest(v_squad_members),
      'battle_scheduled',
      'New battle scheduled for ' || v_scheduled_time || '. Be there or beware!'
    ON CONFLICT (battle_id, user_id, notification_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS after_battle_scheduled ON squad_battles;
CREATE TRIGGER after_battle_scheduled
AFTER INSERT ON squad_battles
FOR EACH ROW
EXECUTE FUNCTION notify_squad_battle_scheduled();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN squad_battles.scheduled_start_at IS 'When the battle will auto-start (NULL for immediate start)';
COMMENT ON COLUMN squad_battles.status IS 'Battle status: scheduled (not started yet), waiting (deprecated), active (in progress), completed, cancelled';
COMMENT ON TABLE battle_notifications IS 'In-app notifications for battle events';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 015 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Added:';
  RAISE NOTICE '  - scheduled_start_at column to squad_battles';
  RAISE NOTICE '  - "scheduled" status for battles';
  RAISE NOTICE '  - battle_notifications table';
  RAISE NOTICE '  - auto_start_scheduled_battles() function';
  RAISE NOTICE '  - send_battle_reminders() function';
  RAISE NOTICE '  - Auto-notification trigger';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Features:';
  RAISE NOTICE '  - Schedule battles for future time';
  RAISE NOTICE '  - Auto-start when time arrives';
  RAISE NOTICE '  - In-app notifications';
  RAISE NOTICE '  - 5-minute reminder before start';
  RAISE NOTICE '  - Late join allowed (time keeps running)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTE: Set up cron job to call:';
  RAISE NOTICE '  - auto_start_scheduled_battles() every minute';
  RAISE NOTICE '  - send_battle_reminders() every minute';
  RAISE NOTICE '';
END $$;
