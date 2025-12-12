-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  category VARCHAR(50), -- 'battle', 'performance', 'milestone', 'special'
  unlock_condition JSONB, -- Stores unlock criteria
  points INT DEFAULT 0,
  rarity VARCHAR(20), -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table (tracks which achievements user has unlocked)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INT DEFAULT 0, -- For multi-step achievements
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create achievement_notifications table
CREATE TABLE IF NOT EXISTS achievement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_achievement_notifications_user_id ON achievement_notifications(user_id);
CREATE INDEX idx_achievement_notifications_read ON achievement_notifications(read);

-- Insert default achievements
INSERT INTO achievements (code, name, description, icon_emoji, category, points, rarity) VALUES
-- Battle Achievements
('first_battle', 'First Battle', 'Complete your first squad battle', '⚔️', 'battle', 10, 'common'),
('battle_master', 'Battle Master', 'Win 10 squad battles', '🏆', 'battle', 50, 'rare'),
('battle_legend', 'Battle Legend', 'Win 50 squad battles', '👑', 'battle', 100, 'epic'),

-- Performance Achievements
('perfect_score', 'Perfect Score', 'Get 100% accuracy in a battle', '💯', 'performance', 30, 'rare'),
('speed_demon', 'Speed Demon', 'Complete a battle in under 5 minutes', '⚡', 'performance', 25, 'uncommon'),
('accuracy_master', 'Accuracy Master', 'Maintain 90%+ accuracy across 5 battles', '🎯', 'performance', 40, 'rare'),

-- Milestone Achievements
('first_place', 'First Place', 'Rank 1st in a squad battle', '🥇', 'milestone', 20, 'uncommon'),
('top_three', 'Top Three', 'Rank in top 3 in 5 squad battles', '🥉', 'milestone', 35, 'uncommon'),
('consistent_performer', 'Consistent Performer', 'Rank in top 3 in 10 squad battles', '📈', 'milestone', 60, 'rare'),

-- HOTS Achievements
('hots_challenger', 'HOTS Challenger', 'Complete your first ELITE battle', '🔥', 'special', 25, 'uncommon'),
('hots_master', 'HOTS Master', 'Win 5 ELITE battles', '🧠', 'special', 50, 'rare'),
('hots_legend', 'HOTS Legend', 'Win 20 ELITE battles', '🌟', 'special', 100, 'epic'),

-- Special Achievements
('early_bird', 'Early Bird', 'Join a battle within 1 minute of creation', '🐦', 'special', 15, 'uncommon'),
('comeback_king', 'Comeback King', 'Rank 1st after being in last place', '🔄', 'special', 40, 'rare'),
('squad_leader', 'Squad Leader', 'Create 5 squad battles', '👨‍💼', 'special', 30, 'uncommon'),
('social_butterfly', 'Social Butterfly', 'Join 10 different squads', '🦋', 'special', 25, 'uncommon')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON achievement_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON achievement_notifications FOR UPDATE 
  USING (auth.uid() = user_id);
