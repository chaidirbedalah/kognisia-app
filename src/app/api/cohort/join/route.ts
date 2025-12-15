import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { spendCoins } from '@/lib/economy'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cohort_id } = body as { cohort_id?: string }
    if (!cohort_id) {
      return NextResponse.json({ error: 'cohort_id is required' }, { status: 400 })
    }

    const { data: existing } = await client
      .from('ticket_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('reason', 'cohort_entry')
      .eq('reference_id', cohort_id)
      .limit(1)
      .maybeSingle()

    if (!existing) {
      await spendCoins(user.id, 1, 'cohort_entry', cohort_id, { cohort_id })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to join cohort'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

