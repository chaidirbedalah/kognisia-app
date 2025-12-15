# Product Requirements Document (PRD) - Kognisia UTBK 2026  
## Enhanced Gamification & Engagement System

**Version:** 2.0  
**Date:** December 13, 2025  
**Status:** Ready for Development  
**Product Vision:** Mengubah persiapan UTBK yang solitair dan stres menjadi pengalaman belajar yang sosial, kompetitif, dan habit-forming melalui model **Strictly Earn-to-Play** — usaha akademik individu adalah satu-satunya cara untuk mengakses fitur sosial dan kompetitif.

### 1. Executive Summary
Kognisia adalah platform pembelajaran UTBK berbasis web (Next.js + Supabase) yang telah production-ready dengan sistem Squad Battle, Achievement, Streak, dan Analytics. Dokumen ini mendefinisikan **enhanced gamification system** yang mengintegrasikan:
- Ekonomi ganda: **XP** (permanen, prestige) dan **Tickets** (konsumsi, akses sosial)
- Loop engagement: Individual Study → Earn Tickets → Social/Competitive Play → Back to Study
- Fitur sosial: Cohort (kelompok belajar sementara) dan Squad (tim permanen) dengan Battle modes

**Tujuan Utama:**
- Meningkatkan DAU dan session duration >30 menit
- Menciptakan positive peer pressure melalui kompetisi dan kolaborasi
- Menjaga integritas akademik: tidak ada pembelian Tickets dengan uang

### 2. Target Users
- Siswa kelas 12 SMA/sederajat dan gap year yang mempersiapkan UTBK SNBT 2026
- Pengguna premium (paid) — semua fitur gamification tersedia tanpa tiering
- Digital native, terbiasa dengan Mobile Legends, Duolingo, Kahoot, dan app tryout lokal

### 3. Core Economy & Concepts
| Konsep       | Tipe          | Deskripsi                                                                 | Sumber Utama                  | Penggunaan                          |
|--------------|---------------|---------------------------------------------------------------------------|-------------------------------|-------------------------------------|
| **XP**       | Permanen      | Mengukur progress akademik & prestige                                     | Semua aktivitas belajar       | Leveling, Leaderboard, Badges       |
| **Tickets**  | Konsumsi      | Mata uang untuk akses fitur sosial/kompetitif                             | Daily Challenge & Cohort      | Join Cohort/Battle (sink)           |
| **Level**    | Prestige      | Berdasarkan total XP, dengan title tematik UTBK                           | XP milestone                  | Profil visibility                   |
| **Cohort**   | Sementara     | Kelompok belajar 2-8 orang, auto-bubar setelah sesi                       | Dibuat dengan invitation code | Belajar bareng, farm Tickets        |
| **Squad**    | Permanen      | Tim maks. 8 orang untuk kompetisi berkelanjutan                           | Dibuat oleh leader            | Battle antar Squad                  |
| **Battle**   | Kompetitif    | War Room (serius, HOTS) dan Battle Arena (casual)                         | Tickets                       | XP besar, Badges, Ranking           |

### 4. User Stories & Acceptance Criteria

#### Requirement 1: XP & Leveling System
**User Story:** Sebagai siswa, saya ingin setiap usaha belajar memberi XP sehingga progress terasa nyata.

**Acceptance Criteria:**
1. Setiap jawaban benar memberikan XP berdasarkan kesulitan soal (mudah: 10, sedang: 20, HOTS: 50)
2. Daily Challenge completion memberikan bonus XP (50-150)
3. Milestone XP menaikkan level dengan title (misal: Level 10 "Pejuang SNBT", Level 30 "Calon Maba PTN")
4. Profil menampilkan XP total, level, progress bar ke level berikutnya, dan title
5. Progression curve: tiered (awal cepat, kemudian plateau untuk retention)

#### Requirement 2: Daily Challenge & Ticket Economy
**User Story:** Sebagai siswa, saya ingin tantangan harian yang memberikan Tickets agar termotivasi login setiap hari.

**Acceptance Criteria:**
1. Sistem generate 3 Daily Challenge harian (volume, akurasi, fokus subtes)
2. Completion memberikan 2-4 Tickets + XP bonus
3. Max storage: 12 Tickets (soft cap — XP tetap diberikan jika penuh)
4. Tickets hanya diperoleh melalui usaha akademik (no login reward saja)
5. UI menampilkan Ticket counter dan XP bar secara jelas terpisah

#### Requirement 3: Cohort — Kelompok Belajar Sementara
**User Story:** Sebagai siswa, saya ingin belajar bareng teman secara sementara untuk motivasi dan farming Tickets.

