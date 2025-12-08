-- Migration: Create subtests reference table for UTBK 2026 structure
-- This table stores the official 6 subtests according to UTBK 2026 specifications

CREATE TABLE IF NOT EXISTS subtests (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL,
  utbk_question_count INTEGER NOT NULL,
  utbk_duration_minutes DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_subtests_display_order ON subtests(display_order);

-- Insert UTBK 2026 official subtests
-- Total: 160 questions, 195 minutes (3 hours 15 minutes)
-- Note: PPU includes merged "Penalaran Umum" (PU) from original 7-subtest structure
INSERT INTO subtests (code, name, description, icon, display_order, utbk_question_count, utbk_duration_minutes) VALUES
('PPU', 'Pengetahuan & Pemahaman Umum', 'Tes pengetahuan umum dan wawasan (termasuk Penalaran Umum)', '🌍', 1, 50, 45),
('PBM', 'Pemahaman Bacaan & Menulis', 'Tes pemahaman teks dan kemampuan menulis', '📖', 2, 20, 25),
('PK', 'Pengetahuan Kuantitatif', 'Tes kemampuan kuantitatif dan logika matematika', '🔢', 3, 20, 20),
('LIT_INDO', 'Literasi Bahasa Indonesia', 'Tes literasi dan pemahaman bahasa Indonesia', '📚', 4, 30, 42.5),
('LIT_ING', 'Literasi Bahasa Inggris', 'Tes literasi dan pemahaman bahasa Inggris', '🌐', 5, 20, 20),
('PM', 'Penalaran Matematika', 'Tes penalaran dan pemecahan masalah matematika', '🧮', 6, 20, 42.5)
ON CONFLICT (code) DO UPDATE SET
  utbk_question_count = EXCLUDED.utbk_question_count,
  utbk_duration_minutes = EXCLUDED.utbk_duration_minutes,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify the data
-- Expected: 6 rows, total 160 questions, total 195 minutes
SELECT 
  COUNT(*) as total_subtests,
  SUM(utbk_question_count) as total_questions,
  SUM(utbk_duration_minutes) as total_minutes
FROM subtests;
