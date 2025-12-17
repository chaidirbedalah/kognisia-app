-- Create topics table for question categorization
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  subtest_code VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_subtest_code ON topics(subtest_code);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);

-- Add RLS policies
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read topics
CREATE POLICY "Users can view topics" ON topics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for service role to manage topics
CREATE POLICY "Service role can manage topics" ON topics
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default topics for each subtest
INSERT INTO topics (name, subtest_code, description) VALUES
-- Penalaran Umum (PU)
('Logika dan Silogisme', 'PU', 'Latihan penalaran logis dan silogisme'),
('Analisis Argumen', 'PU', 'Menganalisis kekuatan dan kelemahan argumen'),
('Pola dan Analogi', 'PU', 'Mengidentifikasi pola dan hubungan analogi'),

-- Pengetahuan & Pemahaman Umum (PPU)
('Sejarah Indonesia', 'PPU', 'Pengetahuan sejarah nasional Indonesia'),
('Geografi', 'PPU', 'Pengetahuan geografis dan wilayah'),
('Budaya dan Sosial', 'PPU', 'Pengetahuan tentang kebudayaan dan masyarakat'),
('Sains Umum', 'PPU', 'Pengetahuan dasar sains dan teknologi'),

-- Pemahaman Bacaan & Menulis (PBM)
('Struktur Teks', 'PBM', 'Analisis struktur dan organisasi teks'),
('Pemahaman Bacaan', 'PBM', 'Kemampuan memahami isi bacaan'),
('Tata Bahasa', 'PBM', 'Kaidah dan aturan bahasa Indonesia'),
('Menulis Kreatif', 'PBM', 'Kemampuan menulis kreatif dan efektif'),

-- Pengetahuan Kuantitatif (PK)
('Aritmatika Dasar', 'PK', 'Operasi hitung dasar dan bilangan'),
('Aljabar', 'PK', 'Konsep aljabar dan persamaan'),
('Geometri', 'PK', 'Bangun ruang dan bidang datar'),
('Statistika Dasar', 'PK', 'Pengolahan data dan statistik elementer'),

-- Literasi Bahasa Indonesia (LIT_INDO)
('Literasi Sastra', 'LIT_INDO', 'Pemahaman karya sastra Indonesia'),
('Tata Bahasa Indonesia', 'LIT_INDO', 'Kaidah bahasa Indonesia yang baik dan benar'),
('Pemahaman Teks', 'LIT_INDO', 'Kemampuan memahami teks bahasa Indonesia'),

-- Literasi Bahasa Inggris (LIT_ING)
('Reading Comprehension', 'LIT_ING', 'Pemahaman teks bahasa Inggris'),
('Vocabulary', 'LIT_ING', 'Kosakata bahasa Inggris dan penggunaannya'),
('Grammar', 'LIT_ING', 'Struktur kalimat dan tata bahasa Inggris'),

-- Penalaran Matematika (PM)
('Fungsi dan Persamaan', 'PM', 'Konsep fungsi dan penyelesaian persamaan'),
('Barisan dan Deret', 'PM', 'Barisan aritmatika, geometri, dan deret'),
('Trigonometri', 'PM', 'Konsep trigonometri dan perhitungannya'),
('Kalkulus Dasar', 'PM', 'Turunan dan integral dasar'),
('Probabilitas', 'PM', 'Teori peluang dan perhitungannya'),
('Geometri Lanjut', 'PM', 'Bangun ruang dan transformasi geometri')

ON CONFLICT (subtest_code, name) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_topics_updated_at 
  BEFORE UPDATE ON topics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();