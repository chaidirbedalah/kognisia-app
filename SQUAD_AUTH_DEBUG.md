# Squad Battle Authentication Debug Guide

## Changes Made

### 1. Enhanced `getUserSquads()` Function
**File**: `src/lib/squad-api.ts`

**Changes**:
- Added `!inner` join to ensure squad data is always present
- Fetches member count for each squad
- Added detailed JSON logging at each step
- Filters out any null squads

**Why**: The squad list was loading but might not have had all required fields (like `member_count`)

### 2. Enhanced API Logging
**Files**: 
- `src/app/api/squad/[id]/route.ts` (View Details)
- `src/app/api/squad/[id]/leave/route.ts` (Leave Squad)

**Changes**:
- Added step-by-step logging with ✅/❌ indicators
- Logs all parameters and validation checks
- Shows full error stack traces
- Validates squad ID and user ID

**Why**: To identify exactly where the 500 errors are occurring

## How to Test

### Step 1: Restart Dev Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
cd kognisia-app
npm run dev
```

### Step 2: Test Squad List
1. Login as a student (e.g., `andi@siswa.id` / `demo123456`)
2. Go to Squad Battle page
3. Check browser console (F12) for any errors
4. Check terminal for logs showing squad data

### Step 3: Test View Details
1. Click "View Details" on any squad
2. **Check the terminal** - you should see detailed logs like:
   ```
   === Squad Details API Called ===
   Params: { id: '...' }
   ✅ Auth header present
   ✅ User authenticated: ...
   📡 Calling getSquadDetails...
   ✅ Squad details fetched successfully
   ```
3. If there's an error, the terminal will show:
   ```
   ❌ ERROR in squad details API:
   Error message: ...
   Error stack: ...
   ```

### Step 4: Test Leave Squad
1. Click the "Leave Squad" button (trash icon)
2. Confirm the action
3. **Check the terminal** for similar detailed logs
4. If there's an error, share the terminal output

## What to Look For

### Success Indicators
- ✅ Auth header present
- ✅ User authenticated
- ✅ Squad details fetched successfully
- Squad list shows correct member counts

### Error Indicators
- ❌ No authorization header
- ❌ Auth failed
- ❌ Invalid squad ID
- ❌ ERROR in squad details API

## Common Issues & Solutions

### Issue: "Invalid squad ID"
**Cause**: Squad object from list doesn't have `id` field
**Solution**: Check terminal logs for `getUserSquads final squads` - verify each squad has an `id` field

### Issue: "Unauthorized"
**Cause**: Session token not being passed correctly
**Solution**: Check browser console for session data, verify token is present

### Issue: Database error
**Cause**: RLS policies or missing permissions
**Solution**: Check terminal for Supabase error details, may need to update RLS policies

## Next Steps

1. **Test the flow** and check terminal logs
2. **Share the terminal output** if you see any ❌ errors
3. We'll fix the root cause based on the actual error messages

The detailed logging will help us identify exactly where the issue is occurring!
