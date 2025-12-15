import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEconomySummary, decomposeCoins } from '@/lib/economy'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summary = await getEconomySummary(user.id)
    const coins = decomposeCoins(summary.balance ?? 0)
    return NextResponse.json({
      success: true,
      coins,
      xp: summary.total_xp ?? 0
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch economy summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
