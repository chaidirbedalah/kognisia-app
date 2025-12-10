# Scheduled Battle Implementation - Complete Guide

## Overview

Fitur Scheduled Battle memungkinkan leader squad untuk menjadwalkan battle di waktu tertentu, dengan auto-start dan notifikasi untuk semua member.

## Problem Solved

**Before**: Setelah member join squad, tidak ada yang terjadi - tidak jelas kapan battle dimulai.

**After**: Leader schedule battle → Member dapat notifikasi → Countdown timer → Auto-start saat waktu tiba → Late join allowed (tapi waktu terus berjalan).

## Features Implemented ✅

### 1. Scheduling Options
Leader dapat memilih waktu mulai battle:
- ✅ **Mulai Sekarang** - Battle langsung dimulai (immediate)
- ✅ **10 Menit dari Sekarang** - Quick prep time
- ✅ **30 Menit dari Sekarang** - Standard prep time
- ✅ **Custom** - Pilih tanggal & waktu spesifik

### 2. Auto-Start System
- ✅ Battle status: `scheduled` → `active` otomatis saat waktu tiba
- ✅ Function `auto_start_scheduled_battles()` dipanggil setiap menit
- ✅ Tidak perlu manual click "Start"

### 3. Battle Rules
- ✅ **Minimum participants**: 1 (battle tetap jalan walau sendirian)
- ✅ **Late join**: Allowed (waktu terus berjalan - late joiners rugi waktu)
- ✅ **Winner badge**: Yang hadir dapat badge, walau sendirian
- ✅ **Discipline training**: "Be there or beware!"

### 4. Notification System
- ✅ **battle_scheduled**: Notif saat battle dijadwalkan
- ✅ **battle_starting**: Reminder 5 menit sebelum start
- ✅ **battle_started**: Notif saat battle auto-start
- ✅ **In-app only**: Tidak ada email notification

### 5. UI Components
- ✅ **StartBattleDialog**: Tambah scheduling options
- ✅ **ScheduledBattleCard**: Card untuk scheduled battles dengan countdown
- ✅ **Warning message**: "Battle will auto-start. Be there or beware!"

## Database Schema

### Updated: squad_battles table
```sql
ALTER TABLE squad_battles
ADD COLUMN scheduled_start_at TIMESTAMPTZ;

-- New status: 'scheduled'
ALTER TABLE squad_battles
ADD CONSTRAINT squad_battles_status_check 
CHECK (status IN ('scheduled', 'waiting', 'active', 'completed', 'cancelled'));
```

### New: battle_notifications table
```sql
CREATE TABLE battle_notifications (
  id UUID PRIMARY KEY,
  battle_id UUID NOT NULL,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  UNIQUE(battle_id, user_id, notification_type)
);
```

## Functions

### 1. auto_start_scheduled_battles()
```sql
-- Finds battles with scheduled_start_at <= NOW()
-- Updates status to 'active'
-- Sends 'battle_started' notifications
-- Should be called every minute via cron
```

### 2. send_battle_reminders()
```sql
-- Finds battles starting in 5 minutes
-- Sends 'battle_starting' notifications
-- Should be called every minute via cron
```

### 3. notify_squad_battle_scheduled()
```sql
-- Trigger on INSERT to squad_battles
-- Sends 'battle_scheduled' notifications to all squad members
```

## API Endpoints

### POST /api/squad/battle/start
Updated to accept `scheduled_start_at`:
```json
{
  "squad_id": "uuid",
  "battle_type": "subtest",
  "subtest_code": "PM",
  "question_count": 10,
  "difficulty": "medium",
  "scheduled_start_at": "2025-12-09T15:30:00Z" // Optional
}
```

Response:
- If `scheduled_start_at` provided → status = 'scheduled'
- If not provided → status = 'active' (immediate start)

## User Flow

### Leader Creates Scheduled Battle
1. Leader clicks "Start Battle"
2. Selects materi (subtest/mini tryout)
3. Selects difficulty
4. **Selects schedule time** (now/10min/30min/custom)
5. Sees warning: "Battle will auto-start. Be there or beware!"
6. Clicks "Start Battle"
7. Battle created with status = 'scheduled'
8. All squad members get notification

### Member Receives Notification
1. Member sees in-app notification: "New battle scheduled for [time]"
2. Member can view scheduled battle in squad page
3. Sees countdown timer
4. Gets reminder 5 minutes before start
5. Gets notification when battle starts

