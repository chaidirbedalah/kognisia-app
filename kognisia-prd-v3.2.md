# KOGNISIA v3.2

# Product Requirements Document v.3.2
- Proof of Value Partnership

## **Comprehensive PRD: Platform Pembelajaran AI-Personalized**

*Gabungan Comprehensive dari PRD v3.0 (Core Platform) + v3.1 (Feature Additions)*

---

## **DOCUMENT CONTROL**

| **Field** | **Detail** |
| --- | --- |
| **Document Title** | Kognisia App PRD v3.2: Platform Pembelajaran AI-Personalized |
| **Target Release** | MVP Pilot - Proof of Value Phase (105 Hari) |
| **Document Owner** | Coach Chaidir Bedalah |
| **Related Teams** | Engineering, Design, Content, QA, Sales, Legal |
| **Last Updated** | Desember 2025 |
| **Version** | **3.2 (Comprehensive - Production-Ready)** |
| **Status** | **FINAL - Ready for Development** |
| **Change Log** | v1.0: Pay-by-Result. v2.1: Pivot Arsitektur Hybrid. v2.2: HOTS Scaffolding, Dual-Mode, Marathon Mode. v3.0: Complete Technical Specification. **v3.2: Merged with v3.1 (Squad Battle + Scheduled Assessments)** |

### **Document Stakeholders**

| **Role** | **Responsibility** |
| --- | --- |
| Product Owner (Coach Chaidir Bedalah) | Final approval, priority decisions |
| Tech Lead | Architecture decisions, code review |
| Engineering Lead | Sprint planning, technical delivery |
| Design Lead | UI/UX specifications |
| QA Lead | Testing strategy, quality gates |
| Content Lead | Question bank, video content |
| Sales Lead | PoV partnerships, school relationships |

### **Document Conventions**

- **MUST:** Mandatory requirement, blocks release if not implemented
- **SHOULD:** High priority, expected in MVP unless technical constraint
- **MAY:** Nice-to-have, can be deferred to post-MVP
- **RFC:** Request for Comment - needs team discussion

---

## **1. EXECUTIVE SUMMARY**

### **1.1 Product Vision**

Kognisia adalah sistem pembelajaran adaptif B2B (SaaS) berbahasa Indonesia yang menargetkan sekolah dan bimbingan belajar. Platform ini menggabungkan:

- **“Guru Privat Digital”** (Latihan harian dengan scaffolding dan feedback personal)
- **“Pengawas Ujian Digital”** (Simulasi UTBK Marathon terpandu)
- **“Komunitas Belajar”** (Squad Battle untuk pembelajaran sosial)
- **“Sistem Penjadwalan Terintegrasi”** (Scheduled Assessments otomatis)

Dalam satu ekosistem pembelajaran yang komprehensif, terintegrasi, dan mendukung kolaborasi guru-siswa-orang tua.

### **1.2 Mission Statement**

> “Memberdayakan setiap siswa Indonesia untuk mencapai potensi akademik terbaiknya melalui pembelajaran adaptif yang personal, dengan guru dan orang tua sebagai mitra aktif dalam perjalanan belajar, didukung oleh pembelajaran berkelanjutan bersama komunitas.”
> 

### **1.3 Target Outcome**

Menciptakan ekosistem belajar yang:
- **High-Touch** (melibatkan guru & orang tua secara aktif)
- **High-Tech** (Adaptif, HOTS-ready, dan Data-Driven)
- **High-Social** (Pembelajaran kolaboratif melalui Squad Battle)
- **High-Structure** (Penjadwalan terstruktur untuk kontrol administrator)

Mengatasi kelemahan kompetitor yang seringkali membuat siswa merasa berjuang sendirian dan tidak terstruktur.

### **1.4 Key Differentiators**

| **Differentiator** | **Deskripsi** | **Competitor Gap** |
| --- | --- | --- |
| **Dual-Mode Feedback** | Mode Latihan (membimbing) vs Mode Ujian (menguji) | Kompetitor hanya punya 1 mode |
| **HOTS Scaffolding** | Logic X-Ray + Distractor Analysis | Kompetitor hanya beri kunci jawaban |
| **Actionable Remedial** | “Perbaiki Sekarang” 1-klik | Kompetitor hanya tampilkan data |
| **Teacher-First Workflow** | Voice Note + Class Heatmap | Kompetitor B2C-focused |
| **Squad Battle** | Pembelajaran sosial terstruktur | Kompetitor tidak ada fitur kolaboratif |
| **Scheduled Assessments** | Auto-publish & auto-close | Kompetitor tidak otomatis |
| **Transparency Dashboard** | Real-time PoV metrics | Kompetitor tidak ada accountability |

### **1.5 Business Model: Proof of Value Partnership**

**CUSTOMER JOURNEY (4 FASE)**

| **Fase** | **Tahapan** | **Durasi** | **Harga / Pricing** |
| --- | --- | --- | --- |
| **FASE 1** | PoV Trial | 30 hari | **FREE** |
| **FASE 2** | Extended Pilot | 90 hari | **Rp 15k/siswa/bln** (50% disc) |
| **FASE 3** | Annual Contract | Tahunan | **Rp 25k/siswa/bln** |
| **FASE 4** | Expansion | Multi-yr | **Volume Pricing** |

### **1.6 Success Criteria for MVP (105 Days)**

### **Original Criteria (v3.0)**

- PoV → Pilot conversion ≥60%
- Student activation ≥70% (complete ≥1 Daily Challenge)
- Teacher adoption 100% login, 60% voice notes
- Academic improvement ≥10% pre→post
- NPS (Teachers) ≥50

### **New Criteria (v3.1 Additions)**

