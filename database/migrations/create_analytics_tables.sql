-- Create analytics_events table for tracking user actions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- achievement_unlocked, battle_completed, streak_updated, etc
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_engagement_metrics table
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_battles INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create achievement_unlock_stats table
CREATE TABLE IF NOT EXISTS achievement_unlock_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  total_unlocks INTEGER DEFAULT 0,
  unlock_percentage DECIMAL(5, 2) DEFAULT 0,
  average_unlock_time_days DECIMAL(5, 2),
  last_unlocked_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(achievement_id)
);

-- Create seasonal_performance_stats table
CREATE TABLE IF NOT EXISTS seasonal_performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  battles_completed INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  performance_score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

-- Create daily_engagement_stats table
CREATE TABLE IF NOT EXISTS daily_engagement_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_active_users INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  total_achievements_unlocked INTEGER DEFAULT 0,
  average_session_duration_minutes DECIMAL(8, 2),
  new_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_user_engagement_metrics_user_id ON user_engagement_metrics(user_id);
CREATE INDEX idx_user_engagement_metrics_engagement_score ON user_engagement_metrics(engagement_score DESC);
CREATE INDEX idx_achievement_unlock_stats_achievement_id ON achievement_unlock_stats(achievement_id);
CREATE INDEX idx_seasonal_performance_stats_user_id ON seasonal_performance_stats(user_id);
CREATE INDEX idx_seasonal_performance_stats_season_id ON seasonal_performance_stats(season_id);
CREATE INDEX idx_seasonal_performance_stats_rank ON seasonal_performance_stats(rank);
CREATE INDEX idx_daily_engagement_stats_date ON daily_engagement_stats(date);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_unlock_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_engagement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events (users can see their own)
CREATE POLICY "analytics_events_select" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_events_insert" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_engagement_metrics (users can see their own)
CREATE POLICY "user_engagement_metrics_select" ON user_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for achievement_unlock_stats (public read)
CREATE POLICY "achievement_unlock_stats_select_public" ON achievement_unlock_stats
  FOR SELECT USING (true);

-- RLS Policies for seasonal_performance_stats (users can see their own)
CREATE POLICY "seasonal_performance_stats_select" ON seasonal_performance_stats
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for daily_engagement_stats (public read)
CREATE POLICY "daily_engagement_stats_select_public" ON daily_engagement_stats
  FOR SELECT USING (true);