### Battle Auto-Starts
1. Cron job calls `auto_start_scheduled_battles()` every minute
2. Function finds battles with `scheduled_start_at <= NOW()`
3. Updates status to 'active'
4. Sends 'battle_started' notifications
5. Members can join immediately (late join allowed)

### Late Join Scenario
1. Battle starts at 15:00
2. Member A joins at 15:00 → Full 15 minutes
3. Member B joins at 15:05 → Only 10 minutes left
4. Member C joins at 15:10 → Only 5 minutes left
5. All compete, but late joiners have disadvantage

## Files Created

### Database
- `database/migrations/015_add_scheduled_battle.sql`

### Types
- Updated `src/lib/squad-types.ts`:
  - Added `scheduled_start_at` to SquadBattle
  - Added `BattleNotification` interface
  - Added `getTimeUntilBattle()` helper

### Components
- Updated `src/components/squad/StartBattleDialog.tsx`:
  - Added scheduling options (now/10min/30min/custom)
  - Added date/time pickers for custom
  - Added warning message
- Created `src/components/squad/ScheduledBattleCard.tsx`:
  - Shows scheduled time
  - Countdown timer (updates every second)
  - Warning message
  - Join button

### API
- Updated `src/lib/squad-api.ts`:
  - Handle `scheduled_start_at` in startSquadBattle()
  - Set status based on scheduling

## Cron Job Setup (Important!)

You need to set up cron jobs to call these functions every minute:

### Option 1: Supabase Edge Functions (Recommended)
```typescript
// supabase/functions/auto-start-battles/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Auto-start battles
  await supabase.rpc('auto_start_scheduled_battles')
  
  // Send reminders
  await supabase.rpc('send_battle_reminders')
  
  return new Response('OK')
})
```

Then set up cron in Supabase Dashboard:
```
0 * * * * * // Every minute
```

### Option 2: External Cron Service
Use services like:
- Vercel Cron Jobs
- GitHub Actions
- Cron-job.org

Call endpoint every minute:
```
GET https://your-app.com/api/cron/auto-start-battles
```

## Testing

### Test Scenarios

1. **Immediate Start (Now)**
   - Select "Mulai Sekarang"
   - Battle status = 'active' immediately
   - No notifications sent

2. **10 Minute Schedule**
   - Select "10 Menit dari Sekarang"
   - Battle status = 'scheduled'
   - scheduled_start_at = NOW() + 10 minutes
   - All members get notification
   - After 10 minutes, auto-starts

3. **Custom Schedule**
   - Select "Custom"
   - Pick date: Tomorrow
   - Pick time: 15:00
   - Battle scheduled for tomorrow 15:00
   - Members get notification with scheduled time

4. **Late Join**
   - Battle starts at 15:00 (15 min limit)
   - Member joins at 15:05
   - Member has only 10 minutes left
   - Can still complete and compete

5. **Solo Battle**
   - Only 1 member joins
   - Battle still runs
   - Member completes alone
   - Gets rank #1 (easy win!)

## Next Steps

### Immediate
1. ✅ Run migration 015
2. 🔄 Set up cron job for auto-start
3. 🔄 Test scheduled battles
4. 🔄 Test notifications

### Future Enhancements
1. 🔄 In-app notification UI (bell icon with badge)
2. 🔄 Email notifications (optional)
3. 🔄 Push notifications (mobile)
4. 🔄 Battle cancellation by leader
5. 🔄 Reschedule battle
6. 🔄 Minimum participants option
7. 🔄 Auto-cancel if no one joins

## Migration Instructions

### Step 1: Run Migration 015
```sql
-- In Supabase SQL Editor
-- Run: database/migrations/015_add_scheduled_battle.sql
```

### Step 2: Set Up Cron Job
Choose one of the cron options above and set it up.

### Step 3: Test
1. Create squad
2. Schedule battle for 2 minutes from now
3. Wait and watch auto-start
4. Check notifications table

## Notes

- Countdown timer updates every second for real-time feel
- Late join is allowed but disadvantageous (discipline training!)
- Battle runs even with 1 participant (easy win motivation)
- "Be there or beware" message emphasizes discipline
- No email to reduce spam - in-app only
- Cron job is critical - without it, battles won't auto-start!
