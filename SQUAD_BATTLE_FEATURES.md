# Squad Battle Features - Complete Guide

## Overview

Squad Battle adalah fitur kompetisi real-time dimana siswa dapat membuat squad, mengajak teman, dan berkompetisi menyelesaikan soal-soal UTBK.

## Features Implemented ✅

### 1. Navigation
- ✅ Link "Back to Dashboard" di halaman Squad Battle
- ✅ Navigasi antar halaman squad yang smooth

### 2. Squad Management
- ✅ Create Squad (nama + max members 2-8)
- ✅ Join Squad (dengan invite code)
- ✅ Leave Squad
- ✅ View Squad Details
- ✅ Copy Invite Code

### 3. Battle Material Options

#### A. Subtest Battle
Siswa dapat memilih:
- **Subtest**: Pilih 1 dari 7 subtest UTBK
  - Penalaran Matematika
  - Literasi Bahasa Indonesia
  - Literasi Bahasa Inggris
  - Pengetahuan Kuantitatif
  - Pengetahuan dan Pemahaman Umum
  - Pemahaman Bacaan dan Menulis
  - Pengetahuan Matematika
- **Jumlah Soal**: 5, 10, 15, 20, 25, atau 30 soal
- **Tingkat Kesulitan**: Mudah, Sedang, Sulit

#### B. Mini Try Out Battle
- Semua subtest digabung
- Format mini try out lengkap
- Jumlah soal otomatis (50 soal)
- Tingkat kesulitan: Mudah, Sedang, Sulit

### 4. Battle Flow
1. Squad leader membuat battle
2. Pilih materi (Subtest atau Mini Try Out)
3. Pilih tingkat kesulitan
4. Start battle
5. Semua member menjawab soal yang sama
6. Live leaderboard real-time
7. Hasil akhir dengan ranking

### 5. Leaderboard
- Real-time updates menggunakan Supabase Realtime
- Ranking berdasarkan score dan kecepatan
- Tampilan nama, score, accuracy, dan rank

### 6. Battle History
- Riwayat semua battle yang pernah diikuti
- Informasi: tanggal, squad, rank, score, accuracy

## Database Schema

### New Columns in `squad_battles` table:
```sql
- battle_type: 'subtest' | 'mini_tryout'
- subtest_id: UUID (nullable, for subtest battles)
- question_count: INTEGER (nullable, for subtest battles)
```

## API Endpoints

### GET /api/subtests
Mendapatkan daftar semua subtest UTBK
```json
{
  "subtests": [
    {
      "id": "uuid",
      "name": "Penalaran Matematika",
      "description": "..."
    }
  ]
}
```

### POST /api/squad/battle/start
Start battle dengan material options
```json
{
  "squad_id": "uuid",
  "battle_type": "subtest" | "mini_tryout",
  "subtest_id": "uuid", // required for subtest
  "question_count": 10, // required for subtest
  "difficulty": "easy" | "medium" | "hard",
  "time_limit_minutes": 15
}
```

## Components

### New Components:
- `StartBattleDialog.tsx` - Dialog untuk memilih materi battle

### Updated Components:
- `squad/page.tsx` - Added back to dashboard link
- `squad/[id]/page.tsx` - Integrated StartBattleDialog
- `squad-types.ts` - Added battle_type, subtest_id, question_count
- `squad-api.ts` - Updated startSquadBattle logic

## Migrations

### Migration 012: Add Battle Material Options
```sql
ALTER TABLE squad_battles
ADD COLUMN battle_type TEXT DEFAULT 'subtest';
ADD COLUMN subtest_id UUID REFERENCES subtests(id);
ADD COLUMN question_count INTEGER;
```

## Next Steps (Future Enhancements)

### Streak Harian Integration
Semua aktivitas test akan tercatat dalam Streak Harian:
- ✅ Daily Challenge
- 🔄 Squad Battle (to be integrated)
- 🔄 Mini Try Out (to be integrated)
- 🔄 Try Out UTBK (to be integrated)

### Implementation Plan:
1. Create `daily_streaks` table
2. Track completion of any test activity
3. Update streak counter on test completion
4. Display streak in dashboard
5. Add streak badges/rewards

## Testing

### Test Scenarios:
1. ✅ Create squad with 2-8 members
2. ✅ Join squad with invite code
3. ✅ Start subtest battle (select subtest + question count)
4. ✅ Start mini try out battle
5. ✅ Complete battle and view results
6. ✅ View battle history
7. ✅ Navigate back to dashboard

### Demo Accounts:
- Students: andi@siswa.id, bagus@siswa.id, etc. (30 total)
- Password: demo123456

## Files Modified

### New Files:
- `database/migrations/012_add_battle_material_options.sql`
- `src/components/squad/StartBattleDialog.tsx`
- `src/app/api/subtests/route.ts`
- `SQUAD_BATTLE_FEATURES.md`

### Updated Files:
- `src/app/squad/page.tsx`
- `src/app/squad/[id]/page.tsx`
- `src/lib/squad-types.ts`
- `src/lib/squad-api.ts`
- `src/app/api/squad/battle/start/route.ts`

## Notes

- Battle type default: 'subtest'
- Question count range: 5-30 for subtest, 50 for mini try out
- Time limit range: 5-60 minutes
- Minimum members to start battle: 2
- Maximum members per squad: 8
