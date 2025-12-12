-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  bonus_multiplier DECIMAL(3, 2) DEFAULT 1.5,
  status VARCHAR(20) DEFAULT 'active', -- active, upcoming, ended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_challenges table
CREATE TABLE IF NOT EXISTS event_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  challenge_code VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, challenge_code)
);

-- Create user_event_progress table
CREATE TABLE IF NOT EXISTS user_event_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES event_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id, challenge_id)
);

-- Create user_event_participation table
CREATE TABLE IF NOT EXISTS user_event_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  UNIQUE(user_id, event_id)
);

-- Create indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_event_challenges_event_id ON event_challenges(event_id);
CREATE INDEX idx_user_event_progress_user_id ON user_event_progress(user_id);
CREATE INDEX idx_user_event_progress_event_id ON user_event_progress(event_id);
CREATE INDEX idx_user_event_participation_user_id ON user_event_participation(user_id);
CREATE INDEX idx_user_event_participation_event_id ON user_event_participation(event_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_participation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events (public read)
CREATE POLICY "events_select_public" ON events
  FOR SELECT USING (true);

-- RLS Policies for event_challenges (public read)
CREATE POLICY "event_challenges_select_public" ON event_challenges
  FOR SELECT USING (true);

-- RLS Policies for user_event_progress (users can see their own)
CREATE POLICY "user_event_progress_select" ON user_event_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_event_progress_insert" ON user_event_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_event_progress_update" ON user_event_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_event_participation (users can see their own)
CREATE POLICY "user_event_participation_select" ON user_event_participation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_event_participation_insert" ON user_event_participation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_event_participation_update" ON user_event_participation
  FOR UPDATE USING (auth.uid() = user_id);