- Squad adoption ≥40% (40% siswa aktif join squad)
- Squad retention ≥60% (participate in ≥2 battles/week)
- Scheduled assessment usage ≥80% (sekolah schedule ≥1 assessment/week)
- Assessment attendance ≥85% (scheduled vs actual participants)

---

## **2. PROBLEM & OPPORTUNITY ANALYSIS**

### **2.1 Market Context**

**Total Addressable Market (TAM):**
- 150.000+ SMA/SMK di Indonesia
- 5 juta+ siswa kelas 10-12 IPA/IPS/Bahasa
- Rp 50 Triliun+ annual spending untuk pendidikan tambahan

**Serviceable Addressable Market (SAM):**
- 10.000 sekolah dengan budget IT
- 2 juta siswa di sekolah “tech-ready”
- Rp 500 Miliar annual potential

**Serviceable Obtainable Market (SOM) - Year 1:**
- 50 sekolah target
- 25.000 siswa
- Rp 7.5 Miliar ARR target

### **2.2 Problem Statement**

| **Stakeholder** | **Primary Pain Points** | **Secondary Pain Points** |
| --- | --- | --- |
| **Sekolah/Guru** | Alat B2B rumit, tidak actionable | Beban kerja bertambah, tidak ada insight prioritas |
| **Siswa** | Belajar sendiri tanpa feedback | Platform berat, tidak tahu progres nyata, isolasi sosial |
| **Orang Tua** | ROI tidak terukur | Tidak bisa mendukung secara konkret |
| **Kepala Sekolah** | Risiko budget tanpa hasil, penjadwalan manual | Data tidak transparan, sistem penjadwalan ineffisien |

### **2.3 Competitive Landscape**

| **Competitor** | **Strengths** | **Weaknesses** | **Our Advantage** |
| --- | --- | --- | --- |
| Ruangguru | Brand awareness, content volume | B2C focus, expensive | B2B pricing, teacher tools, social learning |
| Zenius | Quality content, affordable | Limited interactivity | Adaptive learning, HOTS, Squad Battle |
| Quipper | School partnerships | Dated UX, limited analytics | Modern stack, real-time data, scheduling |
| Pahamify | Gamification | Limited teacher features | Teacher Command Center, Squad system |

### **2.4 Solution Overview**

```markdown
┌───────────────────────────────────────────────────────────────┐
│                   KOGNISIA PLATFORM (3 PILAR)                 │
├─────────────────┬──────────────────┬──────────────────────────┤
│   PILAR 1:      │   PILAR 2:       │   PILAR 3:               │
│   ADAPTIVE      │   COLLABORATIVE  │   ADMINISTRATIVE         │
│   LEARNING      │   LEARNING       │   & SCHEDULING           │
├─────────────────┼──────────────────┼──────────────────────────┤
│ SISWA PORTAL    │ SISWA PORTAL     │ ADMIN PORTAL             │
│                 │                  │                          │
│ • Daily         │ • Squad          │ • Assessment             │
│   Challenge     │   Creation       │   Calendar               │
│ • Marathon      │ • Battle         │ • Schedule               │
│   Mode          │   Sessions       │   Creation               │
│ • PTN           │ • Squad Chat     │ • Auto-Publish           │
│   Simulator     │ • Leaderboard    │ • Reminders              │
│ • HOTS          │                  │ • Recurring              │
│   Scaffolding   │ TEACHER PORTAL   │   Pattern                │
│ • Remedial      │                  │ • Reports &              │
│                 │ • Squad Monitor  │   Analytics              │
│ TEACHER PORTAL  │ • Battle Results │                          │
│                 │ • Squad Stats    │ PARENT PORTAL            │
│ • Class         │                  │                          │
│   Heatmap       │                  │ • Progress               │
│ • Student       │                  │   Tracking               │
│   Drill-down    │                  │ • Squad                  │
│ • Voice Notes   │                  │   Visibility             │
│ • Report Export │                  │ • Calendar               │
│                 │                  │   View                   │
│ PARENT PORTAL   │                  │                          │
│                 │                  │                          │
│ • WA-Lite Cards │                  │                          │
│ • Progress      │                  │                          │
│   Reports       │                  │                          │
│ • One-Tap Doa   │                  │                          │
└─────────────────┴──────────────────┴──────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │   AI ENGINE        │
                    │ • Adaptive Path    │
                    │ • Scoring IRT      │
                    │ • Transcription    │
                    │ • Scheduling Logic │
                    │ • Moderation       │
                    └────────────────────┘
```

---

## **3. TARGET PERSONAS**

### **Persona 1: Kepala Sekolah (Bapak Hidayat)**

| **Attribute** | **Detail** |
| --- | --- |
| **Role** | Pembeli/Pengambil Keputusan |
| **Goals** | Bukti outcome, efisiensi guru, model pricing aman, sistem penjadwalan terpercaya |
| **Pain Points** | Budget hilang tanpa hasil, adopsi teknologi gagal, guru overload, penjadwalan manual rumit |
| **Decision Criteria** | ROI terukur, tidak tambah beban guru, trial tanpa risiko, transparansi sistem |
| **Quote** | *“Tunjukkan grafik hasil + efisiensi sistem + otomasi penjadwalan.”* |

### **Persona 2: Guru (Ibu Diah)**

| **Attribute** | **Detail** |
| --- | --- |
| **Role** | Pengguna Utama/Champion |
| **Goals** | Hemat waktu, data actionable, feedback personal tanpa mengetik, monitoring squad |
| **Pain Points** | Terlalu banyak alat, input manual, monitoring 100+ siswa, penjadwalan manual |
| **Success Metric** | Waktu administrasi berkurang 50%, intervensi tepat sasaran, squad monitoring |
| **Quote** | *“Sistem yang actionable, voice note support, dan bisa monitor squad!”* |

