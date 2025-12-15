# Requirements Document - Enhanced Gamification System

## Introduction

Enhanced gamification system untuk Kognisia UTBK 2026 yang mengintegrasikan ekonomi ganda (XP permanen + Tickets konsumsi) dengan fitur sosial dan kompetitif. Sistem ini mengimplementasikan model "Strictly Earn-to-Play" dimana usaha akademik individu adalah satu-satunya cara untuk mengakses fitur sosial dan kompetitif, menciptakan loop engagement yang sustainable.

## Glossary

- **XP (Experience Points)**: Poin pengalaman permanen yang mengukur progress akademik dan prestige, tidak pernah berkurang
- **Coins**: Mata uang konsumsi dengan hierarki Bronze → Silver → Gold (15:1 ratio), untuk mengakses fitur sosial dan kompetitif
- **Daily Challenge**: 3 tantangan harian (volume, akurasi, fokus subtes) yang masing-masing memberikan 1 Bronze Coin dan XP bonus
- **Cohort**: Kelompok belajar sementara 2-8 siswa yang auto-bubar setelah sesi, entry cost 5 Bronze Coins, reward 10 Bronze Coins (net +5)
- **Squad**: Tim permanen maksimal 8 siswa untuk kompetisi berkelanjutan dengan nama dan logo unik
- **War Room**: Arena pertandingan serius antar Squad dengan 70-90% soal HOTS, entry cost 1 Silver Coin
- **Battle Arena**: Arena pertandingan casual dengan pilihan materi reguler/HOTS, entry cost 10 Bronze Coins
- **Leader**: Siswa yang membuat dan mengelola Squad, dapat kick member
- **Achievement Badge**: Lencana pencapaian dengan 4 kategori (Sniper, Marathon, Speed Demon, Sultan) dan 5 tier (Bronze-Diamond)
- **Leaderboard**: Papan peringkat global, sekolah, Squad, dan seasonal dengan update real-time

## Requirements

### Requirement 1

**User Story:** Sebagai siswa UTBK, saya ingin mendapatkan reward XP dari setiap aktivitas belajar, sehingga progress saya terasa nyata dan termotivasi untuk terus belajar.

#### Acceptance Criteria

1. WHEN siswa menjawab soal benar THEN sistem SHALL memberikan XP berdasarkan kesulitan (mudah: 10 XP, sedang: 20 XP, HOTS: 50 XP)
2. WHEN siswa menyelesaikan Daily Challenge THEN sistem SHALL memberikan XP bonus 50-150 points
3. WHEN siswa mencapai milestone XP THEN sistem SHALL menaikkan level dengan title tematik UTBK (Level 10 "Pejuang SNBT", Level 30 "Calon Maba PTN")
4. WHEN siswa melihat profil THEN sistem SHALL menampilkan XP total, level saat ini, progress bar ke level berikutnya, dan title
5. THE sistem SHALL menggunakan tiered progression curve (awal cepat, kemudian plateau untuk retention)

### Requirement 2

**User Story:** Sebagai siswa, saya ingin sistem Daily Challenge yang memberikan 3 tantangan harian berbeda, sehingga saya bisa memilih mengikuti semua atau sebagian sesuai waktu yang tersedia.

#### Acceptance Criteria

1. WHEN sistem generate Daily Challenge THEN sistem SHALL membuat 3 tantangan terpisah: volume (10-20 soal), akurasi (>70% benar), dan fokus subtes tertentu
2. WHEN siswa menyelesaikan 1 Daily Challenge THEN sistem SHALL memberikan 1 Bronze Coin plus XP bonus
3. WHEN siswa menyelesaikan semua 3 challenges THEN sistem SHALL memberikan total 3 Bronze Coins dalam sehari
4. THE sistem SHALL menggunakan conversion rate: 15 Bronze Coins = 1 Silver Coin, 15 Silver Coins = 1 Gold Coin
5. WHEN siswa gagal menyelesaikan challenge dalam 24 jam THEN challenge SHALL reset tanpa reward

### Requirement 3

