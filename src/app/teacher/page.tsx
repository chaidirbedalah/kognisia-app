'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Student = {
  id: string
  full_name: string
  email: string
  total_questions: number
  correct_answers: number
  accuracy: number
  last_activity: string
  status: 'strong' | 'struggling' | 'not_started'
}

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [className, setClassName] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeacherData()
  }, [])

  const loadTeacherData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) {
      window.location.href = '/login'
      return
    }

    // Get teacher's class
    const { data: classData } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', user.id)
      .single()

    if (classData) {
      setClassName(classData.name)

      // Get students in class
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id, users!inner(id, full_name, email)')
        .eq('class_id', classData.id)
        .eq('status', 'active')

      if (enrollments) {
        const studentStats = await Promise.all(
          enrollments.map(async (enrollment: any) => {
            const studentId = enrollment.student_id

            // Get student progress
            const { data: progress } = await supabase
              .from('student_progress')
              .select('*')
              .eq('student_id', studentId)

            const total = progress?.length || 0
            const correct = progress?.filter(p => p.is_correct).length || 0
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

            // Determine status
            let status: 'strong' | 'struggling' | 'not_started' = 'not_started'
            if (total === 0) {
              status = 'not_started'
            } else if (accuracy >= 70) {
              status = 'strong'
            } else {
              status = 'struggling'
            }

            // Get last activity
            const lastActivity = progress && progress.length > 0
              ? new Date(progress[progress.length - 1].created_at).toLocaleDateString('id-ID')
              : 'Belum ada aktivitas'

            return {
              id: studentId,
              full_name: enrollment.users.full_name,
              email: enrollment.users.email,
              total_questions: total,
              correct_answers: correct,
              accuracy,
              last_activity: lastActivity,
              status
            }
          })
        )

        setStudents(studentStats)
      }
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Kognisia Teacher</h1>
            <p className="text-sm text-gray-600">Kelas: {className}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Guru 👩‍🏫
          </h2>
          <p className="text-gray-600">
            Monitor progress siswa dan berikan feedback personal
          </p>
        </div>

        {/* Class Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                      {getStatusBadge(student.status)}
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

              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada siswa di kelas ini
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