### **Persona 3: Siswa (Bagus Pratama - Enhanced v2.0)**

| **Attribute** | **Detail** |
| --- | --- |
| **Role** | End User |
| **Goals** | Latihan sesuai kemampuan, kejelasan progres, motivasi peer, persiapan ujian |
| **Pain Points** | Burnout materi, isolasi belajar, platform berat, tidak tahu progres |
| **Success Metric** | Streak consistency, improvement score, squad participation, PTN probability |
| **Quote** | *“Platform ringan, progres jelas, belajar dengan teman, dan siap PTN!”* |

### **Persona 4: Orang Tua (Ibu Wati)**

| **Attribute** | **Detail** |
| --- | --- |
| **Role** | Supervisor/Pembayar |
| **Goals** | Transparansi progres, bukti ROI, cara mendukung anak, visibilitas squad |
| **Pain Points** | Laporan rumit, merasa jauh dari proses, penjadwalan tidak terlihat |
| **Success Metric** | Update mingguan, bisa dukung tanpa mengganggu, transparency |
| **Quote** | *“Update progres berkala + bisa lihat squad anak + kalender ujian!”* |

---

## **4. PLATFORM STRATEGY**

### **4.1 Platform Decision: Progressive Web App (PWA)**

**Decision:** MVP dibangun sebagai **Progressive Web App (PWA)** dengan responsive design.

**PWA Features:**
- **Installable** via manifest.json
- **Offline** via Service Worker cache
- **Push** notifications (Web Push API)
- **Responsive** mobile-first design

**Native App Trigger (Post-MVP):**
- User request >30% untuk native app
- iOS push notification adoption <50%
- Proctoring features needed

### **4.2 Device & Browser Support**

| **Device** | **Priority** | **Minimum** |
| --- | --- | --- |
| Android Phone | P0 | Android 8.0+, Chrome 80+ |
| iOS Phone | P0 | iOS 14+, Safari 14+ |
| Desktop Chrome | P1 | Chrome 90+ |

**Network Support:**
- **Optimal:** 4G/WiFi (1+ Mbps)
- **Minimum:** 3G (256 Kbps) - core features MUST work
- **Degraded:** 2G (56 Kbps) - read-only mode, queue submissions

---

## **5. FEATURE SPECIFICATIONS - PILAR 1: ADAPTIVE LEARNING**

### **P1.1 Adaptive Workflow (3-Layer Content System)**

**Priority:** MUST

Setiap soal memiliki 3 lapisan bantuan dengan scoring berbeda:

```markdown
┌────────────────────────────────────────────────────────┐
│           3-LAYER CONTENT SYSTEM                       │
├────────────────────────────────────────────────────────┤
│ LAYER 1: SOAL (Public)                                 │
│ ├── Content: Pertanyaan + context                      │
│ ├── Options: A/B/C/D/E                                 │
│ └── Score: 10 (max) atau 12 (+ fast bonus)             │
│                    ↓                                   │
│ LAYER 2: PETUNJUK (Clue) ──────── Score: 7 (max)       │
│ ├── Regular: hint_text                                 │
│ ├── HOTS: logic_clues (Socratic)                       │
│ └── Access: Tombol "Lihat Petunjuk"                    │
│                    ↓                                   │
│ LAYER 3: SOLUSI (Solution) ────── Score: 4 (max)       │
│ ├── solution_steps                                     │
│ ├── Distractor Analysis                                │
│ └── Access: Tombol "Lihat Jawaban"                     │
└────────────────────────────────────────────────────────┘
```

**Business Rules:**
1. Layer 2/3 TIDAK pre-loaded ke frontend
2. Setiap akses Layer 2/3 tercatat dengan timestamp
3. User tidak bisa “undo” - scoring final

### **P1.2 Differential Scoring**

**Priority:** MUST

| **Scenario** | **Base** | **Bonus** | **Final** |
| --- | --- | --- | --- |
| Langsung benar, <30 detik | 10 | +2 | 10-12 |
| Benar dengan Petunjuk (L2) | 7 | - | 7 |
| Benar dengan Solusi (L3) | 4 | - | 4 |
| Salah (semua layer) | 0 | - | 0 |
| Skip | 0 | - | 0 |

### **P1.3 Assessment Types & Engine**

**Priority:** MUST

| **Type** | **Purpose** | **Duration** | **Questions** | **Frequency** |
| --- | --- | --- | --- | --- |
| Pre-Test | Baseline | 15 min | 10 | Once |
| Daily Challenge | Daily practice | 15 min | 10 | Daily |
| Try Out | Periodic assessment | 60 min | 40 | Weekly |
| Marathon | UTBK simulation | 195 min | 155 | Monthly |
| Scheduled | Admin-scheduled | Var | Var | As scheduled |

**Question Selection Algorithm:**
- Exclude recent questions (last 30 days)
- 40% from weak topics + 60% random
- Balance difficulty: 30% easy, 50% medium, 20% hard

### **P1.4 Daily Challenge Streak**

**Priority:** MUST

- +1 streak untuk setiap hari menyelesaikan
- Grace period: sampai 01:00 hari berikutnya
- Streak reset jika miss 1 hari
- GitHub-style heatmap di profil

### **P1.5 15-Second Tips Video**

**Priority:** SHOULD

- Trigger: 3x salah pada topik yang sama dalam 7 hari
- Format: MP4, 720x1280, ≤500KB, ≤15 detik
- Storage: Supabase Storage + CDN caching
- Offline: IndexedDB cache

### **P1.6 PTN-Score Simulator**

**Priority:** MUST

