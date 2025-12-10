# Migration Guide - Run in Order

## Problem
Migration 012 gagal karena tabel `subtests` belum ada di database.

## Solution
Jalankan migrations dalam urutan yang benar:

### Step 1: Check if subtests table exists
```sql
-- Run this query first
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subtests'
) as subtests_exists;
```

### Step 2: If subtests table DOES NOT exist, run Migration 001
**File:** `database/migrations/001_create_subtests_table.sql`

This will create:
- `subtests` table with 6 UTBK 2026 subtests
- Columns: code (PK), name, description, icon, display_order, etc.

### Step 3: Run Migration 012 (Updated - No Foreign Key)
**File:** `database/migrations/012_add_battle_material_options.sql`

This will add to `squad_battles`:
- `battle_type` column (subtest or mini_tryout)
- `subtest_code` column (TEXT, no FK constraint yet)
- `question_count` column

### Step 4: Run Migration 013 (Add Foreign Key)
**File:** `database/migrations/013_add_subtest_foreign_key.sql`

This will add:
- Foreign key constraint: `squad_battles.subtest_code -> subtests.code`
- Index for performance

## Migration Order Summary

```
1. ✅ Migration 001: Create subtests table
2. ✅ Migration 012: Add battle material columns (no FK)
3. ✅ Migration 013: Add foreign key constraint
```

## Verify Subtests Data

After running migration 001, verify the data:

```sql
SELECT code, name, display_order 
FROM subtests 
ORDER BY display_order;
```

Expected result (6 subtests):
1. PPU - Pengetahuan & Pemahaman Umum
2. PBM - Pemahaman Bacaan & Menulis
3. PK - Pengetahuan Kuantitatif
4. LIT_INDO - Literasi Bahasa Indonesia
5. LIT_ING - Literasi Bahasa Inggris
6. PM - Penalaran Matematika

## Notes

- Migration 001 uses `code` (TEXT) as primary key, not `id` (UUID)
- Valid subtest codes: PPU, PBM, PK, LIT_INDO, LIT_ING, PM
- Migration 012 updated to NOT include FK constraint initially
- Migration 013 adds FK constraint after subtests table exists
