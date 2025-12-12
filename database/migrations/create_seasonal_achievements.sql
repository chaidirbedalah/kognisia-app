-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  theme VARCHAR(50), -- 'winter', 'spring', 'summer', 'autumn', 'special'
  icon_emoji VARCHAR(10),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create seasonal_achievements table
CREATE TABLE IF NOT EXISTS seasonal_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  points INT DEFAULT 0,
  rarity VARCHAR(20), -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  unlock_condition JSONB,
  is_limited_time BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season_id, code)
);

-- Create user_seasonal_achievements table
CREATE TABLE IF NOT EXISTS user_seasonal_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seasonal_achievement_id UUID NOT NULL REFERENCES seasonal_achievements(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, seasonal_achievement_id)
);

-- Create seasonal_leaderboard table
CREATE TABLE IF NOT EXISTS seasonal_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  achievement_count INT DEFAULT 0,
  rank INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season_id, user_id)
);

-- Create indexes
CREATE INDEX idx_seasons_active ON seasons(is_active);
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX idx_seasonal_achievements_season_id ON seasonal_achievements(season_id);
CREATE INDEX idx_user_seasonal_achievements_user_id ON user_seasonal_achievements(user_id);
CREATE INDEX idx_user_seasonal_achievements_season_id ON user_seasonal_achievements(season_id);
CREATE INDEX idx_seasonal_leaderboard_season_id ON seasonal_leaderboard(season_id);
CREATE INDEX idx_seasonal_leaderboard_rank ON seasonal_leaderboard(season_id, rank);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seasonal_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active seasons" ON seasons FOR SELECT 
  USING (is_active = true OR NOW() < end_date);

CREATE POLICY "Anyone can view seasonal achievements" ON seasonal_achievements FOR SELECT 
  USING (true);

CREATE POLICY "Users can view their own seasonal achievements" ON user_seasonal_achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view seasonal leaderboard" ON seasonal_leaderboard FOR SELECT 
  USING (true);

-- Insert sample seasons
INSERT INTO seasons (name, description, theme, icon_emoji, start_date, end_date, is_active) VALUES
('Winter Challenge 2025', 'Tantangan musim dingin dengan achievement eksklusif', 'winter', '❄️', NOW(), NOW() + INTERVAL '30 days', true),
('New Year 2025', 'Rayakan tahun baru dengan achievement spesial', 'special', '🎆', NOW() + INTERVAL '30 days', NOW() + INTERVAL '60 days', false),
('Spring Bloom', 'Musim semi penuh warna dan achievement baru', 'spring', '🌸', NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', false)
ON CONFLICT DO NOTHING;

-- Insert sample seasonal achievements for Winter Challenge
INSERT INTO seasonal_achievements (season_id, code, name, description, icon_emoji, points, rarity, is_limited_time) 
SELECT id, 'winter_warrior', 'Winter Warrior', 'Complete 5 battles in Winter Challenge', '⛄', 50, 'rare', true
FROM seasons WHERE name = 'Winter Challenge 2025'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_achievements (season_id, code, name, description, icon_emoji, points, rarity, is_limited_time) 
SELECT id, 'frost_master', 'Frost Master', 'Achieve 100% accuracy in 3 consecutive battles', '🧊', 75, 'epic', true
FROM seasons WHERE name = 'Winter Challenge 2025'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_achievements (season_id, code, name, description, icon_emoji, points, rarity, is_limited_time) 
SELECT id, 'blizzard_champion', 'Blizzard Champion', 'Rank 1st in seasonal leaderboard', '🌪️', 100, 'legendary', true
FROM seasons WHERE name = 'Winter Challenge 2025'
ON CONFLICT DO NOTHING;