**Acceptance Criteria:**
1. Siswa dapat create/join Cohort (2-8 orang) via invitation code/link
2. Entry cost: 1 Ticket per anggota
3. Sesi: paralel/soal sama, individual scoring, internal leaderboard
4. Completion (min 80% soal dijawab): +3 Tickets per anggota (net +2)
5. Cohort auto-bubar setelah sesi, statistik disimpan di profil
6. Grace period 2 menit untuk reconnect, anti-leech (min participation)

#### Requirement 4: Squad — Tim Permanen
**User Story:** Sebagai siswa, saya ingin membentuk Squad permanen dengan teman untuk kompetisi jangka panjang.

**Acceptance Criteria:**
1. Create Squad: nama unik, logo custom, max 8 member
2. Invitation via code/link, leader dapat kick member
3. Squad memiliki level sendiri (rata-rata XP member)
4. Profil menampilkan Squad affiliation dan role (leader/member)
5. Batasan opsional: hanya siswa sekolah sama (configurable)

#### Requirement 5: War Room — Battle Serius Antar Squad
**User Story:** Sebagai leader Squad, saya ingin mengadu kemampuan Squad dalam format HOTS yang serius.

**Acceptance Criteria:**
1. Leader create War Room: pilih 25/50 soal (30/60 menit), 70-90% HOTS
2. Entry cost: 3 Tickets per anggota aktif
3. Soal random individu (anti-sharing), server-authoritative
4. Scoring: rata-rata nilai Squad (tie-breaker: kecepatan)
5. Reward: XP besar, Badge khusus, Squad ranking points (no Ticket return — sink)
6. Real-time leaderboard selama battle

#### Requirement 6: Battle Arena — Pertandingan Casual
**User Story:** Sebagai siswa, saya ingin battle cepat tanpa komitmen Squad.

**Acceptance Criteria:**
1. Create/join Arena via code (2 Squad atau ad-hoc)
2. Entry cost: 2 Tickets per peserta
3. Pilihan materi: reguler atau HOTS
4. Reward: XP bonus + Badge (no Ticket return)
5. Arena auto-bubar setelah selesai

#### Requirement 7: Achievement Badges
**User Story:** Sebagai siswa, saya ingin badge spesifik sebagai target kecil motivasi.

**Acceptance Criteria:**
1. Kategori: Sniper (akurasi), Marathon (streak), Speed Demon (kecepatan), Sultan (volume)
2. Tier: Bronze → Diamond
3. Unlock otomatis, notifikasi real-time
4. Ditampilkan di profil dengan rarity visual

#### Requirement 8: Leaderboards
**User Story:** Sebagai siswa, saya ingin tahu posisi saya dibanding yang lain.

**Acceptance Criteria:**
1. Global (XP), Sekolah, Squad, dan Seasonal leaderboard
2. Update real-time via Supabase subscription
3. Tampilkan: rank, nama, level, XP, top badge, Squad

#### Requirement 9: Immediate Feedback & UX
**User Story:** Sebagai siswa, saya ingin feedback instan saat mendapat reward.

**Acceptance Criteria:**
1. XP gain: animasi + sound + haptic (<200ms)
2. Level up/Badge unlock: full-screen celebration
3. Ticket transaction: clear counter animation
4. Mobile-first: bottom navigation, touch-friendly

#### Requirement 10: Security & Anti-Cheat
**User Story:** Sebagai sistem, integritas harus terjaga.

**Acceptance Criteria:**
1. Semua XP/Ticket logic server-side
2. Deteksi rapid-fire answering → flag & review
3. Battle sync latency <500ms
4. Audit log untuk semua transaksi ekonomi
5. RLS Supabase untuk data privacy

### 5. Non-Functional Requirements
- **Performance:** Real-time features menggunakan Supabase Realtime
- **Scalability:** Database indexes, materialized views (sudah ada)
- **Mobile Optimization:** Responsive, bottom nav (sudah implemented)
- **Tech Stack:** Next.js 16, Supabase, Tailwind, Vercel (sesuai project saat ini)

### 6. Success Metrics
- Daily Challenge completion rate >60%
- Average Tickets burned per user per week >8
- Cohort/Battle sessions per user per week >3
- Day-7 & Day-30 retention improvement >20%
- Squad membership rate >50% active users

### 7. Out of Scope (Phase Berikutnya)
- Cosmetic shop (avatar, theme)
- AI recommendation engine
- Mobile native app
- Monetisasi Tickets

Dokumen ini mengintegrasikan status development saat ini (100% complete core & achievement) dengan enhanced gamification yang telah kita diskusikan, siap untuk diimplementasikan sebagai fase berikutnya.

**Status:** Approved for Development  
**Next Step:** Sprint planning & UI/UX design refinement.

"Dev Status and Roadmap.md"