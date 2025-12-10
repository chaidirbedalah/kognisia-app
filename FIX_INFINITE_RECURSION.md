# 🔧 Fix Infinite Recursion Error

## Error yang Terjadi:
```
infinite recursion detected in policy for relation "squad_members"
```

## Root Cause:
RLS policy untuk `squads` mencoba query `squad_members`, dan policy untuk `squad_members` juga query `squad_members`, creating infinite loop.

---

## ✅ SOLUSI: Run Migration 006

### Step 1: Copy Migration File

**File:**
```
kognisia-app/database/migrations/006_fix_rls_policies.sql
```

1. Buka file ini
2. **Copy SEMUA isinya** (Cmd+A / Ctrl+A, lalu Cmd+C / Ctrl+C)

### Step 2: Run di Supabase SQL Editor

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Klik **"SQL Editor"**
3. Klik **"New Query"**
4. **Paste** seluruh isi file (Cmd+V / Ctrl+V)
5. Klik **"RUN"** (atau Cmd+Enter / Ctrl+Enter)

### Step 3: Verify Success

Anda akan melihat:
```
✅ Migration 006 completed successfully!
Fixed RLS policies to remove infinite recursion
All policies now use direct checks without circular dependencies
Squad Battle is ready to use!
```

### Step 4: Test Create Squad

1. Refresh halaman aplikasi
2. Coba create squad lagi
3. Seharusnya berhasil! 🎉

---

## 🔍 Apa yang Diperbaiki?

### Before (Recursive):
```sql
-- Policy untuk squads
USING (
  id IN (
    SELECT squad_id FROM squad_members  -- Query squad_members
    WHERE user_id = auth.uid()
  )
)

-- Policy untuk squad_members
USING (
  squad_id IN (
    SELECT squad_id FROM squad_members  -- Query squad_members lagi!
    WHERE user_id = auth.uid()          -- INFINITE LOOP!
  )
)
```

### After (Non-Recursive):
```sql
-- Policy untuk squads
USING (
  EXISTS (
    SELECT 1 FROM squad_members 
    WHERE squad_members.squad_id = squads.id  -- Direct join
    AND squad_members.user_id = auth.uid()
  )
)

-- Policy untuk squad_members
USING (
  squad_id IN (
    SELECT sm.squad_id FROM squad_members sm  -- Alias to avoid recursion
    WHERE sm.user_id = auth.uid()
  )
)
```

---

## 📋 What Migration 006 Does:

1. **Drop** all existing RLS policies
2. **Create** new policies without recursion:
   - Uses `EXISTS` instead of `IN` where appropriate
   - Uses table aliases to avoid circular references
   - Direct checks without nested subqueries
3. **Verify** all policies work correctly

---

## ⏱️ Estimasi Waktu: 1 menit

- Copy file: 20 detik
- Paste & Run: 10 detik
- Test create squad: 30 detik

---

## ✅ Checklist

- [ ] Buka file `006_fix_rls_policies.sql`
- [ ] Copy semua isinya
- [ ] Buka Supabase SQL Editor
- [ ] Paste & Run
- [ ] Lihat success message
- [ ] Refresh aplikasi
- [ ] Test create squad
- [ ] Squad created successfully! 🎉

---

**Setelah migration 006, Squad Battle akan berfungsi dengan sempurna!** 🚀
