# Enhanced Student Dashboard - Requirements

## Introduction

Redesign Student Dashboard menjadi comprehensive analytics center yang memberikan insight mendalam tentang progress belajar siswa across all assessment types (Daily Challenge, Squad Battle, Try Out, Marathon Mode).

**Reference:** Fitur ini adalah implementasi dari PRD v3.2 Section 5 (Student Portal Features) dan Section 9 (Database Schema).

**PRD Location:** `/kognisia-prd-v3.2.md`


## Glossary

- **Daily Challenge**: Latihan harian 10 soal untuk maintain streak
- **Squad Battle**: Kompetisi real-time dengan teman (2-8 members)
- **Try Out**: Simulasi ujian 49 soal (7 subtest × 7 soal)
- **Marathon Mode**: Simulasi UTBK lengkap 70 soal (7 subtest × 10 soal)
- **Subtest**: Kategori soal UTBK (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
- **3-Layer System**: Soal → Petunjuk → Solusi (dengan scoring berbeda)
- **Streak**: Jumlah hari berturut-turut mengerjakan Daily Challenge

## Requirements

### Requirement 1: Overview Statistics Cards

**User Story:** Sebagai siswa, saya ingin melihat ringkasan statistik utama di dashboard, sehingga saya bisa cepat memahami progress saya secara keseluruhan.

#### Acceptance Criteria

1. WHEN siswa membuka dashboard THEN sistem SHALL menampilkan 6 kartu statistik utama
2. WHEN data streak tersedia THEN sistem SHALL menampilkan current streak dan longest streak
3. WHEN data assessment tersedia THEN sistem SHALL menampilkan total count untuk Daily Challenge, Squad Battle, Try Out, dan Marathon
4. WHEN siswa belum pernah mengerjakan assessment THEN sistem SHALL menampilkan nilai 0 dengan pesan motivasi
5. WHEN data loading THEN sistem SHALL menampilkan skeleton loader

### Requirement 2: Daily Challenge Analytics

**User Story:** Sebagai siswa, saya ingin melihat detail performa Daily Challenge saya, sehingga saya bisa track konsistensi dan improvement harian.

#### Acceptance Criteria

1. WHEN siswa membuka tab Daily Challenge THEN sistem SHALL menampilkan total soal dikerjakan dan akurasi keseluruhan
2. WHEN data 3-layer tersedia THEN sistem SHALL menampilkan breakdown persentase: jawab langsung, lihat petunjuk, lihat solusi
3. WHEN siswa memiliki riwayat Daily Challenge THEN sistem SHALL menampilkan list tanggal dengan skor per hari
4. WHEN siswa klik detail hari tertentu THEN sistem SHALL menampilkan soal-soal yang dikerjakan hari itu
5. WHEN data mencukupi THEN sistem SHALL menampilkan trend chart accuracy over time

### Requirement 3: Marathon Mode Analytics

**User Story:** Sebagai siswa, saya ingin melihat detail performa Marathon Mode saya, sehingga saya bisa evaluasi kesiapan UTBK.

#### Acceptance Criteria

1. WHEN siswa membuka tab Marathon THEN sistem SHALL menampilkan total Marathon yang sudah diikuti
2. WHEN data Marathon tersedia THEN sistem SHALL menampilkan list tanggal Marathon dengan total skor
3. WHEN siswa klik detail Marathon THEN sistem SHALL menampilkan breakdown skor per subtest
4. WHEN data 3-layer tersedia THEN sistem SHALL menampilkan persentase jawab langsung vs hint vs solution
5. WHEN siswa memiliki multiple Marathon THEN sistem SHALL menampilkan comparison chart antar Marathon

### Requirement 4: Squad Battle Analytics

**User Story:** Sebagai siswa, saya ingin melihat riwayat Squad Battle saya, sehingga saya bisa track performa kompetitif dengan teman.

#### Acceptance Criteria

1. WHEN siswa membuka tab Squad Battle THEN sistem SHALL menampilkan total battle yang diikuti
2. WHEN data Squad tersedia THEN sistem SHALL menampilkan list tanggal battle dengan rank dan skor
3. WHEN siswa klik detail battle THEN sistem SHALL menampilkan daftar participants dengan ranking
4. WHEN data 3-layer tersedia THEN sistem SHALL menampilkan breakdown jawab langsung vs hint vs solution
5. WHEN siswa memiliki squad aktif THEN sistem SHALL menampilkan squad stats (avg rank, win rate)

### Requirement 5: Try Out Analytics

**User Story:** Sebagai siswa, saya ingin melihat riwayat Try Out saya, sehingga saya bisa track improvement dari simulasi ujian berkala.

#### Acceptance Criteria

1. WHEN siswa membuka tab Try Out THEN sistem SHALL menampilkan total Try Out yang diikuti
2. WHEN data Try Out tersedia THEN sistem SHALL menampilkan list tanggal dengan skor total
3. WHEN siswa klik detail Try Out THEN sistem SHALL menampilkan breakdown per subtest (7 subtest)
4. WHEN data 3-layer tersedia THEN sistem SHALL menampilkan persentase jawab langsung vs hint vs solution
5. WHEN siswa memiliki multiple Try Out THEN sistem SHALL menampilkan trend improvement chart

### Requirement 6: Progress per Subtest & Topik

**User Story:** Sebagai siswa, saya ingin melihat progress saya per subtest dan topik, sehingga saya tahu area mana yang perlu diperbaiki.

#### Acceptance Criteria

1. WHEN siswa membuka tab Progress THEN sistem SHALL menampilkan 7 subtest UTBK dengan akurasi masing-masing
2. WHEN data topik tersedia THEN sistem SHALL menampilkan breakdown topik per subtest
3. WHEN akurasi topik <50% THEN sistem SHALL highlight sebagai "Lemah" dengan warna merah
4. WHEN akurasi topik 50-70% THEN sistem SHALL highlight sebagai "Cukup" dengan warna kuning
5. WHEN akurasi topik >70% THEN sistem SHALL highlight sebagai "Kuat" dengan warna hijau
6. WHEN siswa klik topik lemah THEN sistem SHALL menampilkan tombol "Perbaiki Sekarang" untuk remedial

### Requirement 7: Additional Metrics & Insights

**User Story:** Sebagai siswa, saya ingin melihat metrik tambahan yang memberikan insight mendalam, sehingga saya bisa optimize strategi belajar.

#### Acceptance Criteria

1. WHEN data mencukupi THEN sistem SHALL menampilkan "Strongest Subtest" dan "Weakest Subtest"
2. WHEN data time tracking tersedia THEN sistem SHALL menampilkan average time per question
3. WHEN siswa memiliki data mingguan THEN sistem SHALL menampilkan comparison "This Week vs Last Week"
4. WHEN siswa memiliki longest streak >1 THEN sistem SHALL menampilkan "Longest Streak Record" sebagai achievement
5. WHEN data trend tersedia THEN sistem SHALL menampilkan overall accuracy trend chart (line chart)

### Requirement 8: Responsive & Performance

**User Story:** Sebagai siswa yang mengakses dari mobile, saya ingin dashboard tetap cepat dan responsive, sehingga saya bisa cek progress kapan saja.

#### Acceptance Criteria

1. WHEN dashboard loading THEN sistem SHALL menampilkan skeleton loader dalam <500ms
2. WHEN data fetch selesai THEN sistem SHALL render dashboard dalam <2 detik
3. WHEN diakses dari mobile THEN sistem SHALL menampilkan layout responsive (cards stack vertical)
4. WHEN tab di-switch THEN sistem SHALL transition smooth tanpa lag
5. WHEN data besar (>100 records) THEN sistem SHALL implement pagination atau lazy loading