- **Subtest Breakdown:** Skor per 7 subtest UTBK
- **PTN Probability:** Estimasi peluang masuk per program studi
- **Comparison:** Bandingkan dengan rata-rata user lain

**7 Subtest UTBK:**

| **Code** | **Name** | **Weight** |
| --- | --- | --- |
| PU | Penalaran Umum | 15% |
| PPU | Pengetahuan & Pemahaman Umum | 15% |
| PBM | Pemahaman Bacaan & Menulis | 15% |
| PK | Pengetahuan Kuantitatif | 15% |
| LIT_INDO | Literasi Bahasa Indonesia | 10% |
| LIT_ING | Literasi Bahasa Inggris | 10% |
| PM | Penalaran Matematika | 20% |

### **P1.7 Instant Action (Smart Remedial)**

**Priority:** MUST

- **Topik Lemah Highlight:** Visual untuk topik <55%
- **“Perbaiki Sekarang” Button:** Auto-generate 5 soal remedial
- **Step-by-Step UI:** Accordion untuk pembahasan

### **P1.8 Marathon Mode (UTBK Simulation)**

**Priority:** MUST

| **Attribute** | **Value** |
| --- | --- |
| Total Duration | 195 menit (3 jam 15 menit) |
| Total Questions | 155 soal |
| Mode | Full-screen, no exit |
| Timer | Per-subtest, auto-advance |
| Feedback | Only after completion |
| Retake | Max 1x per month |

**Fatigue Analytics:**
- Track time per question & accuracy per quarter
- High/Medium/Low fatigue indicator
- Recommendation untuk stamina improvement

### **P1.9 HOTS Scaffolding (Logic X-Ray)**

**Priority:** MUST

**For HOTS Questions:**
1. **Logic X-Ray:** Pertanyaan Socratic progressive
2. **Distractor Analysis:** Feedback spesifik per opsi salah
3. **Guided Discovery:** Memandu siswa menemukan pola sendiri

---

## **6. FEATURE SPECIFICATIONS - PILAR 2: COLLABORATIVE LEARNING (Squad Battle)**

### **P2.1 Squad Creation & Management**

**Priority:** SHOULD (Sprint 11, Days 85-91)

**Description:** Siswa dapat membuat study group 2-8 members untuk practice sessions.

**User Stories:**

```yaml
US-5.1.1: Create Squad
- Can create squad dengan name max 30 chars
- Set squad ke private atau public
- System generate unique invite code (6-digit alphanumeric)
- Creator jadi squad leader by default
- Max 1 active squad per student

US-5.1.2: Invite Members
- Share 6-digit invite code
- Browse & select classmates dari school yang sama
- Squad size: 2-8 members
- Pending invites expire: 48 hours
- Can revoke pending invites

US-5.1.3: Join Squad
- Enter invite code untuk join
- Accept/decline invitations
- Cannot be in multiple squads simultaneously
- Must leave current squad untuk join baru
```

### **P2.2 Squad Battle Session**

**Priority:** SHOULD

**Session Flow:**

```markdown
PHASE 1: Lobby (Max 5 minutes)
├── Leader creates session
├── Select: Topic, Difficulty, Question Count (5/10/20)
├── Members see "Battle Starting" notification
├── Lobby shows: Who's ready (checkmarks)
└── Auto-start when all ready OR leader forces start
              ↓
PHASE 2: Battle (Timed)
├── All members get SAME questions in SAME order
├── Timer: 1 minute per question
├── Real-time leaderboard (updates after each Q)
├── Can see: Who answered, who's thinking
└── No hints/solutions during battle
              ↓
PHASE 3: Results & Discussion
├── Final leaderboard with scores
├── Correct answers revealed
├── Solution available for all questions
├── Squad chat enabled (text only)
└── "Rematch" button untuk immediate retry
```

**User Stories:**

```yaml
US-5.2.1: Start Battle
- Select topic, difficulty, question count
- See which members online
- Can start with minimum 2 members
- Offline members can't join mid-session

US-5.2.2: Real-time Competition
- Leaderboard updates after each question
- Shows: Rank, Name, Score, Speed
- Green checkmark when answered
- Synchronized timer for all
- Cannot go back to previous questions
- Auto-submit when timer expires

US-5.2.3: Post-Battle Discussion
- Correct answers shown after battle
- View solution for each question
- Text chat available (24 hours persistence)
- Report inappropriate messages
- "Rematch" dengan same settings
```

### **P2.3 Squad Analytics & Gamification**

**Priority:** MAY (Future Enhancement)

| **Feature** | **Description** | **Priority** |
| --- | --- | --- |
| Squad Stats | Total battles, avg score, improvement % | Should |
| Member Contribution | Individual stats within squad | Should |
| Squad Badges | Achievements (10 battles, 80% avg) | May |
| Squad Rank | School-wide squad leaderboard | May |
| Squad Reminders | Notify when members online | May |

### **P2.4 Squad Battle Scoring**

**Scoring Rules:**

```markdown
baseScore: {
  correct: 10 points
  wrong: 0 points
  skipped: 0 points
}

speedBonus: {
  fast: +5 points   // < 20 seconds = 15 total
  medium: +2 points // 20-40 seconds = 12 total
  slow: 0 points    // > 40 seconds = 10 total
}

tiebreaker: Total time (faster wins)

Example Leaderboard:

┌────────────────────────────────────────┐
│ SQUAD BATTLE - Integral Challenge      │
│ Question 7 of 10                       │
├────────────────────────────────────────┤
│ 1. 🥇 Budi        85 pts  ⚡ 3.2s avg   │
│ 2. 🥈 Ani         82 pts  ⚡ 4.1s avg   │
│ 3. 🥉 Citra       78 pts  ⚡ 4.8s avg   │
│ 4.    Dedi        75 pts  ⚡ 5.2s avg   │
│ 5.    Eka         70 pts  ⚡ 6.1s avg   │
└────────────────────────────────────────┘
```

