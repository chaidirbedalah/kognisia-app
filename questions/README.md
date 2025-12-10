# 📚 Question Management System

## 🎯 Quick Start untuk Asisten

### 1. **Baca Panduan Lengkap**
Baca file `PANDUAN_PEMBUATAN_SOAL.md` di root folder untuk memahami:
- Struktur database
- 7 Subtest UTBK 2026
- Format soal yang benar
- Checklist kualitas

### 2. **Gunakan Template**
- **CSV Template:** `questions/templates/template.csv`
- **JSON Template:** `questions/templates/sample-questions.json`

### 3. **Workflow Pembuatan Soal**

#### Option A: Menggunakan Excel/Google Sheets (Recommended)
1. Buka `template.csv` di Excel/Google Sheets
2. Isi soal sesuai format (satu baris = satu soal)
3. Save as CSV
4. Convert ke JSON: `npm run convert-csv your-file.csv`
5. Import ke database: `npm run import-questions your-file.json`

#### Option B: Langsung JSON
1. Copy `sample-questions.json` sebagai template
2. Edit langsung dalam format JSON
3. Import ke database: `npm run import-questions your-file.json`

### 4. **Commands yang Tersedia**

```bash
# Lihat statistik soal saat ini
npm run question-stats

# Convert CSV ke JSON
npm run convert-csv questions/math-questions.csv

# Import soal ke database
npm run import-questions questions/math-questions.json
```

## 📋 Format Template CSV

| Column | Required | Values | Example |
|--------|----------|--------|---------|
| question_text | ✅ | Text | "Berapa hasil 2+2?" |
| option_a | ✅ | Text | "3" |
| option_b | ✅ | Text | "4" |
| option_c | ✅ | Text | "5" |
| option_d | ✅ | Text | "6" |
| option_e | ✅ | Text | "7" |
| correct_answer | ✅ | A/B/C/D/E | "B" |
| subtest_utbk | ✅ | PU/PPU/PBM/PK/LIT_INDO/LIT_ING/PM | "PM" |
| is_hots | ✅ | true/false | false |
| hint_text | ❌ | Text | "Gunakan operasi penjumlahan" |
| solution_steps | ❌ | Text | "2 + 2 = 4" |
| is_hots | ❌ | true/false | "false" |

## 🎯 Target Pembuatan Soal

### **Prioritas 1 (Minimum Launch):**
- **PM (Penalaran Matematika):** 50 soal
- **PU (Penalaran Umum):** 50 soal  
- **LIT_INDO (Literasi Bahasa Indonesia):** 50 soal

### **Prioritas 2:**
- **PK (Pengetahuan Kuantitatif):** 50 soal
- **LIT_ING (Literasi Bahasa Inggris):** 50 soal

### **Prioritas 3:**
- **PBM (Pemahaman Bacaan & Menulis):** 50 soal
- **PPU (Pengetahuan & Pemahaman Umum):** 50 soal

### **Distribusi Soal per Subtest:**
- **Regular (Non-HOTS):** 35 soal (70%)
- **HOTS:** 15 soal (30%)

## ✅ Checklist Sebelum Submit

### **Content Quality:**
- [ ] Soal sesuai kurikulum UTBK 2026
- [ ] Bahasa Indonesia yang baik dan benar
- [ ] Pilihan jawaban logis dan proporsional
- [ ] Hanya 1 jawaban yang benar
- [ ] Pengecoh masuk akal

### **Technical Format:**
- [ ] Semua field wajib terisi
- [ ] Kode subtest benar
- [ ] Format correct_answer benar (A/B/C/D/E)
- [ ] HOTS classification benar (true/false)
- [ ] File CSV/JSON valid

### **Quality Assurance:**
- [ ] Soal sudah direview
- [ ] Tidak ada typo atau kesalahan
- [ ] Hint dan solution steps informatif
- [ ] Sesuai dengan tingkat kesulitan

## 🚀 Contoh Workflow

### **Day 1-2: Setup & Planning**
```bash
# Cek statistik saat ini
npm run question-stats

# Download template
# Edit questions/templates/template.csv
```

### **Day 3-10: Content Creation**
```bash
# Buat soal di Excel menggunakan template
# Save as CSV: math-questions-batch1.csv

# Convert ke JSON
npm run convert-csv questions/math-questions-batch1.csv

# Import ke database
npm run import-questions questions/math-questions-batch1.json

# Cek progress
npm run question-stats
```

### **Day 11-12: Quality Review**
```bash
# Review semua soal
# Perbaiki jika ada error
# Final import
npm run import-questions questions/final-questions.json
```

## 📞 Support

**Jika ada pertanyaan:**
1. Cek `PANDUAN_PEMBUATAN_SOAL.md` untuk detail lengkap
2. Lihat contoh di `sample-questions.json`
3. Test dengan file kecil dulu sebelum import besar
4. Konsultasi jika ada keraguan tentang materi

**Tools yang membantu:**
- Excel/Google Sheets untuk editing
- VS Code untuk JSON editing
- Command line untuk import/convert

---

**Ready to create amazing questions! 🎓✨**