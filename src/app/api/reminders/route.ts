import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, target_user_id, message } = body

    if (!type || !target_user_id || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Create in-app reminder via user_notifications
    const { error: notifError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: target_user_id,
        type: 'reminder',
        title: type === 'streak' ? 'Reminder Streak' : 'Pengingat Aktivitas',
        message,
        priority: 'medium',
        is_read: false
      })
    if (notifError) throw notifError

    // Optional: send email via provider (placeholder)
    // if (process.env.RESEND_API_KEY) { ... }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send reminder'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