**User Story:** Sebagai siswa, saya ingin bisa membuat Cohort (kelompok belajar sementara) dengan teman-teman, sehingga kami bisa belajar bersama, saling memotivasi, dan farming Brown Coins.

#### Acceptance Criteria

1. WHEN siswa membuat Cohort THEN sistem SHALL memungkinkan invite 1-7 siswa lain via invitation code atau link
2. WHEN siswa join Cohort THEN sistem SHALL mengurangi 5 Bronze Coins dari wallet siswa sebagai entry cost
3. WHEN member Cohort menyelesaikan sesi (minimum 80% soal dijawab) THEN sistem SHALL memberikan 10 Bronze Coins kepada setiap member (net profit +5)
4. WHEN sesi Cohort selesai THEN sistem SHALL auto-bubar Cohort tapi menyimpan statistik individual di profil
5. WHEN siswa disconnect dari Cohort THEN sistem SHALL memberikan grace period 2 menit untuk reconnect dan anti-leech minimum participation

### Requirement 4

**User Story:** Sebagai siswa, saya ingin bisa membuat Squad permanen dengan circle pertemanan saya, sehingga kami bisa bertanding dengan Squad lain dalam kompetisi jangka panjang.

#### Acceptance Criteria

1. WHEN siswa membuat Squad THEN sistem SHALL memungkinkan invite maksimal 7 siswa lain (total 8 member) dengan nama unik dan logo custom
2. WHEN Squad terbentuk THEN sistem SHALL memberikan Squad level berdasarkan rata-rata XP member
3. WHEN Leader menghapus Squad THEN sistem SHALL menyimpan semua statistik member tapi menghapus grup
4. THE sistem SHALL memiliki batasan opsional hanya untuk siswa sekolah yang sama (configurable)
5. WHEN siswa bergabung dengan Squad THEN sistem SHALL menampilkan Squad affiliation dan role (leader/member) di profil

### Requirement 5

**User Story:** Sebagai Leader Squad, saya ingin bisa membuat War Room untuk bertanding dengan Squad lain, sehingga kami bisa mengadu kemampuan dalam format HOTS yang serius.

#### Acceptance Criteria

1. WHEN Leader membuat War Room THEN sistem SHALL menyediakan 2 pilihan: 25 soal (30 menit) atau 50 soal (60 menit) dengan 70-90% soal HOTS
2. WHEN pertandingan dimulai THEN sistem SHALL memberikan soal random individu (anti-sharing) dengan server-authoritative logic
3. WHEN pertandingan berlangsung THEN sistem SHALL menampilkan real-time leaderboard selama battle
4. WHEN pertandingan selesai THEN sistem SHALL menentukan pemenang berdasarkan rata-rata nilai Squad (tie-breaker: kecepatan)
5. WHEN siswa join War Room THEN sistem SHALL mengurangi 1 Silver Coin per anggota aktif sebagai entry cost (no coin return - sink)

### Requirement 6

**User Story:** Sebagai siswa, saya ingin bisa membuat Battle Arena untuk pertandingan casual, sehingga saya bisa battle cepat tanpa komitmen Squad permanen.

#### Acceptance Criteria

1. WHEN siswa membuat Battle Arena THEN sistem SHALL memungkinkan create/join Arena via invitation code untuk 2 Squad atau ad-hoc participants
2. WHEN Battle Arena dibuat THEN creator SHALL bisa memilih materi (reguler atau HOTS) dan jadwal pertandingan
3. WHEN siswa join Battle Arena THEN sistem SHALL mengurangi 10 Bronze Coins per peserta sebagai entry cost
4. WHEN pertandingan selesai THEN sistem SHALL memberikan XP bonus dan Badge tapi tidak Coins (no coin return - sink)
5. WHEN Battle Arena selesai THEN sistem SHALL auto-bubar arena tapi menyimpan hasil pertandingan di profil

### Requirement 7

**User Story:** Sebagai siswa, saya ingin sistem Achievement Badge yang mengakui pencapaian spesifik saya, sehingga saya memiliki target-target kecil yang memotivasi.

#### Acceptance Criteria

