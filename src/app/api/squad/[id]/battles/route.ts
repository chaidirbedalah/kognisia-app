import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    let currentUserId = user?.id || null
    if (authError || !currentUserId) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const token = authHeader.substring(7)
      const anon = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: tokenData } = await anon.auth.getUser(token)
      if (!tokenData?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      currentUserId = tokenData.user.id
    }

    const squadId = resolvedParams.id

    // Get battles for this squad
    const { data: battles, error: battlesError } = await supabase
      .from('squad_battles')
      .select(`
        id,
        battle_type,
        subtest_code,
        question_count,
        difficulty,
        scheduled_start_at,
        status,
        created_at,
        subtests (
          name
        )
      `)
      .eq('squad_id', squadId)
      .in('status', ['scheduled', 'active'])
      .order('scheduled_start_at', { ascending: true })

    if (battlesError) {
      throw battlesError
    }

    // Format battles with subtest names
    type BattleRow = {
      id: string
      battle_type: string
      subtest_code: string | null
      question_count: number | null
      difficulty: string
      scheduled_start_at: string | null
      status: string
      created_at: string
      subtests?: { name?: string }
    }
    const rows = (battles ?? []) as BattleRow[]
    const formattedBattles = rows.map((battle) => ({
      id: battle.id,
      battle_type: battle.battle_type,
      subtest_code: battle.subtest_code,
      subtest_name: battle.subtests?.name,
      question_count: battle.question_count,
      difficulty: battle.difficulty,
      scheduled_start_at: battle.scheduled_start_at,
      status: battle.status,
      created_at: battle.created_at
    }))

    return NextResponse.json({
      success: true,
      battles: formattedBattles
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch battles'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
