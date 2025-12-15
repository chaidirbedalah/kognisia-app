'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

const NOW_TS = Date.now()

type Student = {
  id: string
  full_name: string
  email: string
  total_questions: number
  correct_answers: number
  accuracy: number
  last_activity: string
  last_activity_ts: number | null
  status: 'strong' | 'struggling' | 'not_started'
}

export default function TeacherDashboardPage() {
  type UserInfo = { id: string; email?: string | null }
  const [user, setUser] = useState<UserInfo | null>(null)
  type ClassInfo = { id: string; name: string }
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [className, setClassName] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  type SummaryCounts = { total: number; active: number; struggling: number; not_started: number; strong: number; avgAccuracy: number; avgQuestions: number; recentActive: number; topPerformers: number }
  const [classSummaries, setClassSummaries] = useState<Array<{ id: string; name: string; summary: SummaryCounts }>>([])
  const [globalSummary, setGlobalSummary] = useState<SummaryCounts | null>(null)
  const [studentFilter, setStudentFilter] = useState<'all' | 'struggling' | 'inactive7' | 'active7'>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('teacherStudentFilter')
      if (v === 'all' || v === 'struggling' || v === 'inactive7' || v === 'active7') return v
    }
    return 'all'
  })
  const [sortMode, setSortMode] = useState<'priority' | 'recent' | 'lowAccuracy'>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('teacherSortMode')
      if (v === 'priority' || v === 'recent' || v === 'lowAccuracy') return v
    }
    return 'priority'
  })
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('teacherStudentFilter', studentFilter)
    }
  }, [studentFilter])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('teacherSortMode', sortMode)
    }
  }, [sortMode])

  const summarizeStudents = useCallback((list: Student[]): SummaryCounts => {
    const total = list.length
    const active = list.filter(s => s.status !== 'not_started').length
    const struggling = list.filter(s => s.status === 'struggling').length
    const not_started = list.filter(s => s.status === 'not_started').length
    const strong = list.filter(s => s.status === 'strong').length
    const sumAcc = list.reduce((acc, s) => acc + (s.accuracy || 0), 0)
    const sumQ = list.reduce((acc, s) => acc + (s.total_questions || 0), 0)
    const avgAccuracy = total > 0 ? Math.round(sumAcc / total) : 0
    const avgQuestions = total > 0 ? Math.round(sumQ / total) : 0
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const now = NOW_TS
    const recentActive = list.filter(s => s.last_activity_ts !== null && (now - (s.last_activity_ts as number)) <= sevenDaysMs).length
    const topPerformers = list.filter(s => s.accuracy >= 85).length
    return { total, active, struggling, not_started, strong, avgAccuracy, avgQuestions, recentActive, topPerformers }
  }, [])

  const fetchStudentsForClass = useCallback(async (classId: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token ?? ''
    const res = await fetch(`/api/classes/${classId}/metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    if (!res.ok) {
      return []
    }
    const json = await res.json() as { students: Student[] }
    return json.students || []
  }, [])

  const loadStudentsForClass = useCallback(async (classId: string) => {
    const list = await fetchStudentsForClass(classId)
    setStudents(list)
  }, [fetchStudentsForClass])

  const loadTeacherData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user as UserInfo)

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: classEnrollments } = await supabase
      .from('enrollments')
      .select('class_id, classes!inner(id, name)')
      .eq('student_id', user.id)

    const classRows = (classEnrollments || []) as Array<Record<string, unknown>>
    const classItems: ClassInfo[] = []
    const seen = new Set<string>()
    classRows.forEach((row) => {
      const c = row['classes'] as Record<string, unknown> | undefined
      const id = String(c?.id ?? '')
      const name = String(c?.name ?? '')
      if (id && !seen.has(id)) {
        seen.add(id)
        classItems.push({ id, name })
      }
    })
    setClasses(classItems)

    if (classItems.length > 0) {
      const lists = await Promise.all(classItems.map(c => fetchStudentsForClass(c.id)))
      const summaries = classItems.map((c, idx) => ({
        id: c.id,
        name: c.name,
        summary: summarizeStudents(lists[idx])
      }))
      setClassSummaries(summaries)
      const global = summarizeStudents(lists.flat())
      setGlobalSummary(global)

      const first = classItems[0]
      setSelectedClassId(first.id)
      setClassName(first.name)
      await loadStudentsForClass(first.id)
    } else {
      setSelectedClassId(null)
      setClassName('')
      setStudents([])
      setClassSummaries([])
      setGlobalSummary({ total: 0, active: 0, struggling: 0, not_started: 0, strong: 0, avgAccuracy: 0, avgQuestions: 0, recentActive: 0, topPerformers: 0 })
    }

    setLoading(false)
  }, [fetchStudentsForClass, loadStudentsForClass, summarizeStudents])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTeacherData()
    }, 0)
    return () => clearTimeout(timeout)
  }, [loadTeacherData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleClassSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedClassId(id)
    const selected = classes.find(c => c.id === id)
    setClassName(selected?.name || '')
    setLoading(true)
    await loadStudentsForClass(id)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'strong':
        return <Badge className="bg-green-500">Kuat</Badge>
      case 'struggling':
        return <Badge className="bg-yellow-500">Perlu Bantuan</Badge>
      case 'not_started':
        return <Badge variant="secondary">Belum Mulai</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const totalCount = students.length
  const active7Count = students.filter(s => s.last_activity_ts !== null && (NOW_TS - (s.last_activity_ts as number)) <= sevenDaysMs).length
  const inactive7Count = students.filter(s => s.last_activity_ts === null || (NOW_TS - (s.last_activity_ts as number)) > sevenDaysMs).length
  const strugglingCount = students.filter(s => s.status === 'struggling').length
  const visibleStudents = students.filter((s) => {
    switch (studentFilter) {
      case 'struggling':
        return s.status === 'struggling'
      case 'active7':
        return s.last_activity_ts !== null && (NOW_TS - s.last_activity_ts) <= sevenDaysMs
      case 'inactive7':
        return s.last_activity_ts === null || (NOW_TS - (s.last_activity_ts as number)) > sevenDaysMs
      default:
        return true
    }
  })
  const sortedStudents = [...visibleStudents].sort((a, b) => {
    if (sortMode === 'recent') {
      const ta = a.last_activity_ts ?? -Infinity
      const tb = b.last_activity_ts ?? -Infinity
      if (ta !== tb) return tb - ta
      return (a.accuracy || 0) - (b.accuracy || 0)
    }
    if (sortMode === 'lowAccuracy') {
      const accDiff = (a.accuracy || 0) - (b.accuracy || 0)
      if (accDiff !== 0) return accDiff
      const ta = a.last_activity_ts ?? -Infinity
      const tb = b.last_activity_ts ?? -Infinity
      return tb - ta
    }
    const rank = (s: Student) => (s.status === 'struggling' ? 0 : (s.last_activity_ts === null || (NOW_TS - (s.last_activity_ts as number)) > sevenDaysMs) ? 1 : 2)
    const ra = rank(a)
    const rb = rank(b)
    if (ra !== rb) return ra - rb
    if (ra === 0) {
      const accDiff = (a.accuracy || 0) - (b.accuracy || 0)
      if (accDiff !== 0) return accDiff
    }
    if (ra === 1) {
      const ta = a.last_activity_ts ?? 0
      const tb = b.last_activity_ts ?? 0
      if (ta !== tb) return ta - tb
    }
    const ta = a.last_activity_ts ?? 0
    const tb = b.last_activity_ts ?? 0
    if (ta !== tb) return tb - ta
    return (a.accuracy || 0) - (b.accuracy || 0)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Kognisia Teacher</h1>
            {classes.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Kelas:</span>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={selectedClassId ?? ''}
                  onChange={handleClassSelect}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = selectedClassId ?? ''
                    window.location.href = id ? `/teacher/classes?selectedClassId=${id}` : '/teacher/classes'
                  }}
                >
                  Kelola Kelas Ini
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Kelas: {className || '-'}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/teacher/classes')}
            >
              Manajemen Kelas
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Kognisia Teacher</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Guru 👩‍🏫
          </h2>
          <p className="text-gray-600">
            Monitor progress siswa dan berikan feedback personal
          </p>
        </div>

        {globalSummary && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ringkasan Semua Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-9 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{globalSummary.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Siswa Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{globalSummary.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Kuat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{globalSummary.strong}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Perlu Perhatian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{globalSummary.struggling}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Belum Mulai</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-600">{globalSummary.not_started}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Akurasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">{globalSummary.avgAccuracy}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Soal Dijawab</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-700">{globalSummary.avgQuestions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Top Performers (≥85%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">{globalSummary.topPerformers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Aktif 7 Hari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-teal-700">{globalSummary.recentActive}</div>
                </CardContent>
              </Card>
            </div>
            {classSummaries.length > 0 && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="grid grid-cols-9 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  <div>Kelas</div>
                  <div className="text-center">Total</div>
                  <div className="text-center">Aktif</div>
                  <div className="text-center">Perlu Perhatian</div>
                  <div className="text-center">Belum Mulai</div>
                  <div className="text-center">Rata-rata Akurasi</div>
                  <div className="text-center">Rata-rata Soal</div>
                  <div className="text-center">Top Performers</div>
                  <div className="text-center">Aktif 7 Hari</div>
                </div>
                <div>
                  {classSummaries.map(item => (
                    <div key={item.id} className="grid grid-cols-9 px-4 py-2 border-t text-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-center">{item.summary.total}</div>
                      <div className="text-center">{item.summary.active}</div>
                      <div className="text-center">{item.summary.struggling}</div>
                      <div className="text-center">{item.summary.not_started}</div>
                      <div className="text-center">{item.summary.avgAccuracy}%</div>
                      <div className="text-center">{item.summary.avgQuestions}</div>
                      <div className="text-center">{item.summary.topPerformers}</div>
                      <div className="text-center">{item.summary.recentActive}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Class Stats */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Siswa Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => s.status !== 'not_started').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Perlu Perhatian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.status === 'struggling').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Belum Mulai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {students.filter(s => s.status === 'not_started').length}
              </div>
            </CardContent>
          </Card>

          {(() => {
            const summary = summarizeStudents(students)
            return (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Rata-rata Akurasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-indigo-600">
                      {summary.avgAccuracy}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Rata-rata Soal Dijawab
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-indigo-700">
                      {summary.avgQuestions}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Top Performers (≥85%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-700">
                      {summary.topPerformers}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Aktif 7 Hari
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-700">
                      {summary.recentActive}
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          })()}
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>
              Klik siswa untuk melihat detail progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={studentFilter === 'all' ? undefined : 'outline'}
                  onClick={() => setStudentFilter('all')}
                >
                  Semua ({totalCount})
                </Button>
                <Button
                  size="sm"
                  variant={studentFilter === 'active7' ? undefined : 'outline'}
                  onClick={() => setStudentFilter('active7')}
                >
                  Aktif 7 Hari ({active7Count})
                </Button>
                <Button
                  size="sm"
                  variant={studentFilter === 'inactive7' ? undefined : 'outline'}
                  onClick={() => setStudentFilter('inactive7')}
                >
                  Tidak aktif ≥7 hari ({inactive7Count})
                </Button>
                <Button
                  size="sm"
                  variant={studentFilter === 'struggling' ? undefined : 'outline'}
                  onClick={() => setStudentFilter('struggling')}
                >
                  Perlu Perhatian ({strugglingCount})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Urut:</span>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as 'priority' | 'recent' | 'lowAccuracy')}
                >
                  <option value="priority">Prioritas Intervensi</option>
                  <option value="recent">Terbaru Aktif</option>
                  <option value="lowAccuracy">Akurasi Terendah</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {sortedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                      {getStatusBadge(student.status)}
                      {student.last_activity_ts !== null && (NOW_TS - student.last_activity_ts) <= 7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-teal-500">Aktif 7 Hari</Badge>
                      )}
                      {student.last_activity_ts !== null && (NOW_TS - student.last_activity_ts) > 7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-gray-400">Tidak aktif ≥7 hari</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Terakhir aktif: {student.last_activity}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-gray-900">{student.accuracy}%</div>
                    <p className="text-xs text-gray-500">
                      {student.correct_answers}/{student.total_questions} benar
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/teacher/student/${student.id}`}
                  >
                    Lihat Detail
                  </Button>
                </div>
              ))}

              {visibleStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada siswa yang cocok dengan filter
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
