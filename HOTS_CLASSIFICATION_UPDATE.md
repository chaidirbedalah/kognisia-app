# 🧠 HOTS Classification System - Updated!

## ✅ Perubahan Sistem Klasifikasi Soal

Berdasarkan feedback Anda, sistem klasifikasi soal telah diupdate dari **Easy/Medium/Hard** menjadi **Regular vs HOTS**.

## 🎯 Konsep Baru: Regular vs HOTS

### **Regular (Non-HOTS) - 70% dari soal**
- **Fokus:** Pemahaman konsep dan aplikasi langsung
- **Karakteristik:**
  - Mengukur pengetahuan dan pemahaman
  - Perhitungan dan penerapan rumus
  - Recall informasi dan prosedur
  - Aplikasi konsep dalam konteks familiar

### **HOTS (Higher Order Thinking Skills) - 30% dari soal**
- **Fokus:** Kemampuan berpikir tingkat tinggi
- **Karakteristik:**
  - **Analisis:** Memecah informasi menjadi bagian-bagian
  - **Evaluasi:** Menilai dan membuat keputusan berdasarkan kriteria
  - **Kreasi:** Menggabungkan elemen untuk membuat sesuatu yang baru
  - **Problem Solving:** Menyelesaikan masalah non-rutin

## 🔄 Perubahan yang Dilakukan

### **1. Database Schema**
- **Primary Field:** `is_hots` (boolean) - true/false
- **Backward Compatibility:** `difficulty` field tetap ada untuk kompatibilitas

### **2. Template Files Updated**
- **CSV Template:** `questions/templates/template.csv`
- **JSON Template:** `questions/templates/sample-questions.json`
- **Format baru:** `is_hots` menggantikan `difficulty` sebagai field utama

### **3. Import/Export Scripts**
- **Validation:** Menggunakan `is_hots` sebagai primary classification
- **Statistics:** Menampilkan Regular vs HOTS count
- **Backward Compatibility:** Masih support `difficulty` untuk data lama

### **4. Documentation Updated**
- **Panduan Pembuatan Soal:** Konsep HOTS dijelaskan detail
- **README:** Template dan workflow diupdate
- **Examples:** Contoh soal Regular vs HOTS

## 📊 Current Database Status

### **✅ Soal Tersedia:**
- **Total:** 90 soal
- **Regular (Non-HOTS):** 86 soal (95.6%)
- **HOTS:** 4 soal (4.4%)

### **🎯 Target Distribusi Ideal:**
- **Regular:** 35 soal per subtest (70%)
- **HOTS:** 15 soal per subtest (30%)
- **Total per subtest:** 50 soal minimum

## 📝 Format Template Baru

### **CSV Format:**
```csv
question_text,option_a,option_b,option_c,option_d,option_e,correct_answer,subtest_utbk,is_hots,hint_text,solution_steps
"Soal regular...","A","B","C","D","E","B","PM","false","Hint...","Steps..."
"Soal HOTS...","A","B","C","D","E","A","PU","true","Hint...","Steps..."
```

### **JSON Format:**
```json
{
  "question_text": "Soal...",
  "option_a": "A", "option_b": "B", "option_c": "C", "option_d": "D", "option_e": "E",
  "correct_answer": "B",
  "subtest_utbk": "PM",
  "is_hots": false,
  "hint_text": "Hint...",
  "solution_steps": "Steps..."
}
```

## 🎯 Contoh Soal Regular vs HOTS

### **Regular (Non-HOTS) Example:**
```json
{
  "question_text": "Dalam suatu barisan aritmatika, suku ke-3 adalah 12 dan suku ke-7 adalah 24. Berapa suku ke-10?",
  "correct_answer": "B",
  "subtest_utbk": "PM",
  "is_hots": false,
  "hint_text": "Gunakan rumus suku ke-n barisan aritmatika"
}
```

### **HOTS Example:**
```json
{
  "question_text": "Jika semua A adalah B, dan semua B adalah C, maka dapat disimpulkan bahwa:",
  "correct_answer": "B", 
  "subtest_utbk": "PU",
  "is_hots": true,
  "hint_text": "Gunakan aturan silogisme dan analisis logika"
}
```

## 🚀 Keuntungan Sistem Baru

### **1. Lebih Realistis**
- Sesuai dengan standar UTBK yang sebenarnya
- Fokus pada kemampuan berpikir, bukan hanya kesulitan

### **2. Clearer Learning Path**
- Siswa bisa fokus menguasai konsep dasar dulu (Regular)
- Kemudian challenge diri dengan soal HOTS

### **3. Better Assessment**
- Regular: Mengukur pemahaman konsep
- HOTS: Mengukur kemampuan analisis dan problem solving

### **4. Simplified System**
- Hanya 2 kategori: Regular vs HOTS
- Tidak perlu kompleksitas 3 level difficulty

## 🛠️ Tools Updated

### **Commands Tetap Sama:**
```bash
npm run question-stats          # Cek progress (sekarang show Regular vs HOTS)
npm run convert-csv file.csv    # Convert CSV ke JSON
npm run import-questions file.json  # Import ke database
```

### **Validation Updated:**
- ✅ Validates `is_hots` field (true/false)
- ✅ Backward compatible dengan `difficulty` field
- ✅ Statistics menampilkan Regular vs HOTS breakdown

## 📋 Checklist untuk Asisten

### **Content Quality:**
- [ ] Soal Regular: Fokus pemahaman konsep dan aplikasi langsung
- [ ] Soal HOTS: Butuh analisis, evaluasi, atau problem solving
- [ ] Classification benar: `is_hots: true/false`
- [ ] Hint dan solution sesuai dengan level kognitif

### **Technical Format:**
- [ ] Field `is_hots` terisi dengan benar (true/false)
- [ ] Semua field wajib lainnya terisi
- [ ] Format CSV/JSON valid

## 🎉 Ready for Production!

Sistem baru sudah:
- ✅ **Tested & Working** - Import/export berfungsi sempurna
- ✅ **Backward Compatible** - Data lama tetap bisa digunakan  
- ✅ **Documentation Complete** - Panduan lengkap untuk asisten
- ✅ **Tools Updated** - Semua script sudah diupdate

**Asisten sekarang bisa fokus membuat soal dengan klasifikasi yang lebih meaningful: Regular untuk pemahaman konsep, HOTS untuk kemampuan berpikir tingkat tinggi! 🧠✨**

---

**System updated ✅ | HOTS classification ready ✅ | Better learning experience ✅**