---

## **7. FEATURE SPECIFICATIONS - PILAR 3: ADMINISTRATIVE & SCHEDULING**

**Priority:** MUST (Critical for schools, Sprint 12, Days 92-98)

**Description:** Admin/teacher dapat schedule Try Out dan Marathon untuk tanggal masa depan dengan notifikasi otomatis.

**User Stories:**

```markdown
US-6.1.1: Schedule Try Out / Marathon
- Select assessment type: Try Out atau Marathon
- Select target: Specific classes atau All school
- Set: Date, Start time, End time (auto-deadline)
- Configure: Duration, Allow hints (yes/no)
- Configure: Show answers after (immediate/deadline/never)
- System validate: Start time is future, duration valid
- Creates assessment dalam status 'scheduled'

US-6.1.2: Auto-Publish Assessment
- Cron job runs every 5 minutes
- Checks for assessments where start_time <= NOW()
- Updates status: scheduled → active
- Sends notifications to all target students
- Logs action in audit_logs

US-6.1.3: Auto-Close Assessment
- Cron job runs every 5 minutes
- Checks for assessments where end_time <= NOW()
- Updates status: active → completed
- Auto-submits any in-progress submissions
- Sends completion notifications to teachers

US-6.1.4: Pre-Assessment Reminders
- Reminder 24 hours before start
- Reminder 1 hour before start
- Reminder 10 minutes before start (push only)
- Includes: Name, start time, duration
- Link to assessment (inactive until start)
```

### **P3.2 Assessment Calendar View**

**Priority:** SHOULD

**Admin Calendar Interface:**

```markdown
[← November 2025 →]        [+ Schedule New Assessment]

Week View:
┌───────┬───────┬───────┬───────┬───────┬───────┬──────┐
│ Mon 4 │ Tue 5 │ Wed 6 │ Thu 7 │ Fri 8 │ Sat 9 │Sun 10│
├───────┼───────┼───────┼───────┼───────┼───────┼──────┤
│       │       │ 08:00 │       │ 08:00 │       │      │
│       │       │Try Out│       │Marathon│       │      │
│       │       │IPA-1,2│       │All 12 │       │      │
│       │       │60 min │       │195 min│       │      │
│       │       │Active │       │Scheduled│      │      │
└───────┴───────┴───────┴───────┴───────┴───────┴──────┘

Upcoming (List View):
• Friday, Nov 8, 08:00 - Marathon - All Grade 12 - 195 min
  Status: Scheduled | [Edit] [Cancel]
```

### **P3.3 Bulk Assessment Management**

**Priority:** SHOULD

**Features:**

```yaml
Recurring Assessments:
- Weekly Try Out (every Friday 08:00)
- Monthly Marathon (first Saturday)
- Auto-generate for next 3 months
- Can edit individual instances
```

```yaml
Bulk Actions:
- Select multiple assessments
- Bulk cancel
- Bulk reschedule (shift by X days)
- Bulk duplicate (to other classes)
```

```yaml
Templates:
- Save configuration as template
- Reuse for quick scheduling
- School-wide vs teacher-specific
```

---

## **8. FEATURE SPECIFICATIONS - PILAR 2B: TEACHER & PARENT TOOLS**

### **P2.1 Teacher Command Center (Dashboard)**

**Priority:** MUST

**Class Heatmap View:**
- Visual indicator untuk siswa per-topic performance
- Warna: Green (70%+), Yellow (50-70%), Red (<50%)
- Drill-down ke student individual progress
- Quick action: “Assign Remedial” 1-click

**Student List dengan Flags:**
- Sortable by: Name, Score, Streak, Last Activity
- Flag categories: Not Started, Struggling, Strong
- Direct message ke siswa/parent

**Voice Note Feature:**
- Record max 30 second voice note
- Auto-transcription via Whisper API
- Send to specific student(s) atau class
- Playback notification

**Report Export:**
- PDF generation dengan charts
- Progress per student/class
- Subtest breakdown
- Export to Excel

### **P2.2 Parent Dashboard (WA-Lite Integration)**

**Priority:** SHOULD

**Parent Features:**
1. **Progress Cards (WhatsApp):**
- Mingguan progress summary
- Score trend visualization
- Weak topics highlight
- Link ke platform untuk detail

1. **One-Tap Prayer:**
    - Icon doa di dashboard
    - Random Islamic prayer/affirmation
    - Log doa activities
2. **Parent-Student Link:**
    - Verification via OTP
    - Consent management
    - Multiple children support

---

## **9. DATABASE SCHEMA**

### **9.1 Core Tables (PRD v3.0)**

**Essential Tables:**
- `schools` - School organization
- `users` - Student, Teacher, Parent, Admin users
- `classes` - Class management
- `enrollments` - Student-Class relationship
- `assessments` - Assessment definitions
- `question_bank` - All questions with layers
- `student_progress` - Individual attempt tracking
- `submissions` - Assessment submissions
- `video_tips` - Remedial video library
- `user_streaks` - Daily challenge streak data
- `messages` - Teacher voice notes & messages
- `notifications` - User notifications
- `audit_logs` - System activity logs

### **9.2 New Tables for Squad Battle (v3.1)**