1. WHEN siswa mencapai milestone akurasi THEN sistem SHALL memberikan badge "Sniper" dengan tier Bronze hingga Diamond
2. WHEN siswa mencapai streak harian THEN sistem SHALL memberikan badge "Marathon" dengan tier sesuai durasi streak
3. WHEN siswa mencapai kecepatan jawab tertentu THEN sistem SHALL memberikan badge "Speed Demon" dengan tier progression
4. WHEN siswa mencapai volume soal tertentu THEN sistem SHALL memberikan badge "Sultan" berdasarkan total soal dijawab
5. WHEN badge unlock THEN sistem SHALL memberikan notifikasi real-time dan menampilkan badge di profil dengan rarity visual

### Requirement 8

**User Story:** Sebagai siswa, saya ingin melihat Leaderboard yang menunjukkan posisi saya dibanding siswa lain, sehingga saya tahu ranking dan termotivasi untuk naik peringkat.

#### Acceptance Criteria

1. WHEN siswa mengakses Leaderboard THEN sistem SHALL menampilkan ranking Global (XP), Sekolah, Squad, dan Seasonal leaderboard
2. WHEN ada perubahan XP THEN sistem SHALL update Leaderboard secara real-time via Supabase subscription
3. WHEN siswa melihat Leaderboard THEN sistem SHALL menampilkan rank, nama, level, XP, top badge, dan Squad affiliation
4. THE sistem SHALL menyediakan filter dan search functionality untuk navigasi leaderboard
5. WHEN siswa melihat Squad Leaderboard THEN sistem SHALL menampilkan ranking Squad berdasarkan rata-rata XP member dan Squad level

### Requirement 9

**User Story:** Sebagai siswa, saya ingin feedback visual dan audio yang immediate ketika mendapat reward, sehingga saya merasakan gratifikasi psikologis yang memotivasi.

#### Acceptance Criteria

1. WHEN siswa mendapat XP THEN sistem SHALL menampilkan animasi XP gain + sound + haptic feedback dalam <200ms
2. WHEN siswa naik level atau unlock badge THEN sistem SHALL menampilkan full-screen celebration animation
3. WHEN transaksi Coins terjadi THEN sistem SHALL menampilkan visual coin animation (Bronze/Silver/Gold) dengan counter update
4. THE sistem SHALL membedakan visual XP (progress bar) dan Coins (visual coin counter dengan hierarki warna) secara jelas di UI
5. THE sistem SHALL menggunakan mobile-first design dengan bottom navigation dan touch-friendly interface

### Requirement 10

**User Story:** Sebagai siswa, saya ingin sistem konversi Coins yang jelas dan otomatis, sehingga saya bisa mengelola mata uang dengan mudah untuk berbagai aktivitas.

#### Acceptance Criteria

1. WHEN siswa mengumpulkan 15 Bronze Coins THEN sistem SHALL otomatis convert menjadi 1 Silver Coin
2. WHEN siswa mengumpulkan 15 Silver Coins THEN sistem SHALL otomatis convert menjadi 1 Gold Coin  
3. WHEN siswa melihat wallet THEN sistem SHALL menampilkan jumlah masing-masing coin type dengan visual yang jelas
4. THE sistem SHALL menyediakan manual conversion option jika siswa ingin convert sebelum mencapai 15
5. WHEN conversion terjadi THEN sistem SHALL menampilkan animation dan notification untuk feedback

### Requirement 11

**User Story:** Sebagai sistem, saya ingin memiliki anti-cheat dan security measures yang kuat, sehingga integritas ekonomi Coins dan fairness kompetisi terjaga.

#### Acceptance Criteria

1. WHEN sistem mendeteksi rapid-fire answering pattern THEN sistem SHALL flag akun untuk review dan temporary restriction
2. THE sistem SHALL menggunakan server-side authoritative logic untuk semua XP/Coins calculations, conversions, dan transactions
3. WHEN battle real-time berlangsung THEN sistem SHALL mensinkronisasi soal dengan latency <500ms untuk fairness
4. THE sistem SHALL menggunakan Supabase RLS untuk data privacy dan audit log untuk semua transaksi ekonomi Coins
5. WHEN anomali terdeteksi THEN sistem SHALL log aktivitas dengan timestamp dan user context untuk investigation