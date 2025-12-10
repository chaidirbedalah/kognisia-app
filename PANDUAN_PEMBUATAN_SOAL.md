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

| question_text | option_a | option_b | option_c | option_d | option_e | correct_answer | subtest_utbk | is_hots | hint_text | solution_steps |
|---------------|----------|----------|----------|----------|----------|----------------|--------------|---------|-----------|----------------|
| Soal 1... | A | B | C | D | E | D | PM | false | Hint... | Steps... |
| Soal 2... | A | B | C | D | E | A | PU | true | Hint... | Steps... |

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
  "is_hots": false,
  "hint_text": "Gunakan rumus suku ke-n barisan aritmatika: Un = a + (n-1)b",
  "solution_steps": "U3 = 12, U7 = 24. Beda b = (24-12)/(7-3) = 3. Suku pertama a = 12 - 2(3) = 6. U10 = 6 + 9(3) = 33"
}
```

## 📖 Soal Multi-Question dengan Teks Bacaan

### **Cara Menangani Soal dengan Teks Bacaan Bersama:**

Banyak subtest UTBK menggunakan satu teks/passage untuk beberapa pertanyaan. Setiap soal tetap diinput sebagai entry terpisah di database dengan teks bacaan diulang di setiap `question_text`.

### **Subtest yang Sering Menggunakan Format Ini:**

- **PU** (Penalaran Umum): Analisis logika dan argumen
- **PBM** (Pemahaman Bacaan & Menulis): Pemahaman teks dan struktur bahasa
- **LIT_INDO** (Literasi Bahasa Indonesia): Analisis sastra dan tata bahasa
- **LIT_ING** (Literasi Bahasa Inggris): Reading comprehension
- **PPU** (Pengetahuan & Pemahaman Umum): Konteks pengetahuan umum

### **Contoh 1: Penalaran Umum (PU)**

**Teks Bacaan:**
> "Tanaman anggrek bulan terkenal karena keindahan bunganya sehingga banyak orang berani membayar mahal untuk membelinya. Namun, ternyata anggrek bulan tidak rajin berbunga apabila tidak mendapatkan lingkungan yang sesuai. Pemilik yang berpengalaman dan disiplin dapat menciptakan lingkungan yang sesuai bagi anggrek bulan. Pemberian lingkungan yang sesuai adalah bagian dari perawatan anggrek bulan. Ciri-ciri bunga anggrek yang mendapatkan perawatan yang tepat adalah bunganya mekar sempurna, tidak layu, dan tidak berjamur."

**Soal PU-1 - Penalaran Deduktif (Regular):**
```json
{
  "question_text": "Tanaman anggrek bulan terkenal karena keindahan bunganya sehingga banyak orang berani membayar mahal untuk membelinya. Namun, ternyata anggrek bulan tidak rajin berbunga apabila tidak mendapatkan lingkungan yang sesuai. Pemilik yang berpengalaman dan disiplin dapat menciptakan lingkungan yang sesuai bagi anggrek bulan. Pemberian lingkungan yang sesuai adalah bagian dari perawatan anggrek bulan. Ciri-ciri bunga anggrek yang mendapatkan perawatan yang tepat adalah bunganya mekar sempurna, tidak layu, dan tidak berjamur.\n\nBerdasarkan bacaan tersebut, manakah simpulan berikut yang TEPAT?",
  "option_a": "Pemiliknya tidak berpengalaman dan disiplin jika anggrek bulan rajin berbunga.",
  "option_b": "Pemiliknya berpengalaman dan disiplin jika anggrek bulan tidak rajin berbunga.",
  "option_c": "Anggrek bulan rajin berbunga jika pemiliknya tidak berpengalaman dan disiplin.",
  "option_d": "Anggrek bulan tidak rajin berbunga jika pemiliknya berpengalaman dan disiplin.",
  "option_e": "Anggrek bulan tidak rajin berbunga jika pemiliknya tidak berpengalaman dan disiplin.",
  "correct_answer": "E",
  "subtest_utbk": "PU",
  "is_hots": false,
  "hint_text": "Perhatikan hubungan sebab-akibat: lingkungan sesuai → rajin berbunga. Pemilik berpengalaman → lingkungan sesuai.",
  "solution_steps": "Dari teks: anggrek tidak rajin berbunga JIKA tidak dapat lingkungan sesuai. Pemilik berpengalaman dapat menciptakan lingkungan sesuai. Kontrapositif: jika pemilik TIDAK berpengalaman → TIDAK dapat lingkungan sesuai → TIDAK rajin berbunga."
}
```

**Soal PU-2 - Analisis Argumen (HOTS):**
```json
{
  "question_text": "Tanaman anggrek bulan terkenal karena keindahan bunganya sehingga banyak orang berani membayar mahal untuk membelinya. Namun, ternyata anggrek bulan tidak rajin berbunga apabila tidak mendapatkan lingkungan yang sesuai. Pemilik yang berpengalaman dan disiplin dapat menciptakan lingkungan yang sesuai bagi anggrek bulan. Pemberian lingkungan yang sesuai adalah bagian dari perawatan anggrek bulan. Ciri-ciri bunga anggrek yang mendapatkan perawatan yang tepat adalah bunganya mekar sempurna, tidak layu, dan tidak berjamur.\n\nManakah informasi berikut yang dapat MEMPERKUAT pernyataan 'Tanaman anggrek bulan terkenal karena keindahan bunganya'?",
  "option_a": "Tanaman anggrek bulan sering kali dijadikan hiasan pada acara-acara penting.",
  "option_b": "Banyak tanaman anggrek lain yang bunganya tidak seindah anggrek bulan.",
  "option_c": "Banyak orang yang mengetahui keindahan anggrek bulan meskipun tidak memilikinya.",
  "option_d": "Banyak orang menanam anggrek bulan karena nilai investasinya yang tinggi.",
  "option_e": "Beberapa orang yang gemar memelihara bunga tidak mengenal tanaman anggrek bulan.",
  "correct_answer": "A",
  "subtest_utbk": "PU",
  "is_hots": true,
  "hint_text": "Cari bukti yang menunjukkan pengakuan terhadap keindahan anggrek bulan di masyarakat.",
  "solution_steps": "Opsi A memperkuat karena menunjukkan anggrek bulan dipilih untuk acara penting karena keindahannya. Opsi B-E tidak secara langsung mendukung ketenaran karena keindahan."
}
```

### **Contoh 2: Literasi Bahasa Indonesia (LIT_INDO)**

**Teks Bacaan:**
> "Dalam novel 'Laskar Pelangi', Andrea Hirata menggambarkan perjuangan anak-anak Belitung untuk mendapatkan pendidikan. Melalui tokoh Ikal, pengarang menyampaikan pesan bahwa pendidikan adalah kunci untuk mengubah nasib. Gaya bahasa yang digunakan Andrea Hirata sangat puitis dan penuh metafora, membuat pembaca terhanyut dalam cerita."

**Soal LIT_INDO-1 - Analisis Unsur Intrinsik (Regular):**
```json
{
  "question_text": "Dalam novel 'Laskar Pelangi', Andrea Hirata menggambarkan perjuangan anak-anak Belitung untuk mendapatkan pendidikan. Melalui tokoh Ikal, pengarang menyampaikan pesan bahwa pendidikan adalah kunci untuk mengubah nasib. Gaya bahasa yang digunakan Andrea Hirata sangat puitis dan penuh metafora, membuat pembaca terhanyut dalam cerita.\n\nBerdasarkan teks tersebut, tema utama novel 'Laskar Pelangi' adalah...",
  "option_a": "Perjuangan hidup di daerah terpencil",
  "option_b": "Pentingnya pendidikan untuk masa depan",
  "option_c": "Keindahan alam Pulau Belitung",
  "option_d": "Persahabatan anak-anak sekolah",
  "option_e": "Kemiskinan masyarakat Indonesia",
  "correct_answer": "B",
  "subtest_utbk": "LIT_INDO",
  "is_hots": false
}
```

### **Contoh 3: Literasi Bahasa Inggris (LIT_ING)**

**Teks Bacaan:**
> "Climate change is one of the most pressing issues of our time. Rising global temperatures have led to melting ice caps, rising sea levels, and extreme weather patterns. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of this phenomenon. Immediate action is required to reduce greenhouse gas emissions and transition to renewable energy sources."

**Soal LIT_ING-1 - Reading Comprehension (Regular):**
```json
{
  "question_text": "Climate change is one of the most pressing issues of our time. Rising global temperatures have led to melting ice caps, rising sea levels, and extreme weather patterns. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of this phenomenon. Immediate action is required to reduce greenhouse gas emissions and transition to renewable energy sources.\n\nAccording to the passage, what is the main cause of climate change?",
  "option_a": "Natural weather patterns",
  "option_b": "Solar radiation changes",
  "option_c": "Human activities, especially burning fossil fuels",
  "option_d": "Volcanic eruptions",
  "option_e": "Ocean current changes",
  "correct_answer": "C",
  "subtest_utbk": "LIT_ING",
  "is_hots": false
}
```

### **Contoh 4: Pemahaman Bacaan & Menulis (PBM)**

**Teks Bacaan:**
> "Penggunaan media sosial telah mengubah cara manusia berkomunikasi. Di satu sisi, media sosial memudahkan orang untuk terhubung dengan keluarga dan teman yang jauh. Namun, di sisi lain, penggunaan berlebihan dapat menyebabkan kecanduan dan mengurangi interaksi sosial langsung. Penelitian menunjukkan bahwa remaja yang menghabiskan lebih dari 3 jam sehari di media sosial cenderung mengalami masalah kesehatan mental."

**Soal PBM-1 - Analisis Struktur Teks (HOTS):**
```json
{
  "question_text": "Penggunaan media sosial telah mengubah cara manusia berkomunikasi. Di satu sisi, media sosial memudahkan orang untuk terhubung dengan keluarga dan teman yang jauh. Namun, di sisi lain, penggunaan berlebihan dapat menyebabkan kecanduan dan mengurangi interaksi sosial langsung. Penelitian menunjukkan bahwa remaja yang menghabiskan lebih dari 3 jam sehari di media sosial cenderung mengalami masalah kesehatan mental.\n\nPola pengembangan paragraf dalam teks tersebut adalah...",
  "option_a": "Sebab-akibat",
  "option_b": "Perbandingan dan pertentangan",
  "option_c": "Kronologis",
  "option_d": "Definisi dan contoh",
  "option_e": "Klasifikasi",
  "correct_answer": "B",
  "subtest_utbk": "PBM",
  "is_hots": true
}
```

### **Tipe-Tipe Soal Multi-Question Berdasarkan Subtest:**

#### **PU (Penalaran Umum):**
- Penalaran Deduktif/Induktif
- Analisis Argumen
- Penalaran Kausal
- Evaluasi Bukti

#### **LIT_INDO (Literasi Bahasa Indonesia):**
- Analisis Unsur Intrinsik/Ekstrinsik
- Interpretasi Makna
- Gaya Bahasa dan Majas
- Struktur Teks

#### **LIT_ING (Literasi Bahasa Inggris):**
- Reading Comprehension
- Vocabulary in Context
- Main Ideas and Details
- Inference and Implication

#### **PBM (Pemahaman Bacaan & Menulis):**
- Struktur dan Pola Teks
- Kohesi dan Koherensi
- Analisis Wacana
- Ejaan dan Tata Bahasa

#### **PPU (Pengetahuan & Pemahaman Umum):**
- Konteks Sejarah/Geografi
- Fenomena Sosial
- Sains dan Teknologi
- Budaya dan Seni

### **Tips Pembuatan Soal Multi-Question:**

#### **Umum untuk Semua Subtest:**
- **Gunakan konteks nyata** dan relevan dengan kehidupan siswa
- **Buat teks bacaan 100-200 kata** untuk 3-5 soal
- **Variasikan tingkat kesulitan** dalam satu set soal
- **Pastikan setiap soal bisa berdiri sendiri** meski menggunakan teks yang sama
- **Buat pengecoh yang masuk akal** dan menguji pemahaman berbeda

#### **Khusus per Subtest:**
- **PU**: Fokus pada logika dan penalaran, hindari pengetahuan khusus
- **LIT_INDO**: Gunakan teks sastra/nonsastra berkualitas, perhatikan EYD
- **LIT_ING**: Pilih teks dengan vocabulary level yang sesuai
- **PBM**: Variasikan jenis teks (argumentatif, deskriptif, naratif)
- **PPU**: Pilih topik yang umum diketahui tapi tidak terlalu spesifik

#### **Format Database:**
- **Ulangi teks lengkap** di setiap `question_text`
- **Tambahkan nomor soal** dalam set (contoh: "Soal 1 dari 4")
- **Gunakan `\n\n`** untuk memisahkan teks bacaan dan pertanyaan
- **Konsisten dalam penomoran** dan format

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
  correct_answer, subtest_utbk, is_hots, hint_text, solution_steps
) VALUES (
  'Soal anda...',
  'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E',
  'D', 'PM', false, 'Hint...', 'Steps...'
);
```

### Method 3: Admin Interface (Future)
- Web interface untuk input soal
- Preview dan validasi otomatis
- Bulk upload dari Excel/CSV

## 📊 Target Jumlah Soal

### **Minimum untuk Launch:**
- **Per Subtest:** 50 soal (Regular: 35, HOTS: 15)
- **Total:** 350 soal untuk 7 subtest

### **Target Ideal:**
- **Per Subtest:** 200 soal (Regular: 140, HOTS: 60)  
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
2. Buat outline topik dan distribusi Regular vs HOTS
3. Setup template dan tools

### **Phase 2: Content Creation (2-3 minggu)**
1. Buat soal per subtest sesuai target (70% Regular, 30% HOTS)
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