```sql
– Table: squads
CREATE TABLE squads (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT NOT NULL (max 30 chars),
		description TEXT,
		invite_code TEXT UNIQUE NOT NULL (6-digit alphanumeric),
		leader_id UUID NOT NULL REFERENCES users(id),
		is_private BOOLEAN DEFAULT FALSE,
		school_id UUID REFERENCES schools(id),
		total_battles INTEGER DEFAULT 0,
		avg_score DECIMAL(5,2),
		status TEXT DEFAULT ‘active’ CHECK (status IN (‘active’, ‘disbanded’)),
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		disbanded_at TIMESTAMPTZ
);

– Table: squad_members
CREATE TABLE squad_members (
		id UUID PRIMARY KEY,
		squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
		student_id UUID NOT NULL REFERENCES users(id),
		status TEXT DEFAULT ‘pending’ CHECK (status IN (‘pending’, ‘active’, ‘left’, ‘removed’)),
		invited_at TIMESTAMPTZ DEFAULT NOW(),
		joined_at TIMESTAMPTZ,
		left_at TIMESTAMPTZ,
		battles_participated INTEGER DEFAULT 0,
		avg_rank DECIMAL(3,1),
		UNIQUE(squad_id, student_id)
);

– Table: squad_sessions
CREATE TABLE squad_sessions (
		id UUID PRIMARY KEY,
		squad_id UUID NOT NULL REFERENCES squads(id),
		topic_id UUID REFERENCES topics(id),
		difficulty TEXT CHECK (difficulty IN (‘easy’, ‘medium’, ‘hard’, ‘mixed’)),
		question_count INTEGER NOT NULL CHECK (question_count IN (5, 10, 20)),
		questions JSONB NOT NULL (Array of question IDs),
		duration_seconds INTEGER DEFAULT 60,
		started_at TIMESTAMPTZ,
		ended_at TIMESTAMPTZ,
		status TEXT DEFAULT ‘lobby’ CHECK (status IN (‘lobby’, ‘active’, ‘completed’, ‘cancelled’)),
		created_by UUID REFERENCES users(id),
		created_at TIMESTAMPTZ DEFAULT NOW()
);

– Table: squad_session_results
CREATE TABLE squad_session_results (
		id UUID PRIMARY KEY,
		session_id UUID NOT NULL REFERENCES squad_sessions(id) ON DELETE CASCADE,
		student_id UUID NOT NULL REFERENCES users(id),
		answers JSONB NOT NULL DEFAULT ‘{}’,
		total_score INTEGER NOT NULL DEFAULT 0,
		questions_correct INTEGER DEFAULT 0,
		questions_wrong INTEGER DEFAULT 0,
		questions_skipped INTEGER DEFAULT 0,
		avg_time_per_question DECIMAL(5,2),
		final_rank INTEGER,
		started_at TIMESTAMPTZ,
		submitted_at TIMESTAMPTZ,
		UNIQUE(session_id, student_id)
);

– Table: squad_chat_messages
CREATE TABLE squad_chat_messages (
		id UUID PRIMARY KEY,
		session_id UUID NOT NULL REFERENCES squad_sessions(id) ON DELETE CASCADE,
		sender_id UUID NOT NULL REFERENCES users(id),
		message TEXT NOT NULL CHECK (LENGTH(message) <= 500),
		flagged BOOLEAN DEFAULT FALSE,
		flagged_by UUID REFERENCES users(id),
		sent_at TIMESTAMPTZ DEFAULT NOW(),
		deleted_at TIMESTAMPTZ
);
```

### **9.3 New Tables for Scheduled Assessments**

```sql
– Table: scheduled_assessments
CREATE TABLE scheduled_assessments (
		id UUID PRIMARY KEY,
		assessment_id UUID REFERENCES assessments(id),
		title TEXT NOT NULL,
		description TEXT,
		type TEXT NOT NULL CHECK (type IN (‘tryout’, ‘marathon’, ‘custom’)),
		start_time TIMESTAMPTZ NOT NULL,
		end_time TIMESTAMPTZ NOT NULL,
		duration_minutes INTEGER NOT NULL,
		timezone TEXT DEFAULT ‘Asia/Jakarta’,
		school_id UUID NOT NULL REFERENCES schools(id),
		target_type TEXT NOT NULL CHECK (target_type IN (‘school’, ‘grade’, ‘classes’)),
		target_class_ids UUID[],
		target_grade INTEGER,
		question_count INTEGER NOT NULL,
		question_ids UUID[],
		allow_hints BOOLEAN DEFAULT FALSE,
		show_answers_after TEXT CHECK (show_answers_after IN (‘immediate’, ‘after_deadline’, ‘never’)),
		is_recurring BOOLEAN DEFAULT FALSE,
		recurrence_pattern JSONB,
		parent_schedule_id UUID REFERENCES scheduled_assessments(id),
		status TEXT DEFAULT ‘scheduled’ CHECK (status IN (‘draft’, ‘scheduled’, ‘published’, ‘active’, ‘completed’, ‘cancelled’)),
		created_by UUID NOT NULL REFERENCES users(id),
		reminder_24h_sent BOOLEAN DEFAULT FALSE,
		reminder_1h_sent BOOLEAN DEFAULT FALSE,
		reminder_10m_sent BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		published_at TIMESTAMPTZ,
		cancelled_at TIMESTAMPTZ
);
```

---

## **10. API SPECIFICATION HIGHLIGHTS**

### **10.1 Squad Battle Endpoints**

```yaml
OST /api/squads
- Create new squad
Request: {name, description, is_private}
Response: {squad_id, invite_code, leader_id}

POST /api/squads/join
- Join squad via invite code
Request: {invite_code}
Response: {squad, membership_status}

GET /api/squads/me
- Get current squad
Response: {current_squad, pending_invitations}

POST /api/squads/:id/sessions
- Create battle session (leader only)
Request: {topic_id, difficulty, question_count}
Response: {session_id, questions, duration_per_question}

POST /api/squads/sessions/:id/answer
- Submit answer during battle
Request: {question_id, answer, time_spent}
Response: {is_correct, score, current_rank, leaderboard}

GET /api/squads/sessions/:id/results
- Get final results after battle
Response: {final_leaderboard, questions_review, chat_enabled}

POST /api/squads/sessions/:id/chat
- Send chat message (post-battle only)
Request: {message}
Response: {message_id, sent_at}
```

