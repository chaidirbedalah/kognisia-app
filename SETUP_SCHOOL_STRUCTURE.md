# 🏫 Setup School Structure

## Overview
Migration untuk setup struktur sekolah lengkap dengan kelas dan enrollment.

---

## 📊 Structure

### School:
- **SMA Kognisia**
  - Address: Jl. Pendidikan No. 123, Jakarta
  - Phone: 021-12345678
  - Email: info@kognisia.id

### Classes (3):
1. **12 IPA 1** - 10 students, 3 teachers
2. **12 IPS 1** - 10 students, 3 teachers
3. **12 Bahasa 1** - 10 students, 3 teachers

### Staff:
- **9 Teachers** (3 per class)
- **1 Principal** (no class assignment)

---

## 🚀 Quick Start

### Step 1: Run Migration

**IMPORTANT:** Use the version that uses EXISTING school:

Copy & paste file ini di Supabase SQL Editor:
```
database/migrations/010_setup_classes_use_existing_school.sql
```

**NOT** `010_setup_school_and_classes.sql` (that creates a new school)

### Step 2: Verify

Setelah run, Anda akan melihat output:
```
========================================
School Setup Summary
========================================

🏫 School: SMA Kognisia

📚 Classes:
  - 12 IPA 1: 10 students, 3 teachers
  - 12 IPS 1: 10 students, 3 teachers
  - 12 Bahasa 1: 10 students, 3 teachers

👥 Staff:
  - Teachers: 9
  - Principal: 1

✅ Total: 30 students + 9 teachers + 1 principal
```

---

## 📋 Student Distribution

### 12 IPA 1 (10 students):
Students 1-10 dari list (sorted by email):
- andi@siswa.id
- bagus@siswa.id
- budi@siswa.id
- candra@siswa.id
- dedi@siswa.id
- dewi@siswa.id
- eka@siswa.id
- fitri@siswa.id
- galih@siswa.id
- hana@siswa.id

### 12 IPS 1 (10 students):
Students 11-20:
- indra@siswa.id
- joko@siswa.id
- kiki@siswa.id
- lina@siswa.id
- maya@siswa.id
- nanda@siswa.id
- putri@siswa.id
- rani@siswa.id
- riski@siswa.id
- sari@siswa.id

### 12 Bahasa 1 (10 students):
Students 21-30:
- tiara@siswa.id
- tono@siswa.id
- ujang@siswa.id
- vera@siswa.id
- wawan@siswa.id
- yanti@siswa.id
- yudi@siswa.id
- zaki@siswa.id
- zahra@siswa.id
- riko@siswa.id

---

## 👨‍🏫 Teacher Assignment

### 12 IPA 1 (3 teachers):
- bambang@guru.id
- jaya@guru.id
- agus@guru.id

### 12 IPS 1 (3 teachers):
- rudi@guru.id
- surya@guru.id
- dewi@guru.id

### 12 Bahasa 1 (3 teachers):
- fitri@guru.id
- sari@guru.id
- ratna@guru.id

### Principal (1):
- lina@guru.id (no class assignment)

---

## 🔍 Verification Queries

### Check School:
```sql
SELECT * FROM schools WHERE name = 'SMA Kognisia';
```

### Check Classes:
```sql
SELECT * FROM classes WHERE school_id = 'a0000000-0000-0000-0000-000000000001';
```

### Check Students per Class:
```sql
SELECT 
  c.name as class_name,
  COUNT(e.student_id) as student_count
FROM classes c
LEFT JOIN enrollments e ON c.id = e.class_id
LEFT JOIN users u ON e.student_id = u.id AND u.role = 'student'
WHERE c.school_id = 'a0000000-0000-0000-0000-000000000001'
GROUP BY c.name
ORDER BY c.name;
```

### Check Teachers per Class:
```sql
SELECT 
  c.name as class_name,
  COUNT(e.student_id) as teacher_count
FROM classes c
LEFT JOIN enrollments e ON c.id = e.class_id
LEFT JOIN users u ON e.student_id = u.id AND u.role = 'teacher'
WHERE c.school_id = 'a0000000-0000-0000-0000-000000000001'
GROUP BY c.name
ORDER BY c.name;
```

### List All Enrollments:
```sql
SELECT 
  u.email,
  u.role,
  c.name as class_name
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN classes c ON e.class_id = c.id
WHERE c.school_id = 'a0000000-0000-0000-0000-000000000001'
ORDER BY c.name, u.role, u.email;
```

### Check Principal:
```sql
SELECT email, role, full_name 
FROM users 
WHERE role = 'principal';
```

---

## 🎯 What This Migration Does:

1. **Creates School**
   - Inserts SMA Kognisia with complete info
   - Uses fixed UUID for consistency

2. **Creates 3 Classes**
   - 12 IPA 1, 12 IPS 1, 12 Bahasa 1
   - All grade 12, academic year 2024/2025
   - Each with fixed UUID

3. **Enrolls Students**
   - Distributes 30 students evenly (~10 per class)
   - Based on alphabetical order of email
   - Creates enrollment records

4. **Assigns Teachers**
   - 3 teachers per class (9 total)
   - Based on alphabetical order
   - Creates enrollment records

5. **Sets Principal**
   - Last teacher (lina@guru.id) becomes principal
   - Updates role in users table
   - No class assignment

---

## 📊 Database Structure

### Tables Used:
- `schools` - School information
- `classes` - Class information
- `enrollments` - Student/Teacher to Class mapping
- `users` - User information (role updated for principal)

### Relationships:
```
schools (1) ──< classes (3)
                  │
                  ├──< enrollments (students: 30)
                  └──< enrollments (teachers: 9)
```

---

## 🧪 Testing

### Test as Student:
1. Login: `andi@siswa.id` / `demo123456`
2. Should see: Class 12 IPA 1
3. Should see: 3 teachers in class

### Test as Teacher:
1. Login: `bambang@guru.id` / `demo123456`
2. Should see: Class 12 IPA 1
3. Should see: 10 students in class

### Test as Principal:
1. Login: `lina@guru.id` / `demo123456`
2. Should see: All 3 classes
3. Should see: All 30 students + 9 teachers

---

## ⚠️ Important Notes:

### Fixed UUIDs:
Migration uses fixed UUIDs for consistency:
- School: `a0000000-0000-0000-0000-000000000001`
- Class 12 IPA 1: `c0000000-0000-0000-0000-000000000001`
- Class 12 IPS 1: `c0000000-0000-0000-0000-000000000002`
- Class 12 Bahasa 1: `c0000000-0000-0000-0000-000000000003`

### Idempotent:
Migration can be run multiple times safely:
- Uses `ON CONFLICT DO UPDATE` for schools/classes
- Uses `ON CONFLICT DO NOTHING` for enrollments

### Distribution:
Students distributed based on alphabetical order:
- First 10 → 12 IPA 1
- Next 10 → 12 IPS 1
- Last 10 → 12 Bahasa 1

---

## ✅ Checklist

- [ ] Run migration 010 in Supabase SQL Editor
- [ ] Verify school created
- [ ] Verify 3 classes created
- [ ] Verify 30 students enrolled
- [ ] Verify 9 teachers assigned
- [ ] Verify 1 principal set
- [ ] Test login as student
- [ ] Test login as teacher
- [ ] Test login as principal
- [ ] Done! 🎉

---

**Setelah migration, struktur sekolah lengkap siap digunakan!** 🏫
