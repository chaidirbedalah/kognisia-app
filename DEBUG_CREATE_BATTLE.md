# Debug Create Battle Dialog

## Issue
Pop up "Create Battle" tidak muncul atau tidak menampilkan form untuk isi detail battle.

## Changes Made

### 1. Added State Reset on Dialog Open
**File**: `src/components/squad/StartBattleDialog.tsx`

Added reset logic in useEffect:
```typescript
useEffect(() => {
  if (open) {
    // Reset state when dialog opens
    setBattleCreated(false)
    setBattleInfo(null)
    setCopied(false)
    setError('')
    loadSubtests()
  }
}, [open])
```

### 2. Added Console Logging for Debugging
Added console.log statements to track:
- Dialog render state
- Whether showing battle info screen or form
- Dialog open/close events

## Testing Steps

### 1. Open Browser Console (F12)
- Go to Console tab
- Clear console

### 2. Test Create Battle Flow
1. Login as leader (e.g., `andi@siswa.id` / `demo123456`)
2. Go to squad detail page
3. Click "Create Battle" button
4. **Check console** - Should see:
   ```
   StartBattleDialog render: { open: true, battleCreated: false, hasBattleInfo: false }
   Showing form
   ```

### 3. Expected Behavior

**If Form Shows** ✅:
- Dialog opens with title "Create Squad Battle"
- Shows form fields:
  - Materi Battle (Subtest/Mini Try Out)
  - Pilih Subtest dropdown
  - Jumlah Soal dropdown
  - Tingkat Kesulitan dropdown
  - Waktu Mulai Battle (10 min/30 min/custom)
- "Create Battle" button at bottom

**If Form Doesn't Show** ❌:
- Check console for errors
- Check console logs for state values
- Share the console output

### 4. Complete Flow Test

If form shows, test complete flow:

1. **Fill Form**:
   - Select "Pilih Subtest"
   - Choose a subtest (e.g., "Pengetahuan Pemahaman Umum")
   - Select question count (e.g., 10 soal)
   - Select difficulty (e.g., "Sedang")
   - Select schedule (e.g., "10 Menit dari Sekarang")

2. **Click "Create Battle"**

3. **Should See Battle Info Screen**:
   - Title: "Battle Created! 🎉"
   - Invite Code (large purple text)
   - Battle details:
     - Squad name
     - Materi
     - Tingkat Kesulitan
     - Waktu Battle
   - Button: "Copy to Share via WhatsApp"
   - Button: "Done"

4. **Click "Copy to Share via WhatsApp"**:
   - Should copy formatted message
   - Button changes to "Copied!"

5. **Click "Done"**:
   - Dialog closes
   - Should see battle in "Scheduled Battles" list

## Common Issues

### Issue 1: Dialog Doesn't Open
**Symptoms**: Nothing happens when clicking "Create Battle"

**Check**:
- Is user the leader? (only leaders can create battles)
- Are there at least 2 members? (button is disabled if < 2 members)
- Check browser console for JavaScript errors

### Issue 2: Form Doesn't Show
**Symptoms**: Dialog opens but shows blank or wrong content

**Check**:
- Console logs for state values
- Check if `battleCreated` is accidentally true
- Check if `battleInfo` has unexpected data

### Issue 3: Can't Select Subtest
**Symptoms**: Subtest dropdown is empty

**Check**:
- Console for "Error loading subtests"
- Check `/api/subtests` endpoint
- Verify subtests table has data

### Issue 4: Create Button Doesn't Work
**Symptoms**: Clicking "Create Battle" does nothing

**Check**:
- Console for API errors
- Check network tab for `/api/squad/battle/start` request
- Check if all required fields are filled

## Debug Console Commands

Run these in browser console (F12) to check state:

```javascript
// Check if dialog is open
document.querySelector('[role="dialog"]')

// Check dialog content
document.querySelector('[role="dialog"]')?.textContent

// Check for errors
console.error
```

## What to Share if Issue Persists

1. **Console output** (copy all logs)
2. **Network tab** (check for failed requests)
3. **Screenshot** of what you see
4. **User role** (leader or member?)
5. **Member count** in squad

---

## Expected Console Output (Success)

```
StartBattleDialog render: { open: false, battleCreated: false, hasBattleInfo: false }
StartBattleDialog render: { open: true, battleCreated: false, hasBattleInfo: false }
Showing form
[After clicking Create Battle]
StartBattleDialog render: { open: true, battleCreated: true, hasBattleInfo: true }
Showing battle info screen
```
