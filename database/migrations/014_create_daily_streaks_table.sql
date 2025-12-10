-- Migration 014: Create Daily Streaks Table
-- Tracks daily activity streaks for students

-- ============================================================================
-- CREATE DAILY_STREAKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('daily_challenge', 'squad_battle', 'mini_tryout', 'full_tryout')),
  activity_id UUID, -- Reference to the specific activity (optional)
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one entry per user per date per activity type
  UNIQUE(user_id, activity_date, activity_type)
);

-- ============================================================================
-- CREATE STREAK_STATS TABLE (Aggregated Stats)
-- ============================================================================

CREATE TABLE IF NOT EXISTS streak_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date 
ON daily_streaks(user_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_type 
ON daily_streaks(user_id, activity_type);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_date 
ON daily_streaks(activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_streak_stats_user 
ON streak_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_streak_stats_current_streak 
ON streak_stats(current_streak DESC);

-- ============================================================================
-- CREATE FUNCTION: Calculate Streak
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, total_days INTEGER) AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_prev_date DATE := NULL;
  v_total_days INTEGER := 0;
  v_date_record RECORD;
BEGIN
  -- Get distinct activity dates for user (ordered DESC)
  FOR v_date_record IN 
    SELECT DISTINCT activity_date 
    FROM daily_streaks 
    WHERE user_id = p_user_id 
    ORDER BY activity_date DESC
  LOOP
    v_total_days := v_total_days + 1;
    
    -- First iteration
    IF v_prev_date IS NULL THEN
      -- Check if last activity was today or yesterday
      IF v_date_record.activity_date >= CURRENT_DATE - INTERVAL '1 day' THEN
        v_current_streak := 1;
        v_temp_streak := 1;
      END IF;
    ELSE
      -- Check if dates are consecutive
      IF v_prev_date - v_date_record.activity_date = 1 THEN
        v_temp_streak := v_temp_streak + 1;
        -- Update current streak only if we're still in the current streak window
        IF v_current_streak > 0 THEN
          v_current_streak := v_temp_streak;
        END IF;
      ELSE
        -- Streak broken, reset temp streak
        v_temp_streak := 1;
      END IF;
    END IF;
    
    -- Track longest streak
    IF v_temp_streak > v_longest_streak THEN
      v_longest_streak := v_temp_streak;
    END IF;
    
    v_prev_date := v_date_record.activity_date;
  END LOOP;
  
  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_total_days;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE FUNCTION: Update Streak Stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_streak_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_days INTEGER;
  v_last_activity_date DATE;
BEGIN
  -- Calculate streaks
  SELECT * INTO v_current_streak, v_longest_streak, v_total_days
  FROM calculate_user_streak(p_user_id);
  
  -- Get last activity date
  SELECT MAX(activity_date) INTO v_last_activity_date
  FROM daily_streaks
  WHERE user_id = p_user_id;
  
  -- Upsert streak_stats
  INSERT INTO streak_stats (
    user_id, 
    current_streak, 
    longest_streak, 
    total_active_days, 
    last_activity_date,
    updated_at
  )
  VALUES (
    p_user_id,
    v_current_streak,
    v_longest_streak,
    v_total_days,
    v_last_activity_date,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(streak_stats.longest_streak, EXCLUDED.longest_streak),
    total_active_days = EXCLUDED.total_active_days,
    last_activity_date = EXCLUDED.last_activity_date,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGER: Auto-update streak stats
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_streak_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_streak_stats(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_daily_streak_insert ON daily_streaks;

CREATE TRIGGER after_daily_streak_insert
AFTER INSERT ON daily_streaks
FOR EACH ROW
EXECUTE FUNCTION trigger_update_streak_stats();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 014 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created:';
  RAISE NOTICE '  - daily_streaks table (activity tracking)';
  RAISE NOTICE '  - streak_stats table (aggregated stats)';
  RAISE NOTICE '  - calculate_user_streak() function';
  RAISE NOTICE '  - update_streak_stats() function';
  RAISE NOTICE '  - Auto-update trigger';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Activity Types:';
  RAISE NOTICE '  - daily_challenge';
  RAISE NOTICE '  - squad_battle';
  RAISE NOTICE '  - mini_tryout';
  RAISE NOTICE '  - full_tryout';
  RAISE NOTICE '';
END $$;
