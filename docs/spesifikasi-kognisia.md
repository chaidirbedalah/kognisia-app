# Spesifikasi Fitur Kognisia: Manajemen Kelas, Penugasan, Umpan Balik, Analitik, dan Optimasi Backend

## Tujuan
- Menyediakan dokumen acuan implementasi hasil analisa dan rekomendasi untuk meningkatkan pengalaman guru dan siswa.
- Menghadirkan manajemen kelas, penugasan/kuis, umpan balik guru, analitik tren kelas, serta optimasi performa dan konsistensi autentikasi.

## Ruang Lingkup
- Fitur guru: Manajemen kelas, penugasan/kuis, umpan balik, analitik kelas.
- Fitur siswa: Halaman penugasan, pengumpulan, melihat umpan balik.
- Backend/API: Endpoint agregasi progres per kelas (anti N+1), standar auth, caching.
- Data: Penambahan skema tabel dan view untuk tugas, feedback, dan metrik kelas.

## Kondisi Saat Ini (Ringkas)
- Autentikasi dan data memakai Supabase client/SSR; tabel aktif: `users`, `enrollments`, `classes`, `student_progress`.
- Dashboard guru menampilkan ringkasan lintas kelas, metrik utama, filter, sort, dan detail siswa per topik/jawaban terbaru.
- Fitur siswa lengkap untuk daily/mini/tryout; progres tersimpan di `student_progress`.
- Kekosongan: CRUD kelas, penugasan/kuis terjadwal, umpan balik guru, analitik tren lintas kelas; ada N+1 di pengambilan progres.

## Kebutuhan Fungsional
### Manajemen Kelas
- Buat/Edit/Hapus kelas; arsip kelas.
- Undang siswa (kode/tautan), daftar/pindah siswa antar kelas.
- Assign/ubah guru penanggung jawab.

### Penugasan/Kuis
- Buat penugasan per kelas/subtest, tipe: latihan, kuis, ujian mini.
- Parameter: judul, deskripsi, subtest_code, daftar topik, jumlah soal, batas waktu, window tanggal mulai/selesai, pengingat.
- Distribusi ke satu/lebih kelas.
- Siswa: melihat daftar tugas, memulai, mengumpulkan, melihat skor.
- Auto-grading (pilihan ganda), integrasi ke `student_progress` untuk jejak butir.

### Umpan Balik Guru
- Tambah komentar per siswa: per tugas, per topik, atau umum.
- Rekomendasi materi/latihan lanjutan (tautan internal/eksternal, subtest/topik).
- Status intervensi (flag: perlu perhatian, ditindaklanjuti, selesai) dan log aktivitas.

### Analitik Kelas
- Tren mingguan/bulanan: jumlah aktif 7 hari, top performers, akurasi rata-rata, jumlah soal, distribusi status.
- Heatmap topik lemah/kuat; drill-down ke siswa.
- Export CSV (kelas, tugas, metrik).

### Peningkatan UX (Guru)
- Filter cepat dengan hitungan, sort mode (prioritas, terbaru, akurasi rendah) [sudah tersedia di dashboard guru].
- Preferensi filter/sort disimpan di `localStorage` [sudah tersedia].

## Kebutuhan Non-Fungsional
- Konsistensi Auth: Standar `Authorization: Bearer <token>` untuk semua API; validasi seragam.
- Kinerja: Hindari N+1; gunakan agregasi per kelas; tambahkan caching (in-memory SSR/edge atau per-user cache TTL pendek pada agregasi berat).
- Keamanan: Batasi akses guru ke kelas yang dia pegang; audit logging perubahan kelas/tugas/feedback.
- Observabilitas: Logging terstruktur untuk endpoint agregasi dan tugas; metrik latency, error rate.

## Desain Data (Supabase/Postgres)
### Tabel Baru
- `class_invitations` (id, class_id, code, expires_at, created_by, status)
- `class_teachers` (id, class_id, user_id, role: lead/co)
- `assignments` (id, title, description, subtest_code, topic_ids[], num_questions, start_at, due_at, time_limit_sec, created_by)
- `assignment_classes` (id, assignment_id, class_id)
- `assignment_submissions` (id, assignment_id, student_id, started_at, submitted_at, score, accuracy, status)
- `teacher_feedback` (id, student_id, class_id, assignment_id?, topic_id?, comment, recommendation, status, created_by, created_at)