### **10.2 Scheduled Assessment Endpoints**

```yaml
POST /api/admin/assessments/schedule
- Schedule future assessment
Request: {title, type, start_time, duration_minutes, target_type, …}
Response: {schedule_id, assessment_id, status, start_time, end_time}

GET /api/admin/assessments/scheduled
- List scheduled assessments
Query: {status, start_date, end_date, page}
Response: {schedules, meta}

GET /api/admin/assessments/calendar
- Get calendar view
Query: {start_date, end_date, view}
Response: {calendar with daily assessments}

POST /api/admin/assessments/templates
- Save assessment configuration as template
Request: {name, configuration}
Response: {template_id, name}

PUT /api/admin/assessments/scheduled/:id
- Update scheduled assessment (before publish)
Request: {updated fields}
Response: {schedule}

DELETE /api/admin/assessments/scheduled/:id
- Cancel scheduled assessment
Response: {message, notifications_sent}
```

---

## **11. SECURITY CONSIDERATIONS**

### **11.1 Squad Battle Security**

**Threats & Mitigations:**

```yaml
Threat: Cheating via external communication
Mitigation: Social learning context accepts this; Squad battles are practice, not high-stakes

Threat: Inappropriate chat content
Mitigation:
- Report button in chat UI
- Keyword filtering (profanity)
- Admin moderation dashboard
- Auto-suspend for flagged users

Threat: Squad invitation spam
Mitigation:
- Rate limit: Max 3 squads/student/day
- Rate limit: Max 10 invites/student/day
- Invite code expires: 48 hours
```

### **11.2 Scheduled Assessment Security**

**Threats & Mitigations:**

```yaml
Threat: Unauthorized schedule modification
Mitigation:
- RLS policies: Only admins/teachers can schedule
- Only creator can modify (before publish)
- Audit log all changes

Threat: Time manipulation (student changes device time)
Mitigation:
- Server-side time validation (all checks on server)
- Ignore client-reported time
- Use Supabase/Vercel server time as source of truth

Threat: Assessment leaking before start
Mitigation:
- Status-based access control
- Questions not loaded until ‘published’ status
- API returns 403 if status = ‘scheduled’

Threat: Auto-publish failure
Mitigation:
- Cron job health monitoring & alerts
- Manual publish fallback UI
- Retry logic with exponential backoff
```

### **11.3 Row Level Security (RLS) Policies**

**Key RLS Rules:**
- Students dapat access only their own data
- Teachers dapat access students in their classes
- Parents dapat access linked child’s data
- Admins dapat access school-wide data
- Squad members dapat access squad-specific data

---

## **12. IMPLEMENTATION ROADMAP - 105 DAYS**

### **12.1 Development Timeline**

```yaml

┌────────────────────────────────────────────────────────┐
│ 105-DAY MVP DEVELOPMENT (Extended)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ PHASE 1: Foundation (Days 1-21)                        │
│ ├── Sprint 0 (Days 1-3): Setup                         │
│ ├── Sprint 1 (Days 4-17): Core Student Features        │
│ └── Sprint 2 (Days 18-21): Assessment Engine           │
│                                                        │
│ PHASE 2: Teacher & Parent (Days 22-49)                 │
│ ├── Sprint 3 (Days 22-35): Teacher Dashboard           │
│ ├── Sprint 4 (Days 36-42): Voice Notes                 │
│ └── Sprint 5 (Days 43-49): Parent Features             │
│                                                        │
│ PHASE 3: Advanced Features (Days 50-70)                │
│ ├── Sprint 6 (Days 50-56): Marathon Mode               │
│ ├── Sprint 7 (Days 57-63): HOTS Scaffolding            │
│ └── Sprint 8 (Days 64-70): PTN Simulator & Reports     │
│                                                        │
│ PHASE 4: Polish (Days 71-84) [Original v3.0]           │
│ ├── Sprint 9 (Days 71-77): PoV Tools                   │
│ └── Sprint 10 (Days 78-84): Hardening                  │
│                                                        │
│ PHASE 5: NEW FEATURES (Days 85-105) [v3.1 Addition]    │
│ ├── Sprint 11 (Days 85-91): Squad Battle ⭐ NEW        │
│ │ └── Squad creation, invite, battle, chat             │
│ ├── Sprint 12 (Days 92-98): Scheduled Assessments ⭐   │
│ │ └── Scheduling, calendar, auto-pub, reminders        │
│ └── Final Testing (Days 99-105): E2E & UAT             │
│                                                        │
│ ★ DAY 105: MVP LAUNCH (Full Platform)                  │
│                                                        │
└────────────────────────────────────────────────────────┘

```

### **12.2 Sprint 11: Squad Battle (Days 85-91)**

| **Feature** | **Stories** | **Days** |
| --- | --- | --- |
| Squad Management | Create, invite, join, leave | 2 |
| Battle Session Lobby | Create session, ready system | 1 |
| Real-time Battle | Question sync, leaderboard, timer | 2 |
| Results & Review | Final scores, solutions | 1 |
| Post-Battle Chat | Text chat system | 1 |

**Deliverables:**
- [ ] Students dapat create/join squads
- [ ] Battle session real-time sync works
- [ ] Leaderboard updates correctly
- [ ] Chat works post-battle

### **12.3 Sprint 12: Scheduled Assessments (Days 92-98)**

