-- AI/ML Enhancement Database Schema for Kognisia
-- These tables support the adaptive learning and collaborative filtering features

-- User performance tracking for ML training
CREATE TABLE IF NOT EXISTS user_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subtest_name VARCHAR(100) NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  time_spent INTEGER NOT NULL, -- in seconds
  difficulty_level DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content ratings for collaborative filtering
CREATE TABLE IF NOT EXISTS user_content_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(100) NOT NULL, -- Can be subtest, specific content, etc.
  content_type VARCHAR(50) NOT NULL, -- 'subtest', 'question', 'topic', etc.
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  difficulty_feedback INTEGER CHECK (difficulty_feedback >= 1 AND difficulty_feedback <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- AI predictions tracking
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subtest VARCHAR(100) NOT NULL,
  predicted_accuracy DECIMAL(5,2) NOT NULL,
  actual_accuracy DECIMAL(5,2), -- Filled after attempt
  confidence_score DECIMAL(3,2) NOT NULL,
  recommended_difficulty DECIMAL(3,1) NOT NULL,
  model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  prediction_type VARCHAR(50) NOT NULL, -- 'performance', 'difficulty', 'recommendation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actual_updated_at TIMESTAMP WITH TIME ZONE -- When actual performance is recorded
);

-- Learning path progress
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subtest_order INTEGER NOT NULL,
  subtest_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'mastered'
  target_accuracy DECIMAL(5,2) DEFAULT 70.0,
  current_accuracy DECIMAL(5,2),
  difficulty_level DECIMAL(3,1) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subtest_order)
);

-- Adaptive difficulty adjustments
CREATE TABLE IF NOT EXISTS adaptive_difficulty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subtest VARCHAR(100) NOT NULL,
  base_difficulty DECIMAL(3,1) DEFAULT 1.0,
  current_difficulty DECIMAL(3,1) DEFAULT 1.0,
  adjustment_factor DECIMAL(3,2) DEFAULT 1.0, -- AI-calculated multiplier
  last_adjustment_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performance_window INTEGER DEFAULT 10, -- Number of recent attempts to consider
  target_accuracy_range VARCHAR(20) DEFAULT '70-80', -- Target accuracy range
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subtest)
);

-- Collaborative filtering similarity cache
CREATE TABLE IF NOT EXISTS user_similarity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  similar_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5,4) NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(user_id, similar_user_id)
);

-- Content recommendations log
CREATE TABLE IF NOT EXISTS content_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  recommendation_score DECIMAL(5,2) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  recommendation_reason TEXT,
  algorithm_used VARCHAR(50) NOT NULL, -- 'collaborative', 'content_based', 'hybrid'
  user_action VARCHAR(50), -- 'viewed', 'started', 'completed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acted_at TIMESTAMP WITH TIME ZONE
);

-- ML model performance metrics
CREATE TABLE IF NOT EXISTS ml_model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'accuracy', 'mae', 'rmse', 'confidence'
  metric_value DECIMAL(10,4) NOT NULL,
  training_data_size INTEGER,
  test_data_size INTEGER,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id ON user_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_subtest ON user_performance(subtest_name);
CREATE INDEX IF NOT EXISTS idx_user_performance_created_at ON user_performance(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_content_ratings_user_id ON user_content_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_ratings_content_id ON user_content_ratings(content_id);
CREATE INDEX IF NOT EXISTS idx_user_content_ratings_rating ON user_content_ratings(rating DESC);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_id ON ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created_at ON ai_predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status);

CREATE INDEX IF NOT EXISTS idx_adaptive_difficulty_user_id ON adaptive_difficulty_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_similarity_cache_user_id ON user_similarity_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_similarity_cache_expires ON user_similarity_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_content_recommendations_user_id ON content_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_score ON content_recommendations(recommendation_score DESC);

-- Row Level Security Policies
ALTER TABLE user_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_difficulty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_similarity_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own performance data" ON user_performance
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ratings" ON user_content_ratings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions" ON ai_predictions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning paths" ON learning_paths
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own difficulty settings" ON adaptive_difficulty_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own similarity cache" ON user_similarity_cache
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recommendations" ON content_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Only system/roles can view model metrics
CREATE POLICY "System can view model metrics" ON ml_model_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'system')
    )
  );