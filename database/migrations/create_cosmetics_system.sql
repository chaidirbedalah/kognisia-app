-- Create cosmetics table
CREATE TABLE IF NOT EXISTS cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'badge', 'theme', 'avatar_frame', 'title'
  icon_emoji VARCHAR(10),
  rarity VARCHAR(20), -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  unlock_condition JSONB, -- e.g., {"type": "achievement", "achievement_id": "..."}
  is_purchasable BOOLEAN DEFAULT false,
  price INT DEFAULT 0, -- in points
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_cosmetics table
CREATE TABLE IF NOT EXISTS user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

-- Create user_profile_customization table
CREATE TABLE IF NOT EXISTS user_profile_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_badge_id UUID REFERENCES cosmetics(id) ON DELETE SET NULL,
  active_theme_id UUID REFERENCES cosmetics(id) ON DELETE SET NULL,
  active_avatar_frame_id UUID REFERENCES cosmetics(id) ON DELETE SET NULL,
  active_title_id UUID REFERENCES cosmetics(id) ON DELETE SET NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cosmetics_type ON cosmetics(type);
CREATE INDEX idx_cosmetics_rarity ON cosmetics(rarity);
CREATE INDEX idx_user_cosmetics_user_id ON user_cosmetics(user_id);
CREATE INDEX idx_user_cosmetics_cosmetic_id ON user_cosmetics(cosmetic_id);
CREATE INDEX idx_user_profile_customization_user_id ON user_profile_customization(user_id);

-- Enable RLS
ALTER TABLE cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_customization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view cosmetics" ON cosmetics FOR SELECT USING (true);

CREATE POLICY "Users can view their own cosmetics" ON user_cosmetics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own customization" ON user_profile_customization FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customization" ON user_profile_customization FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert sample cosmetics
INSERT INTO cosmetics (code, name, description, type, icon_emoji, rarity, unlock_condition) VALUES
-- Badges
('badge_first_battle', 'First Battle Badge', 'Unlock after completing first battle', 'badge', '⚔️', 'common', '{"type": "achievement", "code": "first_battle"}'),
('badge_perfect_score', 'Perfect Score Badge', 'Unlock after getting 100% accuracy', 'badge', '💯', 'rare', '{"type": "achievement", "code": "perfect_score"}'),
('badge_hots_master', 'HOTS Master Badge', 'Unlock after winning 5 ELITE battles', 'badge', '🧠', 'epic', '{"type": "achievement", "code": "hots_master"}'),

-- Themes
('theme_dark', 'Dark Theme', 'Dark mode for profile', 'theme', '🌙', 'common', '{"type": "free"}'),
('theme_light', 'Light Theme', 'Light mode for profile', 'theme', '☀️', 'common', '{"type": "free"}'),
('theme_purple', 'Purple Theme', 'Purple gradient theme', 'theme', '💜', 'uncommon', '{"type": "achievement", "code": "battle_master"}'),

-- Avatar Frames
('frame_gold', 'Gold Frame', 'Golden avatar frame', 'avatar_frame', '🟡', 'rare', '{"type": "achievement", "code": "first_place"}'),
('frame_diamond', 'Diamond Frame', 'Diamond avatar frame', 'avatar_frame', '💎', 'epic', '{"type": "achievement", "code": "battle_legend"}'),

-- Titles
('title_champion', 'Champion', 'Battle Champion title', 'title', '👑', 'epic', '{"type": "achievement", "code": "battle_master"}'),
('title_legend', 'Legend', 'Battle Legend title', 'title', '⭐', 'legendary', '{"type": "achievement", "code": "battle_legend"}')
ON CONFLICT (code) DO NOTHING;