### View/Materialized View
- `v_class_student_metrics` (per kelas dan per siswa): total_questions, correct, accuracy, status, last_activity_ts, recent_active flag, top_performer flag.
- `v_class_trends_daily` (per kelas, per hari): active_count, avg_accuracy, total_questions, struggling_count.

### Indeks
- Indeks pada `student_progress(student_id, created_at)`, `assignment_submissions(student_id, assignment_id)`, `teacher_feedback(student_id, created_at)`.

## API Desain
### Auth Standar
- Semua route menerima `Authorization: Bearer <token>`; middleware validasi user dan peran.

### Kelas
- `POST /api/classes` (create), `PATCH /api/classes/:id` (update), `DELETE /api/classes/:id` (soft-delete).
- `GET /api/classes/:id/students` (daftar siswa).
- `POST /api/classes/:id/invitations` (buat kode undangan), `POST /api/classes/:id/transfer` (pindah siswa).

### Penugasan
- `POST /api/assignments` (buat penugasan), `GET /api/assignments?class_id=...` (list), `GET /api/assignments/:id` (detail).
- `POST /api/assignments/:id/assign` (distribusi ke kelas), `POST /api/assignments/:id/start`, `POST /api/assignments/:id/submit` (auto-grade, simpan submission).

### Umpan Balik
- `POST /api/feedback` (buat), `GET /api/feedback?student_id=...&class_id=...` (list), `PATCH /api/feedback/:id` (ubah status).

### Agregasi & Analitik
- `GET /api/classes/:id/metrics` (view/RPC seluruh siswa satu kelas; anti N+1).
- `GET /api/classes/:id/trends?from=...&to=...` (tren harian/mingguan dari materialized view).
- `GET /api/classes/:id/export.csv` (export metrik).

## UI/UX Implementasi
### Guru
- Halaman Manajemen Kelas: daftar kelas, CRUD, undangan, daftar siswa, assign guru.
- Halaman Penugasan: buat/edit, distribusi ke kelas, monitor status dan skor; tabel submissions.
- Halaman Detail Siswa: tab baru Umpan Balik (form komentar, rekomendasi, status); timeline aktivitas.
- Halaman Analitik Kelas: grafik tren (aktif 7 hari, akurasi rata-rata, distribusi status), heatmap topik, export.

### Siswa
- Halaman Penugasan: daftar tugas, status, due, action start/continue/submit.
- Halaman Hasil Penugasan: skor, akurasi, umpan balik guru.

## Alur Utama
- Guru membuat kelas → undang siswa → distribusi penugasan → siswa mengerjakan → auto-grade → guru lihat hasil dan beri umpan balik → analitik menangkap tren.

## Optimasi Performa
- Ganti loop per-enrollment dengan satu query agregasi: view/RPC `v_class_student_metrics` untuk seluruh siswa per kelas.
- Caching pada endpoint agregasi (TTL 30–120 detik) dan memoization klien untuk widget ringkasan.

## Migrasi & Rollout
- Tambah tabel baru dengan migrasi terkontrol; isi data awal jika diperlukan.
- Deploy endpoint agregasi terlebih dahulu; migrasikan dashboard guru memakai API baru.
- Rilis bertahap: (1) Manajemen Kelas, (2) Penugasan, (3) Umpan Balik, (4) Analitik Tren.

## Risiko & Mitigasi
- Beban query besar: gunakan indeks dan view/materialized; ukur dan optimasi.
- Inkonsistensi auth: audit dan standarisasi header Bearer; tambahkan middleware.
- Perubahan skema: versi migrasi, kompatibilitas mundur untuk halaman lama.

## Keberhasilan & Metrik
- Waktu muat dashboard guru turun ≥50% (agregasi tunggal).
- Adopsi penugasan: ≥60% kelas menggunakan tugas per minggu.
- Umpan balik: ≥70% siswa struggling menerima intervensi dalam 7 hari.
- Stabilitas API: error rate <1%, p95 latency <300ms untuk agregasi 50 siswa.

## Next Steps
- Implementasi dimulai dari endpoint agregasi dan refactor dashboard guru.
- Lanjut modul Manajemen Kelas, kemudian Penugasan, Umpan Balik, dan Analitik.\n
