-- Performance Optimization: Additional Indexes

-- Achievements table indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_points ON achievements(points DESC);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_unlocked_at ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Seasonal achievements indexes
CREATE INDEX IF NOT EXISTS idx_seasonal_achievements_season_id ON seasonal_achievements(season_id);
CREATE INDEX IF NOT EXISTS idx_user_seasonal_achievements_user_id_season_id ON user_seasonal_achievements(user_id, season_id);

-- Cosmetics indexes
CREATE INDEX IF NOT EXISTS idx_cosmetics_type ON cosmetics(type);
CREATE INDEX IF NOT EXISTS idx_cosmetics_rarity ON cosmetics(rarity);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id ON user_cosmetics(user_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_event_challenges_difficulty ON event_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_event_progress_completed_at ON user_event_progress(completed_at DESC);

-- Analytics indexes (already created in create_analytics_tables.sql, but adding composite indexes)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_type ON analytics_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_user_id_score ON user_engagement_metrics(user_id, engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_unlock_stats_unlock_percentage ON achievement_unlock_stats(unlock_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_seasonal_performance_stats_user_season ON seasonal_performance_stats(user_id, season_id);

-- Performance optimization complete
-- All essential indexes have been created for better query performance
