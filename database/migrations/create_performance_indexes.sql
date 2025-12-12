-- Performance Optimization: Additional Indexes

-- Achievements table indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_points ON achievements(points DESC);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_unlocked_at ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_points ON user_leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_rank ON user_leaderboard(rank);

-- Daily streaks indexes
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id_status ON daily_streaks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_current_streak ON daily_streaks(current_streak DESC);

-- Seasonal achievements indexes
CREATE INDEX IF NOT EXISTS idx_seasonal_achievements_season_id ON seasonal_achievements(season_id);
CREATE INDEX IF NOT EXISTS idx_user_seasonal_achievements_user_id_season_id ON user_seasonal_achievements(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_leaderboard_season_id_rank ON seasonal_leaderboard(season_id, rank);

-- Cosmetics indexes
CREATE INDEX IF NOT EXISTS idx_cosmetics_type ON cosmetics(type);
CREATE INDEX IF NOT EXISTS idx_cosmetics_rarity ON cosmetics(rarity);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id ON user_cosmetics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_customization_user_id ON user_profile_customization(user_id);

-- Events indexes (already created in create_events_system.sql)
-- But adding more specific ones
CREATE INDEX IF NOT EXISTS idx_event_challenges_difficulty ON event_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_event_progress_completed_at ON user_event_progress(completed_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_type ON analytics_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_engagement_score_desc ON user_engagement_metrics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_unlock_stats_unlock_percentage ON achievement_unlock_stats(unlock_percentage DESC);

-- Materialized Views for Common Queries

-- Top achievements by unlock count
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_achievements AS
SELECT 
  a.id,
  a.name,
  a.icon,
  a.points,
  COUNT(ua.id) as unlock_count,
  ROUND(COUNT(ua.id)::numeric / (SELECT COUNT(*) FROM auth.users)::numeric * 100, 2) as unlock_percentage
FROM achievements a
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
GROUP BY a.id, a.name, a.icon, a.points
ORDER BY unlock_count DESC;

-- User engagement summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_engagement_summary AS
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT b.id) as total_battles,
  COUNT(DISTINCT ua.id) as total_achievements,
  COALESCE(ds.current_streak, 0) as current_streak,
  COALESCE(ds.longest_streak, 0) as longest_streak,
  COALESCE(SUM(a.points), 0) as total_points,
  MAX(ua.unlocked_at) as last_achievement_date,
  MAX(b.created_at) as last_battle_date
FROM auth.users u
LEFT JOIN battles b ON u.id = b.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN achievements a ON ua.achievement_id = a.id
LEFT JOIN daily_streaks ds ON u.id = ds.user_id
GROUP BY u.id, u.email, ds.current_streak, ds.longest_streak;

-- Seasonal leaderboard summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_seasonal_leaderboard_summary AS
SELECT 
  s.id as season_id,
  s.name as season_name,
  u.id as user_id,
  u.email,
  COUNT(DISTINCT usa.id) as achievements_unlocked,
  COALESCE(SUM(sa.points), 0) as total_points,
  ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY COALESCE(SUM(sa.points), 0) DESC) as rank
FROM seasons s
CROSS JOIN auth.users u
LEFT JOIN user_seasonal_achievements usa ON u.id = usa.user_id AND s.id = usa.season_id
LEFT JOIN seasonal_achievements sa ON usa.achievement_id = sa.id
GROUP BY s.id, s.name, u.id, u.email;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_mv_top_achievements_unlock_count ON mv_top_achievements(unlock_count DESC);
CREATE INDEX IF NOT EXISTS idx_mv_user_engagement_summary_total_points ON mv_user_engagement_summary(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_mv_seasonal_leaderboard_summary_rank ON mv_seasonal_leaderboard_summary(rank);

-- Refresh materialized views periodically (requires pg_cron extension)
-- SELECT cron.schedule('refresh_top_achievements', '0 */6 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_achievements');
-- SELECT cron.schedule('refresh_user_engagement', '0 */4 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_engagement_summary');
-- SELECT cron.schedule('refresh_seasonal_leaderboard', '0 */2 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_seasonal_leaderboard_summary');
