# UTBK 2026 Quick Reference

## Official Structure

### 7 Subtests (Total: 160 questions, 195 minutes)

| Code | Name | Questions | Duration | Icon |
|------|------|-----------|----------|------|
| PU | Penalaran Umum | 30 | 35 min | 🧠 |
| PPU | Pengetahuan & Pemahaman Umum | 20 | 15 min | 🌍 |
| PBM | Pemahaman Bacaan & Menulis | 20 | 25 min | 📖 |
| PK | Pengetahuan Kuantitatif | 20 | 20 min | 🔢 |
| LIT_INDO | Literasi Bahasa Indonesia | 30 | 40 min | 📚 |
| LIT_ING | Literasi Bahasa Inggris | 20 | 20 min | 🌐 |
| PM | Penalaran Matematika | 20 | 40 min | 🧮 |

**Note:** UTBK 2026 has 7 separate subtests. PU (Penalaran Umum) and PPU (Pengetahuan & Pemahaman Umum) are distinct subtests. Total: 160 questions in 195 minutes.

## Assessment Types

### Daily Challenge - Balanced Mode
- **Total**: 21 questions
- **Distribution**: 3 questions per subtest (all 7 subtests)
- **Duration**: ~25 minutes (flexible)

### Daily Challenge - Focus Mode
- **Total**: 10 questions
- **Distribution**: All from 1 selected subtest
- **Duration**: ~15 minutes (flexible)

### Try Out UTBK
- **Total**: 160 questions
- **Distribution**: As per official UTBK (see table above)
- **Duration**: 195 minutes (3 hours 15 minutes)

### Mini Try Out
- **Total**: 70 questions
- **Distribution**: 10 questions per subtest (all 7 subtests)
- **Duration**: 90 minutes

## Code Usage

### Import Constants

```typescript
import { 
  UTBK_2026_SUBTESTS, 
  VALID_SUBTEST_CODES,
  ASSESSMENT_CONFIGS,
  getSubtestByCode,
  isValidSubtestCode
} from '@/lib/utbk-constants'
```

### Fetch from Database

```typescript
import { 
  fetchSubtests, 
  fetchSubtestByCode,
  verifySubtestsCount 
} from '@/lib/subtests-api'

// Get all subtests
const subtests = await fetchSubtests()

// Get specific subtest
const pu = await fetchSubtestByCode('PU')
const ppu = await fetchSubtestByCode('PPU')

// Verify setup
const isValid = await verifySubtestsCount() // Should return true (7 subtests)
```

### Validate Subtest Code

```typescript
import { isValidSubtestCode } from '@/lib/utbk-constants'

if (isValidSubtestCode(code)) {
  // Code is valid (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, or PM)
}
```

### Get Assessment Config

```typescript
import { ASSESSMENT_CONFIGS } from '@/lib/utbk-constants'

const config = ASSESSMENT_CONFIGS.tryout_utbk
console.log(config.totalQuestions) // 160
console.log(config.subtestDistribution) // Array of 7 distributions
```

## Database Schema

### subtests Table

```sql
CREATE TABLE subtests (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL,
  utbk_question_count INTEGER NOT NULL,
  utbk_duration_minutes DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Query Examples

```sql
-- Get all subtests in order
SELECT * FROM subtests ORDER BY display_order;

-- Get subtest by code
SELECT * FROM subtests WHERE code = 'PU';
SELECT * FROM subtests WHERE code = 'PPU';

-- Verify totals
SELECT 
  COUNT(*) as count,
  SUM(utbk_question_count) as total_questions,
  SUM(utbk_duration_minutes) as total_minutes
FROM subtests;
-- Expected: count=7, total_questions=160, total_minutes=195
```

## Migration Status

- ✅ Task 1: Subtests reference table created (7 subtests)
- ⏳ Task 2: question_bank schema update (pending)
- ⏳ Task 3: student_progress schema update (pending)

## Important Notes

1. **Always use 7 subtests** - UTBK 2026 has exactly 7 subtests
2. **PU and PPU are separate** - Penalaran Umum (PU) and Pengetahuan & Pemahaman Umum (PPU) are distinct
3. **Codes are case-sensitive** - Use uppercase (PU, PPU, not pu, ppu)
4. **PU and LIT_INDO have 30 questions** - All others have 20
5. **Total must be 160 questions** - Across all 7 subtests
6. **Total duration is 195 minutes** - 3 hours 15 minutes exactly

## Valid Subtest Codes

All 7 official UTBK 2026 subtest codes:
- `PU` - Penalaran Umum (30 questions, 35 minutes)
- `PPU` - Pengetahuan & Pemahaman Umum (20 questions, 15 minutes)
- `PBM` - Pemahaman Bacaan & Menulis (20 questions, 25 minutes)
- `PK` - Pengetahuan Kuantitatif (20 questions, 20 minutes)
- `LIT_INDO` - Literasi Bahasa Indonesia (30 questions, 40 minutes)
- `LIT_ING` - Literasi Bahasa Inggris (20 questions, 20 minutes)
- `PM` - Penalaran Matematika (20 questions, 40 minutes)

## Resources

- Requirements: `.kiro/specs/utbk-2026-compliance/requirements.md`
- Design: `.kiro/specs/utbk-2026-compliance/design.md`
- Tasks: `.kiro/specs/utbk-2026-compliance/tasks.md`
- Migration: `database/migrations/001_create_subtests_table.sql`
- Implementation Guide: `database/TASK_1_IMPLEMENTATION.md`
- Official Reference: `utbk-2026.md`

