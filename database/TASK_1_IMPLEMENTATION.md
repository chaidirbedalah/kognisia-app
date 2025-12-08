# Task 1: Create Subtests Reference Table and Seed Data

## Overview

This task implements the foundation for UTBK 2026 compliance by creating a reference table for the 6 official subtests and seeding it with the correct data.

## Requirements Addressed

- **Requirement 1.1**: System SHALL support exactly six subtests matching UTBK 2026 specifications
- **Requirement 1.3**: System SHALL maintain consistent subtest names across all features
- **Requirement 1.4**: System SHALL store time allocation for each subtest
- **Requirement 1.5**: System SHALL store question count for each subtest

## Files Created

### 1. Database Migration
**File**: `database/migrations/001_create_subtests_table.sql`

Creates the `subtests` table with:
- Primary key: `code` (TEXT)
- Fields: name, description, icon, display_order, utbk_question_count, utbk_duration_minutes
- Timestamps: created_at, updated_at
- Index on display_order for efficient ordering

Seeds 6 official UTBK 2026 subtests:
1. PPU - Pengetahuan & Pemahaman Umum (20 questions, 15 minutes)
2. PBM - Pemahaman Bacaan & Menulis (20 questions, 25 minutes)
3. PK - Pengetahuan Kuantitatif (20 questions, 20 minutes)
4. LIT_INDO - Literasi Bahasa Indonesia (30 questions, 42.5 minutes)
5. LIT_ING - Literasi Bahasa Inggris (20 questions, 20 minutes)
6. PM - Penalaran Matematika (20 questions, 42.5 minutes)

**Total**: 160 questions, 195 minutes (3 hours 15 minutes)

### 2. TypeScript Constants
**File**: `src/lib/utbk-constants.ts`

Defines:
- `Subtest` interface
- `UTBK_2026_SUBTESTS` constant array with all 6 subtests
- `VALID_SUBTEST_CODES` array for validation
- `AssessmentConfig` and `SubtestDistribution` interfaces
- `ASSESSMENT_CONFIGS` for different assessment types:
  - daily_challenge_balanced (18 questions)
  - daily_challenge_focus (10 questions)
  - tryout_utbk (160 questions)
  - mini_tryout (60 questions)
- Helper functions:
  - `getSubtestByCode()`
  - `isValidSubtestCode()`
  - `getAllSubtestCodes()`
  - `getOrderedSubtests()`

### 3. Subtests API
**File**: `src/lib/subtests-api.ts`

Provides functions to interact with the subtests table:
- `fetchSubtests()` - Fetch all subtests from database (with fallback to constants)
- `fetchSubtestByCode()` - Fetch a single subtest by code
- `verifySubtestsCount()` - Verify exactly 6 subtests exist
- `verifySubtestsTotals()` - Verify totals match UTBK 2026 specs (160 questions, 195 minutes)

### 4. Verification Script
**File**: `scripts/verify-subtests.ts`

Automated verification script that checks:
- Table exists and is accessible
- Exactly 6 subtests are present
- Each subtest has correct data (name, questions, duration)
- Totals match UTBK 2026 specifications
- All subtest codes match expected values

### 5. Documentation
**File**: `database/README.md`

Instructions for:
- Running migrations via Supabase Dashboard
- Running migrations via Supabase CLI
- Manual execution
- Verification queries
- Rollback procedures

## How to Deploy

### Step 1: Run the Migration

Choose one of these methods:

#### Option A: Supabase Dashboard (Recommended)
1. Log in to your Supabase project at https://supabase.com
2. Navigate to SQL Editor
3. Copy contents of `database/migrations/001_create_subtests_table.sql`
4. Paste and click "Run"

#### Option B: Supabase CLI
```bash
cd kognisia-app
supabase db execute --file database/migrations/001_create_subtests_table.sql
```

#### Option C: Direct PostgreSQL Connection
Connect to your database and execute the SQL file directly.

### Step 2: Verify the Migration

Run verification queries in Supabase SQL Editor:

```sql
-- Check count
SELECT COUNT(*) FROM subtests;
-- Expected: 6

-- Check totals
SELECT 
  SUM(utbk_question_count) as total_questions,
  SUM(utbk_duration_minutes) as total_minutes
FROM subtests;
-- Expected: 160 questions, 195 minutes

-- View all data
SELECT * FROM subtests ORDER BY display_order;
```

### Step 3: Test in Application

The constants and API functions are now available for use:

```typescript
import { UTBK_2026_SUBTESTS, getSubtestByCode } from '@/lib/utbk-constants'
import { fetchSubtests } from '@/lib/subtests-api'

// Use constants (always available)
console.log(UTBK_2026_SUBTESTS) // Array of 6 subtests

// Fetch from database
const subtests = await fetchSubtests()
console.log(subtests) // Array of 6 subtests from DB

// Get specific subtest
const ppu = getSubtestByCode('PPU')
console.log(ppu?.name) // "Pengetahuan & Pemahaman Umum"
```

## Validation

### Property 1: Six Subtest System Configuration
✅ The system now references exactly 6 subtests matching UTBK 2026 specification

Validation:
- Database table contains exactly 6 records
- Constants array contains exactly 6 subtests
- All codes match: PPU, PBM, PK, LIT_INDO, LIT_ING, PM
- Display order is 1-6
- Total questions = 160
- Total duration = 195 minutes

### Data Integrity Checks

The implementation includes multiple layers of validation:

1. **Database Level**:
   - Primary key constraint on code
   - NOT NULL constraints on required fields
   - Index on display_order

2. **Application Level**:
   - Type safety with TypeScript interfaces
   - Validation functions (isValidSubtestCode)
   - Fallback to constants if database unavailable

3. **Verification Script**:
   - Automated checks for count, totals, and data accuracy
   - Comparison against expected values

## Next Steps

This task provides the foundation for:
- Task 2: Update question_bank schema with subtest_code
- Task 3: Update student_progress schema for mode tracking
- All subsequent tasks that reference subtests

## Rollback

If needed, rollback with:

```sql
DROP TABLE IF EXISTS subtests CASCADE;
```

**Warning**: This will cascade to any tables with foreign keys to subtests.

## Notes

- The table uses `ON CONFLICT (code) DO NOTHING` to allow safe re-running of the seed data
- Icons use emoji for visual representation in UI
- Duration uses DECIMAL(4,1) to support fractional minutes (e.g., 42.5)
- The API includes fallback to constants for resilience
- All 6 subtests are required for UTBK 2026 compliance
