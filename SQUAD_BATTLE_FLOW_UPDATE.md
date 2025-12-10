# Squad Battle Flow Update - Scheduled Battles

## New Flow

### 1. Leader Creates Battle (Not "Start")
- Leader clicks **"Create Battle"** button
- Pop up shows:
  - Materi Battle (Subtest/Mini Try Out)
  - Pilih Subtest & Jumlah Soal
  - Tingkat Kesulitan
  - **Waktu Mulai Battle** (10 min, 30 min, custom)
- Leader clicks "Create Battle"
- Battle dijadwalkan (status: `scheduled`)

### 2. Share Invite Code + Battle Info
- Invite code otomatis menyertakan info:
  - Materi battle (subtest, jumlah soal, tingkat kesulitan)
  - Waktu battle (tanggal & jam lengkap)
- Member lain bisa lihat info sebelum join

### 3. Members Join Squad
- Member join menggunakan invite code
- Bisa lihat scheduled battles di squad detail page
- Info lengkap: materi, waktu, countdown

### 4. Enter Waiting Room
- Semua member (termasuk leader) klik **"Enter Room"**
- Masuk waiting room dengan countdown
- Menunggu battle auto-start

### 5. Battle Auto-Start
- Battle mulai tepat pada waktu yang ditentukan
- Status berubah: `scheduled` → `active`
- Semua member di waiting room otomatis redirect ke battle page
- Soal pertama muncul, mulai menjawab

### 6. Late Joiners
- Member yang terlambat masih bisa join
- Tapi waktu terus berjalan (disadvantage)
- Melatih kedisiplinan

## Components Created

### 1. ScheduledBattlesList Component
**File**: `src/components/squad/ScheduledBattlesList.tsx`

**Features**:
- Shows all scheduled and active battles
- Real-time countdown timer
- Battle info: materi, waktu, tingkat kesulitan
- "Enter Room" button for scheduled battles
- "Join Now!" button for active battles

### 2. Battle Waiting Room Page
**File**: `src/app/squad/battle/[id]/waiting/page.tsx`

**Features**:
- Large countdown timer
- Battle details (materi, tingkat kesulitan)
- Participant count
- Auto-redirect when battle starts
- Instructions for participants

## API Endpoints Created

### 1. Get Squad Battles
**Endpoint**: `GET /api/squad/[id]/battles`

**Returns**:
```json
{
  "success": true,
  "battles": [
    {
      "id": "uuid",
      "battle_type": "subtest",
      "subtest_code": "PPU",
      "subtest_name": "Pengetahuan Pemahaman Umum",
      "question_count": 10,
      "difficulty": "medium",
      "scheduled_start_at": "2025-12-10T10:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

### 2. Get Battle Status
**Endpoint**: `GET /api/squad/battle/[id]/status`

**Returns**:
```json
{
  "success": true,
  "status": "scheduled",
  "scheduled_start_at": "2025-12-10T10:00:00Z"
}
```

### 3. Get Battle Info (Updated)
**Endpoint**: `GET /api/squad/battle/[id]`

**Returns**:
```json
{
  "success": true,
  "battle": {
    "id": "uuid",
    "battle_type": "subtest",
    "subtest_name": "Pengetahuan Pemahaman Umum",
    "question_count": 10,
    "difficulty": "medium",
    "scheduled_start_at": "2025-12-10T10:00:00Z",
    "status": "scheduled",
    "squad_id": "uuid",
    "squad_name": "Squad 1"
  },
  "participant_count": 5,
  "questions": []  // Empty if scheduled, filled if active
}
```

## UI Changes

### Squad Detail Page
**Before**:
- Button: "Start Battle" (leader only)

**After**:
- Button: "Create Battle" (leader only)
- New section: "Scheduled Battles" list
- Shows all upcoming and active battles
- Each battle has "Enter Room" or "Join Now!" button

### Battle Creation Dialog
**Before**:
- Title: "Start Squad Battle"
- Button: "Start Battle"

**After**:
- Title: "Create Squad Battle"
- Button: "Create Battle"
- After creation: Shows success message with scheduled time
- Returns to squad detail page (not battle page)

## Database Schema (Already Exists)

The `squad_battles` table already has:
- `scheduled_start_at` - Waktu battle dimulai
- `status` - 'scheduled', 'active', 'completed'
- `battle_type` - 'subtest' or 'mini_tryout'
- `subtest_code` - Kode subtest (if subtest type)
- `question_count` - Jumlah soal (if subtest type)

## Auto-Start Mechanism

The Supabase Edge Function (already deployed) runs every minute:
1. Checks for battles with `status = 'scheduled'`
2. Checks if `scheduled_start_at <= NOW()`
3. Updates `status = 'active'`
4. Sets `started_at = NOW()`

## Testing Flow

1. **Create Battle**:
   - Login as leader
   - Go to squad detail
   - Click "Create Battle"
   - Select materi, waktu (10 min recommended for testing)
   - Click "Create Battle"

2. **View Scheduled Battle**:
   - Should see battle in "Scheduled Battles" section
   - Shows countdown timer
   - Shows battle info

3. **Enter Waiting Room**:
   - Click "Enter Room"
   - See countdown and battle details
   - Wait for auto-start

4. **Battle Starts**:
   - At scheduled time, status changes to 'active'
   - Waiting room auto-redirects to battle page
   - Questions appear, start answering

## Files Modified

1. `src/app/squad/[id]/page.tsx` - Added ScheduledBattlesList
2. `src/components/squad/StartBattleDialog.tsx` - Changed to "Create Battle"
3. `src/app/api/squad/battle/start/route.ts` - Accept scheduled_start_at
4. `src/app/api/squad/battle/[id]/route.ts` - Return battle info with squad name

## Files Created

1. `src/components/squad/ScheduledBattlesList.tsx`
2. `src/app/squad/battle/[id]/waiting/page.tsx`
3. `src/app/api/squad/[id]/battles/route.ts`
4. `src/app/api/squad/battle/[id]/status/route.ts`

## Status

✅ Flow updated to match requirements
✅ Create Battle (not Start Battle)
✅ Scheduled battles list with countdown
✅ Waiting room for participants
✅ Auto-start mechanism (already deployed)
✅ Battle info shared with invite code

Ready to test! 🚀
