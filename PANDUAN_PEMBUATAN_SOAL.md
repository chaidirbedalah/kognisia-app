# 📚 Panduan Lengkap Pembuatan Soal UTBK 2026

## 🎯 Overview

Panduan ini untuk asisten yang akan membuat soal-soal UTBK 2026 untuk aplikasi Kognisia. Soal akan dimasukkan ke database `question_bank` dan bisa dipanggil dalam berbagai fitur aplikasi.

## 📊 Struktur Database Question Bank

### Required Fields (Wajib Diisi):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `question_text` | TEXT | Teks soal utama | "Jika f(x) = 2x + 3, maka nilai f(5) adalah..." |
| `option_a` | TEXT | Pilihan jawaban A | "10" |
| `option_b` | TEXT | Pilihan jawaban B | "11" |
| `option_c` | TEXT | Pilihan jawaban C | "12" |
| `option_d` | TEXT | Pilihan jawaban D | "13" |
| `option_e` | TEXT | Pilihan jawaban E | "14" |
| `correct_answer` | TEXT | Jawaban benar (A/B/C/D/E) | "D" |
| `subtest_utbk` | TEXT | Kode subtest | "PM" |
| `is_hots` | BOOLEAN | Apakah soal HOTS | false |

### Optional Fields (Opsional tapi Direkomendasikan):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `hint_text` | TEXT | Petunjuk untuk siswa | "Substitusi nilai x = 5 ke dalam fungsi" |
| `solution_steps` | TEXT | Langkah penyelesaian | "f(5) = 2(5) + 3 = 10 + 3 = 13" |
| `question_image_url` | TEXT | URL gambar soal (jika ada) | "https://..." |
| `difficulty` | TEXT | Compatibility field | "medium" |
| `logic_clues` | TEXT | Petunjuk logika | "Gunakan substitusi langsung" |
| `distractor_analysis` | TEXT | Analisis pengecoh | "Opsi A-C adalah hasil perhitungan yang salah" |

## 🎯 7 Subtest UTBK 2026

### 1. **PU** - Penalaran Umum
- **Kode:** `PU`
- **Materi:** Penalaran Induktif, Deduktif, dan Kuantitatif
- **Contoh Topik:** Logika, pola, analogi, silogisme

### 2. **PPU** - Pengetahuan & Pemahaman Umum  
- **Kode:** `PPU`
- **Materi:** Pengetahuan umum dan wawasan
- **Contoh Topik:** Sejarah, geografi, budaya, sains umum

### 3. **PBM** - Pemahaman Bacaan & Menulis
- **Kode:** `PBM` 
- **Materi:** Pemahaman teks dan kemampuan menulis
- **Contoh Topik:** Analisis teks, struktur kalimat, ejaan

### 4. **PK** - Pengetahuan Kuantitatif
- **Kode:** `PK`
- **Materi:** Kemampuan kuantitatif dan logika matematika
- **Contoh Topik:** Aritmatika, aljabar dasar, geometri

### 5. **LIT_INDO** - Literasi Bahasa Indonesia
- **Kode:** `LIT_INDO`
- **Materi:** Literasi dan pemahaman bahasa Indonesia
- **Contoh Topik:** Tata bahasa, sastra, pemahaman bacaan

### 6. **LIT_ING** - Literasi Bahasa Inggris  
- **Kode:** `LIT_ING`
- **Materi:** Literasi dan pemahaman bahasa Inggris
- **Contoh Topik:** Grammar, vocabulary, reading comprehension

### 7. **PM** - Penalaran Matematika
- **Kode:** `PM`
- **Materi:** Penalaran dan pemecahan masalah matematika  
- **Contoh Topik:** Fungsi, trigonometri, kalkulus, statistika

## 📝 Template Pembuatan Soal

### Format Excel/Google Sheets:

| question_text | option_a | option_b | option_c | option_d | option_e | correct_answer | subtest_utbk | difficulty | hint_text | solution_steps |
|---------------|----------|----------|----------|----------|----------|----------------|--------------|------------|-----------|----------------|
| Soal 1... | A | B | C | D | E | D | PM | easy | Hint... | Steps... |
| Soal 2... | A | B | C | D | E | A | PU | medium | Hint... | Steps... |

### Contoh Soal Lengkap:

```json
{
  "question_text": "Dalam suatu barisan aritmatika, suku ke-3 adalah 12 dan suku ke-7 adalah 24. Berapa suku ke-10?",
  "option_a": "30",
  "option_b": "33", 
  "option_c": "36",
  "option_d": "39",
  "option_e": "42",
  "correct_answer": "B",
  "subtest_utbk": "PM",
  "difficulty": "medium",
  "hint_text": "Gunakan rumus suku ke-n barisan aritmatika: Un = a + (n-1)b",
  "solution_steps": "U3 = 12, U7 = 24. Beda b = (24-12)/(7-3) = 3. Suku pertama a = 12 - 2(3) = 6. U10 = 6 + 9(3) = 33"
}
```

