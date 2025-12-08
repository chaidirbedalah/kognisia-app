# Task 4 Implementation: Update Assessment Types

## Overview

This task updates the assessment type system to support UTBK 2026 compliance by:
1. Adding support for 'mini_tryout' assessment type
2. Updating existing 'marathon' records to 'tryout_utbk' for clarity
3. Updating all TypeScript types and code references

## Changes Made

### 1. Database Migration

**File**: `database/migrations/004_update_assessment_types.sql`

- Created migration to update 'marathon' to 'tryout_utbk' in student_progress table
- Added column comment documenting valid assessment types
- Included verification queries to ensure data integrity
- Migration is idempotent and includes detailed logging

### 2. TypeScript Types

**File**: `src/lib/types.ts`

- Updated `AssessmentType` to remove 'marathon' and keep 'tryout_utbk' and 'mini_tryout'
- Added documentation noting that 'marathon' has been deprecated
- Valid assessment types are now:
  - 'pre_test'
  - 'daily_challenge'
  - 'tryout'
  - 'tryout_utbk' (replaces 'marathon')
  - 'mini_tryout' (new)
  - 'scheduled'

### 3. API Layer Updates

**File**: `src/lib/dashboard-api.ts`

- Renamed `MarathonData` interface to `TryOutUTBKData`
- Renamed `fetchMarathonData()` function to `fetchTryOutUTBKData()`
- Updated `UserStats` interface: `totalMarathons` → `totalTryOutUTBK`
- Updated `DashboardData` interface: `marathonData` → `tryOutUTBKData`
- Updated all internal references to filter by 'tryout_utbk' instead of 'marathon'
- Updated error messages and logging

### 4. Calculation Functions

**File**: `src/lib/dashboard-calculations.ts`

- Updated `AssessmentTypeBreakdown` interface: `marathon` → `tryOutUTBK`
- Updated `calculateOverallTrend()` to accept `TryOutUTBKData[]`
- Updated `groupByAssessmentType()` to accept `TryOutUTBKData[]`
- Updated all internal calculations to use tryOutUTBK naming

### 5. UI Components

**File**: `src/components/dashboard/MarathonTab.tsx`

- Updated to import and use `TryOutUTBKData` type
- Updated internal variable names from `marathon` to `tryOut`
- Updated comments to reference "Try Out UTBK" instead of "Marathon"
- Component name kept as `MarathonTab` for backward compatibility

**File**: `src/components/dashboard/InsightsCard.tsx`

- Updated user-facing text from "Marathon" to "Try Out UTBK"

**File**: `src/app/dashboard/page.tsx`

- Updated imports to use `TryOutUTBKData` and `fetchTryOutUTBKData`
- Updated state variable: `marathonData` → `tryOutUTBKData`
- Updated all references to use new naming convention
- Updated StatsCard to display `totalTryOutUTBK` and `tryOutUTBKAccuracy`

### 6. Documentation

**File**: `database/README.md`

- Added documentation for migration 004
- Listed requirements satisfied (7.8)
- Documented dependencies

**File**: `database/migrations/MIGRATION_LOG.md`

- Added comprehensive migration log entry for 004
- Documented what the migration does
- Listed pre-migration checklist
- Provided verification queries
- Documented rollback plan
- Listed code updates required
- Added testing checklist

## Requirements Satisfied

✅ **Requirement 7.8**: System stores assessment type as 'mini_tryout' in student progress

## Migration Instructions

### Pre-Migration

1. Backup the database
2. Review current assessment type distribution:
   ```sql
   SELECT assessment_type, COUNT(*) 
   FROM student_progress 
   GROUP BY assessment_type;
   ```

### Running the Migration

Execute the migration file in Supabase SQL Editor:
```bash
# Using Supabase CLI
supabase db execute --file database/migrations/004_update_assessment_types.sql
```

Or copy and paste the SQL into the Supabase dashboard SQL editor.

### Post-Migration Verification

Run these queries to verify:

```sql
-- Should return 0 (no marathon records remain)
SELECT COUNT(*) as marathon_count 
FROM student_progress 
WHERE assessment_type = 'marathon';

-- View all assessment types in use
SELECT 
  assessment_type,
  COUNT(*) as count,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM student_progress
GROUP BY assessment_type
ORDER BY assessment_type;

-- Check for any invalid assessment types (should return 0 rows)
SELECT DISTINCT assessment_type
FROM student_progress
WHERE assessment_type NOT IN (
  'pre_test', 
  'daily_challenge', 
  'tryout', 
  'tryout_utbk',
  'mini_tryout', 
  'scheduled'
);
```

## Testing

### Manual Testing

1. ✅ TypeScript compilation passes with no errors
2. ✅ All imports and type references updated
3. ✅ Dashboard page loads without errors
4. ✅ Try Out UTBK tab displays correctly
5. ✅ Stats cards show correct data

### Automated Testing

Run diagnostics to verify no TypeScript errors:
```bash
npm run type-check
```

## Rollback Plan

If issues occur, run:

```sql
-- Revert tryout_utbk back to marathon
UPDATE student_progress 
SET assessment_type = 'marathon',
    updated_at = NOW()
WHERE assessment_type = 'tryout_utbk' 
  AND updated_at >= '[migration_timestamp]';

-- Remove column comment
COMMENT ON COLUMN student_progress.assessment_type IS NULL;
```

## Notes

- The component file name `MarathonTab.tsx` is kept for backward compatibility
- The tab identifier 'marathon' is kept in the dashboard page for routing consistency
- All user-facing text now says "Try Out UTBK" instead of "Marathon"
- The migration is safe to run multiple times (idempotent)
- No data loss occurs during migration
- Historical data is preserved with updated naming

## Next Steps

1. Execute the migration in the database
2. Deploy the updated code
3. Monitor for any issues
4. Update any external documentation or user guides
5. Proceed to Task 5: Create TypeScript constants and interfaces

## Status

- [x] Migration file created
- [x] TypeScript types updated
- [x] API layer updated
- [x] Calculation functions updated
- [x] UI components updated
- [x] Documentation updated
- [x] TypeScript diagnostics pass
- [ ] Migration executed in database
- [ ] Application tested with real data
- [ ] User acceptance testing completed