| **Feature** | **Stories** | **Days** |
| --- | --- | --- |
| Schedule Creation UI | Admin form validation | 2 |
| Calendar View | Week/month view | 1 |
| Auto-Publish System | Cron job + notification | 2 |
| Reminder System | 24h, 1h, 10m reminders | 1 |
| Recurring Assessments | Pattern config + generation | 1 |

**Deliverables:**
- [ ] Admin dapat schedule future assessments
- [ ] Calendar shows all schedules
- [ ] Auto-publish works on time
- [ ] Reminders sent correctly
- [ ] Recurring patterns work

### **12.4 Final Testing (Days 99-105)**

| **Task** | **Focus** | **Days** |
| --- | --- | --- |
| E2E Testing | Squad battles, scheduled assessments | 2 |
| Load Testing | 50 concurrent squad sessions | 1 |
| Integration Testing | Feature interactions | 1 |
| UAT with Schools | Beta test dengan 2 schools | 2 |
| Bug Fixes | Critical issues only | 1 |

---

## **13. UPDATED SUCCESS METRICS**

### **MVP Success Criteria (Day 105)**

**Core Platform (v3.0):**
- PoV → Pilot conversion ≥60%
- Student activation ≥70%
- Teacher adoption 100% login, 60% voice notes
- Academic improvement ≥10% pre→post
- NPS (Teachers) ≥50

**New Features (v3.1):**
- Squad adoption ≥40%
- Squad retention ≥60% (≥2 battles/week)
- Scheduled assessment usage ≥80%
- Assessment attendance ≥85%

---

## **14. COST IMPACT ANALYSIS**

### **Additional Costs for New Features (v3.1)**

| **Service** | **Feature** | **Monthly Cost (50 schools)** |
| --- | --- | --- |
| Supabase Realtime | Squad battles | +$10 |
| Vercel Cron Jobs | Auto-publish | $0 |
| Database Storage | Squad chat history | +$5 |
| **Total Additional** |  | **+$15/month** |

**Updated Total Monthly Cost:** ~$230/month (~$4.60/school)

---

## **15. TESTING REQUIREMENTS**

### **15.1 Squad Battle Testing**

**Unit Tests:**
- Squad creation validation (2-8 members)
- Invite code generation (unique 6-digit)
- Battle scoring calculation
- Leaderboard ranking algorithm

**E2E Critical Path:**
- Student A creates squad
- Student B joins via invite code
- Student A starts battle
- Both answer questions
- View results & discuss in chat

### **15.2 Scheduled Assessment Testing**

**Unit Tests:**
- Schedule validation (future time, valid duration)
- Target audience calculation
- Recurrence pattern parsing

**E2E Critical Path:**
- Admin schedules Try Out for tomorrow
- Students receive reminders (24h, 1h)
- Assessment auto-publishes at start time
- Students take assessment
- Assessment auto-closes at deadline

---

## **16. RISK & MITIGATION**

| **Risk** | **Impact** | **Mitigation** |
| --- | --- | --- |
| Squad cheating via external comms | Medium | Educate teachers; social context acceptable |
| Auto-publish failure | High | Monitoring, health checks, manual fallback |
| Real-time sync latency | Medium | Optimistic UI, test with 50 concurrent sessions |
| Server time sync issues | High | Server-side validation, NTP sync checks |
| High chat moderation volume | Medium | Auto-filtering + user reports |
| Squad abandonment | Medium | Gamification badges, retention features (v3.1+) |

---

## **17. POST-LAUNCH ROADMAP (Post-Day 105)**

### **Phase 2: Extended Pilot (Days 106-180)**

- Gamification v1 (points, badges, leaderboard)
- Teacher question upload (Excel with review)
- Parent app improvements
- Advanced analytics (cohort analysis)

### **Phase 3: Scale (Days 181-365)**

- Native mobile app (React Native)
- AI tutor chatbot (Q&A support)
- Predictive analytics (at-risk early warning)
- Content marketplace (premium questions)

---

## **18. APPENDICES**

### **Appendix A: UI/UX Wireframe References**

**Key Screens:**
1. Squad Dashboard & Creation Modal
2. Battle Lobby (Waiting Room)
3. Battle Screen (Real-time Competition)
4. Results & Leaderboard
5. Chat Interface (Post-Battle)
6. Admin Calendar (Assessment Scheduling)
7. Assessment Template Builder

### **Appendix B: Database Migration Scripts**

*SQL scripts provided separately for:*
- Initial schema (v3.0 baseline)
- Squad tables & functions (v3.1 addition)
- Scheduled assessments tables & functions (v3.1 addition)
- RLS policies for all tables
- Indexes & performance optimization

### **Appendix C: PoV Agreement Template**

*(Standard terms for Proof of Value partnerships)*

### **Appendix D: Teacher Training Materials**

**Modules:**
- MODULE 1-4: Core platform (v3.0)
- MODULE 5: Squad Battle (NEW)
- MODULE 6: Scheduled Assessments (NEW)

---

## **19. DOCUMENT SIGN-OFF**

| **Role** | **Name** | **Signature** | **Date** |
| --- | --- | --- | --- |
| Product Owner | Coach Chaidir Bedalah | _________________ | ***/***/___ |
| Tech Lead | TBD | _________________ | ***/***/___ |
| Engineering Lead | TBD | _________________ | ***/***/___ |
| Design Lead | TBD | _________________ | ***/***/___ |
| QA Lead | TBD | _________________ | ***/***/___ |

---

**End of Document**

*PRD v3.2 Comprehensive - Gabungan PRD v3.0 (Core Platform) + v3.1 (Squad Battle & Scheduled Assessments)*

*Status: READY FOR DEVELOPMENT*

*Timeline: 105 Days to MVP Launch*