# 👥 Create Demo Accounts

## Overview
Script untuk membuat 40 akun demo:
- **30 akun siswa** (@siswa.id)
- **10 akun guru** (@guru.id)

---

## 🚀 Quick Start (Recommended)

### Option 1: Menggunakan Script (Otomatis)

#### Step 1: Setup Environment Variable

Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ADD THIS
```

**Cara mendapatkan Service Role Key:**
1. Buka Supabase Dashboard
2. Go to: Settings → API
3. Copy **service_role** key (bukan anon key!)

#### Step 2: Install tsx (jika belum)

```bash
npm install -D tsx
```

#### Step 3: Run Script

```bash
npx tsx scripts/create-demo-users.ts
```

#### Output:
```
========================================
Creating Demo Accounts
========================================

📚 Creating Student Accounts...
✅ Created student: andi@siswa.id
✅ Created student: bagus@siswa.id
...

👨‍🏫 Creating Teacher Accounts...
✅ Created teacher: bambang@guru.id
✅ Created teacher: jaya@guru.id
...

========================================
Summary
========================================
✅ Successfully created: 40 accounts
❌ Failed: 0 accounts

🔑 Default Password: demo123456
```

---

## 📋 Account List

### Student Accounts (30):
```
1. andi@siswa.id
2. bagus@siswa.id
3. budi@siswa.id
4. candra@siswa.id
5. dedi@siswa.id
6. dewi@siswa.id
7. eka@siswa.id
8. fitri@siswa.id
9. galih@siswa.id
10. hana@siswa.id
11. indra@siswa.id
12. joko@siswa.id
13. kiki@siswa.id
14. lina@siswa.id
15. maya@siswa.id
16. nanda@siswa.id
17. putri@siswa.id
18. rani@siswa.id
19. riski@siswa.id
20. sari@siswa.id
21. tiara@siswa.id
22. tono@siswa.id
23. ujang@siswa.id
24. vera@siswa.id
25. wawan@siswa.id
26. yanti@siswa.id
27. yudi@siswa.id
28. zaki@siswa.id
29. zahra@siswa.id
30. riko@siswa.id
```

### Teacher Accounts (10):
```
1. bambang@guru.id
2. jaya@guru.id
3. agus@guru.id
4. rudi@guru.id
5. surya@guru.id
6. dewi@guru.id
7. fitri@guru.id
8. sari@guru.id
9. ratna@guru.id
10. lina@guru.id
```

### Default Password:
```
demo123456
```

---

## 🔧 Option 2: Manual Creation (Supabase Dashboard)

Jika tidak ingin menggunakan script, bisa create manual:

### Step 1: Buka Supabase Dashboard
1. Go to: Authentication → Users
2. Click "Add User"

### Step 2: Create Each User
For each account:
- **Email**: [name]@siswa.id atau [name]@guru.id
- **Password**: demo123456
- **Auto Confirm Email**: ✅ Yes

### Step 3: Set Role
After user created:
1. Go to: Table Editor → users
2. Find the user by email
3. Set `role` column:
   - `student` untuk @siswa.id
   - `teacher` untuk @guru.id

**Note:** Manual creation memakan waktu ~30-60 menit untuk 40 accounts.

---

## 🔍 Verification

### Check Created Accounts

Run di Supabase SQL Editor:

```sql
-- Count accounts by role
SELECT 
  role,
  COUNT(*) as total
FROM users 
WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
GROUP BY role;

-- Expected output:
-- role     | total
-- ---------|------
-- student  | 30
-- teacher  | 10
```

### List All Demo Accounts

```sql
SELECT 
  email, 
  role, 
  full_name,
  created_at 
FROM users 
WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
ORDER BY role, email;
```

---

## 🧪 Testing

### Test Login (Student):
- Email: `andi@siswa.id`
- Password: `demo123456`

### Test Login (Teacher):
- Email: `bambang@guru.id`
- Password: `demo123456`

### Test Squad Battle:
1. Login sebagai `andi@siswa.id`
2. Create squad
3. Copy invite code
4. Login sebagai `bagus@siswa.id`
5. Join squad dengan invite code
6. Start battle!

---

## 🔒 Security Notes

### Service Role Key:
- **NEVER commit** to git
- **NEVER expose** to client-side
- Only use in server-side scripts
- Keep in `.env.local` (gitignored)

### Demo Accounts:
- For **development/testing** only
- Use **different passwords** in production
- Consider **deleting** demo accounts before production launch

---

## 🆘 Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"
- Add service role key to `.env.local`
- Get from: Supabase Dashboard → Settings → API

### Error: "User already exists"
- Account sudah dibuat sebelumnya
- Skip atau delete existing account first

### Error: "Rate limit exceeded"
- Script sudah include delay (100ms per user)
- If still error, increase delay in script

### Script tidak jalan:
```bash
# Install tsx
npm install -D tsx

# Run with full path
npx tsx ./scripts/create-demo-users.ts
```

---

## 📊 Summary

**Total Accounts:** 40
- 30 Students (@siswa.id)
- 10 Teachers (@guru.id)

**Default Password:** demo123456

**Creation Methods:**
1. ✅ **Script** (Recommended) - 2 minutes
2. ⏱️ **Manual** - 30-60 minutes

**Files:**
- `scripts/create-demo-users.ts` - Creation script
- `database/migrations/009_create_demo_accounts.sql` - Account list

---

## ✅ Checklist

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Install tsx: `npm install -D tsx`
- [ ] Run script: `npx tsx scripts/create-demo-users.ts`
- [ ] Verify: Check Supabase Dashboard → Authentication → Users
- [ ] Test login: Try `andi@siswa.id` / `demo123456`
- [ ] Test Squad Battle with multiple accounts
- [ ] Done! 🎉

---

**Selamat! 40 akun demo siap digunakan untuk testing!** 🚀
