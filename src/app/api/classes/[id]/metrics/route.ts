import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type StudentMetric = {
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

type SummaryCounts = {
  total: number
  active: number
  struggling: number
  not_started: number
  strong: number
  avgAccuracy: number
  avgQuestions: number
  recentActive: number
  topPerformers: number
}

function summarizeStudents(list: StudentMetric[]): SummaryCounts {
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
  const now = Date.now()
  const recentActive = list.filter(s => s.last_activity_ts !== null && (now - (s.last_activity_ts as number)) <= sevenDaysMs).length
  const topPerformers = list.filter(s => s.accuracy >= 85).length
  return { total, active, struggling, not_started, strong, avgAccuracy, avgQuestions, recentActive, topPerformers }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const { data: auth, error: authError } = await supabase.auth.getUser(token)
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: classId } = await context.params
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('student_id, users!inner(id, full_name, email, role)')
      .eq('class_id', classId)

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 })
    }

    const studentsBase: Array<{ id: string; full_name: string; email: string }> = []
    for (const row of (enrollments || []) as Array<Record<string, unknown>>) {
      const usersRaw = row['users'] as unknown
      let fullName = ''
      let email = ''
      let role = ''
      if (Array.isArray(usersRaw) && usersRaw.length > 0) {
        const u0 = usersRaw[0] as Record<string, unknown>
        fullName = String(u0['full_name'] ?? '')
        email = String(u0['email'] ?? '')
        role = String(u0['role'] ?? '')
      } else if (usersRaw && typeof (usersRaw as Record<string, unknown>)['full_name'] === 'string') {
        const u = usersRaw as Record<string, unknown>
        fullName = String(u['full_name'] ?? '')
        email = String(u['email'] ?? '')
        role = String(u['role'] ?? '')
      }
      if (String(role) === 'student') {
        studentsBase.push({
          id: String((row['student_id'] as string | number | null | undefined) ?? ''),
          full_name: fullName,
          email
        })
      }
    }

    const studentIds = studentsBase.map(s => s.id).filter(Boolean)
    if (studentIds.length === 0) {
      return NextResponse.json({ students: [], summary: summarizeStudents([]) })
    }

    const { data: progressRows, error: progressError } = await supabase
      .from('student_progress')
      .select('student_id, is_correct, created_at')
      .in('student_id', studentIds)
      .order('created_at', { ascending: true })

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    const grouped: Record<string, Array<{ is_correct: boolean | null; created_at: string | null }>> = {}
    for (const row of (progressRows || []) as Array<Record<string, unknown>>) {
      const sid = String((row['student_id'] as string | number | null | undefined) ?? '')
      if (!grouped[sid]) grouped[sid] = []
      grouped[sid].push({
        is_correct: Boolean((row['is_correct'] as boolean | null | undefined) ?? false),
        created_at: String((row['created_at'] as string | null | undefined) ?? '')
      })
    }

    const metrics: StudentMetric[] = studentsBase.map((s) => {
      const list = grouped[s.id] || []
      const total = list.length
      const correct = list.filter(p => Boolean(p.is_correct)).length
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
      let status: 'strong' | 'struggling' | 'not_started' = 'not_started'
      if (total === 0) status = 'not_started'
      else if (accuracy >= 70) status = 'strong'
      else status = 'struggling'
      const lastCreated = list.length > 0 ? list[list.length - 1].created_at : null
      const lastActivityTs = lastCreated ? new Date(String(lastCreated)).getTime() : null
      const lastActivityStr = lastCreated ? new Date(String(lastCreated)).toLocaleDateString('id-ID') : 'Belum ada aktivitas'
      return {
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        total_questions: total,
        correct_answers: correct,
        accuracy,
        last_activity: lastActivityStr,
        last_activity_ts: lastActivityTs,
        status
      }
    })

    const summary = summarizeStudents(metrics)
    return NextResponse.json({ students: metrics, summary })
  } catch (error) {
    console.error('Error in /api/classes/[id]/metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
