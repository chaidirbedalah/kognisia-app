import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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
    const { studentId, fromClassId, toClassId } = await request.json() as { studentId?: string; fromClassId?: string; toClassId?: string }
    if (!studentId || !fromClassId || !toClassId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const { data: enrollment, error: findError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', fromClassId)
      .limit(1)
      .single()
    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 404 })
    }
    const { error: updError } = await supabase
      .from('enrollments')
      .update({ class_id: toClassId })
      .eq('id', (enrollment as Record<string, unknown>)['id'])
    if (updError) {
      return NextResponse.json({ error: updError.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
