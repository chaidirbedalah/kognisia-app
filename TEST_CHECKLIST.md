# Squad Battle Test Checklist ✅

## Quick Test (5 minutes)

### 1. Squad List
- [ ] Login as `andi@siswa.id` / `demo123456`
- [ ] Go to Squad Battle page
- [ ] Verify squads load with member counts
- [ ] Check terminal: Should see `getUserSquads final squads` with data

### 2. View Squad Details
- [ ] Click "View Details" on any squad
- [ ] Should navigate to squad detail page
- [ ] Should show squad name, invite code, members
- [ ] Check terminal: Should see ✅ success messages

### 3. Leave Squad
- [ ] Click "Leave Squad" button (trash icon)
- [ ] Confirm the action
- [ ] Should return to squad list
- [ ] Squad should be removed from list
- [ ] Check terminal: Should see ✅ success messages

### 4. Create New Squad
- [ ] Click "Create Squad"
- [ ] Enter name and max members
- [ ] Should show invite code
- [ ] Click "Go to Squad & Start Battle"
- [ ] Should navigate to squad detail page

## Full Test (15 minutes)

### 5. Join Squad (Second User)
- [ ] Login as `bagus@siswa.id` / `demo123456`
- [ ] Go to Squad Battle
- [ ] Click "Join Squad"
- [ ] Enter invite code from step 4
- [ ] Should join successfully

### 6. Start Battle (Leader Only)
- [ ] Login back as `andi@siswa.id`
- [ ] Go to squad detail page
- [ ] Click "Start Battle"
- [ ] Select battle type (Subtest or Mini Try Out)
- [ ] Set schedule (10 min, 30 min, or custom)
- [ ] Should create scheduled battle

### 7. Battle Flow (When Time Arrives)
- [ ] Battle auto-starts at scheduled time
- [ ] Both users can see questions
- [ ] Submit answers
- [ ] View live leaderboard
- [ ] Complete battle
- [ ] See final results

## Expected Terminal Output

### Success Indicators:
```
=== Squad Details API Called ===
✅ Auth header present
✅ User authenticated: [user-id]
✅ Squad details fetched successfully
```

### No Errors:
- ❌ No "params is a Promise" errors
- ❌ No "Invalid squad ID" errors
- ❌ No 500 errors

## If You See Errors

1. **Copy the full terminal output**
2. **Note which step failed**
3. **Check browser console (F12) for client-side errors**
4. **Share the error details**

## Quick Verification

Run this in browser console (F12):
```javascript
// Test squad list API
const session = await (await fetch('/api/auth/session')).json()
const response = await fetch('/api/squad/list', {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
})
const data = await response.json()
console.log('Squads:', data)
```

Should return squads with `id`, `name`, `invite_code`, `member_count` fields.

---

## Status After Testing

- [ ] All tests passed ✅
- [ ] Some tests failed ❌ (share details)
- [ ] Ready to continue with more features 🚀
