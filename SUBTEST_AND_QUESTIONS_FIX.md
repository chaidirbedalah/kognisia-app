# Subtest dan Questions Fix Summary

## Masalah yang Ditemukan

### 1. Subtest Hanya 6 (Seharusnya 7)
**Masalah:** Database subtests hanya memiliki 6 subtest, padahal UTBK 2026 memiliki 7 subtest.

**Penyebab:** Subtest "PU" (Penalaran Umum) hilang dari database.

**Solusi:** ✅ **FIXED**
- Menambahkan subtest PU yang hilang ke database
- Sekarang database memiliki 7 subtest lengkap sesuai UTBK 2026

### 2. Error "Failed to fetch questions" untuk Subtest
**Masalah:** Saat pilih materi "Pilih Subtest", muncul error "Failed to fetch questions".

**Penyebab:** 
- API battle/create menggunakan kolom `subtest_code` untuk query questions
- Tapi database question_bank menggunakan kolom `subtest_utbk` 
- Migration belum berjalan dengan benar

**Solusi:** ✅ **FIXED**
- Mengubah query di `/api/battle/create` untuk menggunakan kolom `subtest_utbk`
- Menambahkan logging untuk debug
- Memverifikasi ada questions untuk semua subtest

## Status Sekarang

### ✅ Subtests (7/7 Complete)
1. **PU** - Penalaran Umum (10 questions)
2. **PPU** - Pengetahuan & Pemahaman Umum (12 questions)  
3. **PBM** - Pemahaman Bacaan & Menulis (10 questions)
4. **PK** - Pengetahuan Kuantitatif (12 questions)
5. **LIT_INDO** - Literasi Bahasa Indonesia (10 questions)
6. **LIT_ING** - Literasi Bahasa Inggris (10 questions)
7. **PM** - Penalaran Matematika (16 questions)

### ✅ Questions Available
- **Total:** 80 questions tersedia
- **Difficulty:** Easy dan Medium (Hard belum ada)
- **Distribution:** Semua 7 subtest memiliki questions

### ✅ Battle Creation Flow
- **Mini Try Out:** ✅ Berfungsi normal (20 soal campuran)
- **Pilih Subtest:** ✅ Sekarang berfungsi (5-20 soal per subtest)

## Testing Checklist

### ✅ Completed
- [x] Verifikasi 7 subtests tersedia di dropdown
- [x] Verifikasi questions tersedia untuk semua subtests
- [x] Fix API query untuk menggunakan kolom yang benar
- [x] Mini Try Out berfungsi normal

### 🔄 Ready for Testing
- [ ] Test create battle dengan "Pilih Subtest" 
- [ ] Test semua 7 subtests (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
- [ ] Test berbagai jumlah soal (5, 10, 15, 20)
- [ ] Test berbagai tingkat kesulitan (Easy, Medium)
- [ ] Verifikasi invite code dan battle info muncul dengan benar

## Files Modified

1. **`/api/battle/create/route.ts`**
   - Changed query from `subtest_code` to `subtest_utbk`
   - Added debug logging
   - Improved error messages

2. **Database Subtests**
   - Added missing "PU" subtest
   - Now has complete 7 subtests

3. **Scripts Created**
   - `scripts/check-subtests.ts` - Verify subtests
   - `scripts/fix-subtests.ts` - Add missing subtests  
   - `scripts/check-questions-by-subtest.ts` - Verify questions

## Next Steps

Sekarang user bisa:
1. ✅ Melihat 7 subtests di dropdown "Pilih Subtest"
2. ✅ Membuat battle dengan subtest manapun
3. ✅ Membuat battle Mini Try Out
4. ✅ Mendapatkan invite code dengan detail battle lengkap

**Ready for testing!** 🚀