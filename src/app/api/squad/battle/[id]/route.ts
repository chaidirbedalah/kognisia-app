import { NextRequest, NextResponse } from 'next/server'
import { getBattleDetails } from '@/lib/squad-api'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params
    
    // Get current user
    const ssr = await createClient()
    const { data: { user }, error: authError } = await ssr.auth.getUser()
    let client = ssr
    let currentUserId = user?.id || null
    if (authError || !currentUserId) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      client = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      )
      const { data: tokenUser } = await client.auth.getUser()
      if (!tokenUser?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      currentUserId = tokenUser.user.id
    }

    const battleId = resolvedParams.id

    // Get battle details with squad info
    const { data: battle, error: battleError } = await client
      .from('squad_battles')
      .select(`
        *,
        squads (
          id,
          name
        ),
        subtests (
          name
        )
      `)
      .eq('id', battleId)
      .single()

    if (battleError) throw battleError

    // Get participant count
    const { count } = await client
      .from('squad_battle_participants')
      .select('*', { count: 'exact', head: true })
      .eq('battle_id', battleId)

    // Format battle info
    const battleInfo = {
      id: battle.id,
      battle_type: battle.battle_type,
      subtest_code: battle.subtest_code,
      subtest_name: battle.subtests?.name,
      question_count: battle.question_count,
      difficulty: battle.difficulty,
      scheduled_start_at: battle.scheduled_start_at,
      status: battle.status,
      squad_id: battle.squad_id,
      squad_name: battle.squads?.name
    }

    // If battle is active, get questions
    type QuestionView = {
      id: string
      order: number
      question_text?: string
      question_image_url?: string | null
      option_a?: string
      option_b?: string
      option_c?: string
      option_d?: string
      option_e?: string
      difficulty?: string
      subtest_utbk?: string
      hint_text?: string | null
    }
    let questions: QuestionView[] = []
    if (battle.status === 'active') {
      const result = await getBattleDetails(battleId)
      questions = result.questions.map((q) => ({
        id: q.question_id,
        order: q.question_order,
        // Don't send correct answer to client during active battle
        question_text: q.question?.question_text,
        question_image_url: q.question?.question_image_url,
        option_a: q.question?.option_a,
        option_b: q.question?.option_b,
        option_c: q.question?.option_c,
        option_d: q.question?.option_d,
        option_e: q.question?.option_e,
        difficulty: q.question?.difficulty,
        subtest_utbk: q.question?.subtest_utbk,
        hint_text: q.question?.hint_text
      }))
    }

    return NextResponse.json({
      success: true,
      battle: battleInfo,
      participant_count: count || 0,
      is_participant: !!(await client
        .from('squad_battle_participants')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', currentUserId!)
        .limit(1)
        .maybeSingle()).data,
      questions
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch battle details'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
