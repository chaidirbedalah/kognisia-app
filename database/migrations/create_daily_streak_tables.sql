-- Create daily_streaks table
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create streak_activities table (track daily activities)
CREATE TABLE IF NOT EXISTS streak_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50), -- 'daily_challenge', 'squad_battle', 'mini_tryout', 'tryout_utbk'
  activity_date DATE NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_type, activity_date)
);

-- Create streak_rewards table (track milestone rewards)
CREATE TABLE IF NOT EXISTS streak_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_milestone INT, -- 7, 14, 30, 60, 100, etc
  reward_type VARCHAR(50), -- 'badge', 'points', 'unlock'
  reward_value VARCHAR(255),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, streak_milestone)
);

-- Create indexes
CREATE INDEX idx_daily_streaks_user_id ON daily_streaks(user_id);
CREATE INDEX idx_streak_activities_user_id ON streak_activities(user_id);
CREATE INDEX idx_streak_activities_date ON streak_activities(activity_date);
CREATE INDEX idx_streak_rewards_user_id ON streak_rewards(user_id);

-- Enable RLS
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own streaks" ON daily_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities" ON streak_activities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rewards" ON streak_rewards FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert streak reward milestones
INSERT INTO streak_rewards (user_id, streak_milestone, reward_type, reward_value) VALUES
-- This will be populated when users unlock rewards
-- Milestones: 7, 14, 30, 60, 100, 365 days
ON CONFLICT DO NOTHING;

