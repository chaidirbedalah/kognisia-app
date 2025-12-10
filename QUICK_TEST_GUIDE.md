# Quick Test Guide - Squad Battle Fix

## 🚀 Quick Start

### 1. Restart Dev Server
```bash
# Press Ctrl+C to stop current server
# Then restart:
npm run dev
```

### 2. Test Squad Features
1. Login: `andi@siswa.id` / `demo123456`
2. Go to Squad Battle page
3. Try these actions:
   - ✅ Create new squad
   - ✅ View squad details
   - ✅ Leave squad
   - ✅ Join squad with invite code

### 3. Watch Terminal
Look for these indicators:

**Success** ✅:
```
=== Squad Details API Called ===
✅ Auth header present
✅ User authenticated
✅ Squad details fetched successfully
```

**Error** ❌:
```
❌ ERROR in squad details API:
Error message: [details here]
```

## 🔍 What to Check

### Browser Console (F12)
- No red errors
- Squad list loads
- Squad objects have `id` field

### Terminal
- Clear ✅/❌ indicators
- Full error details if something fails
- Step-by-step execution logs

## 📊 Test Script (Optional)
```bash
npx tsx scripts/test-squad-data.ts
```

This verifies:
- Squad data structure
- Query patterns
- Member counts
- Data mapping

## 🐛 If You See Errors

1. **Copy the terminal output** (especially lines with ❌)
2. **Share the error message** and stack trace
3. **Note which action failed**:
   - Creating squad?
   - Viewing details?
   - Leaving squad?

## ✨ What Was Fixed

1. **Better data fetching** - Uses `!inner` join for reliable squad data
2. **Member counts** - Squad list now shows correct member counts
3. **Detailed logging** - Easy to see exactly where errors occur
4. **Error handling** - Full stack traces for debugging

## 📝 Expected Results

After the fix:
- ✅ Squad list loads with member counts
- ✅ View Details opens squad page
- ✅ Leave Squad removes you from squad
- ✅ All actions work smoothly

## 🎯 Next Steps

1. Test the basic flow
2. If it works → Test scheduled battles
3. If errors → Share terminal output
4. Continue with Squad Battle features

---

**Need help?** Share your terminal output and I'll help debug!
