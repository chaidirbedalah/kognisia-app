import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type RosterItem = { id: string; full_name: string; email: string }

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
    const { id } = await context.params
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('student_id, users!inner(id, full_name, email, role)')
      .eq('class_id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const roster: RosterItem[] = []
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
      if (role === 'student') {
        roster.push({
          id: String((row['student_id'] as string | number | null | undefined) ?? ''),
          full_name: fullName,
          email
        })
      }
    }
    return NextResponse.json({ students: roster })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