## 🎯 Kategori Soal

### **Regular (Non-HOTS)**
- Soal pemahaman konsep dan aplikasi langsung
- Mengukur pengetahuan dan pemahaman
- Perhitungan dan penerapan rumus
- **Target:** Mayoritas siswa bisa menjawab dengan persiapan yang baik

### **HOTS (Higher Order Thinking Skills)**
- Soal analisis, evaluasi, dan kreasi
- Mengukur kemampuan berpikir tingkat tinggi
- Problem solving kompleks dan multi-konsep
- **Target:** Siswa dengan kemampuan analisis yang baik

### **Karakteristik HOTS:**
- **Analisis:** Memecah informasi menjadi bagian-bagian
- **Evaluasi:** Menilai dan membuat keputusan berdasarkan kriteria
- **Kreasi:** Menggabungkan elemen untuk membuat sesuatu yang baru
- **Problem Solving:** Menyelesaikan masalah non-rutin

## 📋 Checklist Kualitas Soal

### ✅ **Content Quality:**
- [ ] Soal sesuai dengan kurikulum UTBK 2026
- [ ] Bahasa jelas dan tidak ambigu
- [ ] Pilihan jawaban logis dan proporsional
- [ ] Hanya ada 1 jawaban yang benar
- [ ] Pengecoh (distractor) masuk akal

### ✅ **Technical Requirements:**
- [ ] Semua field wajib terisi
- [ ] Kode subtest benar (PU/PPU/PBM/PK/LIT_INDO/LIT_ING/PM)
- [ ] Correct answer format benar (A/B/C/D/E)
- [ ] HOTS classification benar (true/false)
- [ ] Hint dan solution steps informatif

### ✅ **Format Standards:**
- [ ] Teks soal maksimal 500 karakter
- [ ] Setiap opsi maksimal 100 karakter
- [ ] Hint maksimal 200 karakter
- [ ] Solution steps maksimal 500 karakter

## 🔧 Cara Input Soal ke Database

### Method 1: Bulk Insert via Script (Recommended)

1. **Siapkan file CSV/Excel** dengan format template di atas
2. **Convert ke JSON** atau **SQL INSERT statements**
3. **Gunakan script import** yang akan saya buatkan

### Method 2: Manual Insert via SQL

```sql
INSERT INTO question_bank (
  question_text, option_a, option_b, option_c, option_d, option_e,
  correct_answer, subtest_utbk, difficulty, hint_text, solution_steps
) VALUES (
  'Soal anda...',
  'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E',
  'D', 'PM', 'medium', 'Hint...', 'Steps...'
);
```

### Method 3: Admin Interface (Future)
- Web interface untuk input soal
- Preview dan validasi otomatis
- Bulk upload dari Excel/CSV

## 📊 Target Jumlah Soal

### **Minimum untuk Launch:**
- **Per Subtest:** 50 soal (easy: 20, medium: 20, hard: 10)
- **Total:** 350 soal untuk 7 subtest

### **Target Ideal:**
- **Per Subtest:** 200 soal (easy: 80, medium: 80, hard: 40)  
- **Total:** 1,400 soal untuk 7 subtest

### **Prioritas Pembuatan:**
1. **PM** (Penalaran Matematika) - Paling sering digunakan
2. **PU** (Penalaran Umum) - Core reasoning skills
3. **LIT_INDO** (Literasi Bahasa Indonesia) - Wajib semua siswa
4. **PK** (Pengetahuan Kuantitatif) - Matematika dasar
5. **LIT_ING** (Literasi Bahasa Inggris) - International standard
6. **PBM** (Pemahaman Bacaan & Menulis) - Communication skills
7. **PPU** (Pengetahuan & Pemahaman Umum) - General knowledge

## 🚀 Workflow Pembuatan Soal

### **Phase 1: Planning (1-2 hari)**
1. Review kurikulum UTBK 2026 per subtest
2. Buat outline topik dan distribusi kesulitan
3. Setup template dan tools

### **Phase 2: Content Creation (2-3 minggu)**
1. Buat soal per subtest sesuai target
2. Review dan validasi kualitas
3. Format sesuai template database

### **Phase 3: Quality Assurance (3-5 hari)**
1. Review semua soal oleh expert
2. Test soal dengan sample siswa
3. Revisi berdasarkan feedback

### **Phase 4: Database Import (1 hari)**
1. Final formatting dan validation
2. Bulk import ke database
3. Testing di aplikasi

## 📞 Support & Koordinasi

**Untuk asisten pembuat soal:**
- Gunakan template yang sudah disediakan
- Fokus pada kualitas, bukan kuantitas
- Konsultasi jika ada keraguan tentang materi
- Regular check-in untuk progress update

**Tools yang akan saya sediakan:**
- Script import soal ke database
- Validator format soal
- Preview interface untuk testing
- Analytics dashboard untuk tracking progress

---

**Ready to create amazing questions for Indonesian students! 🎓✨**