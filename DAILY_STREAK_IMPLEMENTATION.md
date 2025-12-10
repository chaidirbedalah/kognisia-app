# Daily Streak Implementation - Complete Guide

## Overview

Fitur Daily Streak melacak aktivitas harian siswa dan memberikan motivasi untuk konsisten belajar setiap hari.

## Features Implemented ✅

### 1. Database Schema
- **daily_streaks** table - Tracks individual activities
- **streak_stats** table - Aggregated statistics per user
- **Functions**:
  - `calculate_user_streak()` - Calculate current and longest streak
  - `update_streak_stats()` - Update aggregated stats
- **Trigger** - Auto-update stats when activity recorded

### 2. Activity Types
- ✅ `daily_challenge` - Daily Challenge completion
- ✅ `squad_battle` - Squad Battle completion
- ✅ `mini_tryout` - Mini Try Out completion
- ✅ `full_tryout` - Full Try Out UTBK completion

### 3. Streak Calculation Logic
- **Current Streak**: Consecutive days from today/yesterday
- **Longest Streak**: Maximum consecutive days ever
- **Total Active Days**: Total unique days with activity
- **Status**:
  - 🔥 **Active**: Activity today
  - ⚠️ **At Risk**: Last activity yesterday (need to complete today)
  - 💔 **Broken**: No activity for 2+ days

### 4. API Endpoints

#### POST /api/streak/record
Record a new activity
```json
{
  "activity_type": "squad_battle",
  "activity_id": "uuid",
  "activity_date": "2025-12-09" // optional, defaults to today
}
```

#### GET /api/streak/stats
Get user's streak statistics
```json
{
  "stats": {
    "current_streak": 5,
    "longest_streak": 12,
    "total_active_days": 45,
    "last_activity_date": "2025-12-09"
  },
  "recent_activities": [...],
  "calendar": [...]
}
```

### 5. UI Components

#### StreakCard
- Displays current streak, longest streak, total days
- Calendar heatmap (last 30 days)
- Status badge (Active/At Risk/Broken)
- Motivational message

### 6. Integration Points

#### Squad Battle
- ✅ Auto-record streak when battle completed
- Location: `src/app/api/squad/battle/[id]/complete/route.ts`

#### Daily Challenge (To be integrated)
- 🔄 Record streak on completion
- Location: TBD

#### Mini Try Out (To be integrated)
- 🔄 Record streak on completion
- Location: TBD

#### Full Try Out (To be integrated)
- 🔄 Record streak on completion
- Location: TBD

## Database Schema

### daily_streaks table
```sql
CREATE TABLE daily_streaks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, activity_date, activity_type)
);
```

### streak_stats table
```sql
CREATE TABLE streak_stats (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

## Files Created

### Database
- `database/migrations/014_create_daily_streaks_table.sql`

### Types
- `src/lib/streak-types.ts`

### API
- `src/app/api/streak/record/route.ts`
- `src/app/api/streak/stats/route.ts`

### Components
- `src/components/streak/StreakCard.tsx`

### Updated Files
- `src/app/dashboard/page.tsx` - Added StreakCard
- `src/app/api/squad/battle/[id]/complete/route.ts` - Added streak recording

## How It Works

### 1. User completes an activity (e.g., Squad Battle)
```typescript
// In complete battle API
await fetch('/api/streak/record', {
  method: 'POST',
  body: JSON.stringify({
    activity_type: 'squad_battle',
    activity_id: battleId
  })
})
```

### 2. Activity recorded in daily_streaks table
- Unique constraint prevents duplicates per day/type
- Trigger automatically updates streak_stats

### 3. Streak calculation
- Function checks consecutive days from today backwards
- Updates current_streak, longest_streak, total_active_days

### 4. Display in dashboard
- StreakCard fetches stats from API
- Shows current streak with fire icon 🔥
- Calendar heatmap visualizes activity
- Status badge shows streak health

## Testing

### Test Scenarios

1. **First Activity**
   - Record activity → Current streak = 1
   - Check stats → Longest streak = 1

2. **Consecutive Days**
   - Day 1: Record activity → Streak = 1
   - Day 2: Record activity → Streak = 2
   - Day 3: Record activity → Streak = 3

3. **Missed Day**
   - Day 1: Activity → Streak = 1
   - Day 2: No activity
   - Day 3: Activity → Streak = 1 (reset)

4. **Multiple Activities Same Day**
   - Record daily_challenge → Streak = 1
   - Record squad_battle → Streak still 1 (same day)

5. **Calendar Heatmap**
   - Shows last 30 days
   - Orange = active, Gray = inactive
   - Today has ring highlight

## Next Steps

### Immediate
1. ✅ Run migration 014
2. ✅ Test streak recording with Squad Battle
3. ✅ Verify StreakCard displays correctly

### Future Enhancements
1. 🔄 Integrate with Daily Challenge
2. 🔄 Integrate with Mini Try Out
3. 🔄 Integrate with Full Try Out
4. 🔄 Add streak badges/achievements
5. 🔄 Add school leaderboard for longest streaks
6. 🔄 Add push notifications for at-risk streaks
7. 🔄 Add weekly/monthly streak reports

## Migration Instructions

### Step 1: Run Migration 014
```sql
-- In Supabase SQL Editor
-- Run: database/migrations/014_create_daily_streaks_table.sql
```

### Step 2: Verify Tables Created
```sql
SELECT * FROM daily_streaks LIMIT 1;
SELECT * FROM streak_stats LIMIT 1;
```

### Step 3: Test Streak Recording
1. Complete a Squad Battle
2. Check `daily_streaks` table for new entry
3. Check `streak_stats` table for updated stats
4. View dashboard to see StreakCard

## Notes

- Streak resets if no activity for 2+ days
- Multiple activities on same day count as 1 day
- Streak calculation runs automatically via trigger
- Calendar shows last 30 days of activity
- Status updates in real-time based on last_activity_date
