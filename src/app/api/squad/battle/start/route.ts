import { NextRequest, NextResponse } from 'next/server'
import { startSquadBattle } from '@/lib/squad-api'
import { isValidDifficulty } from '@/lib/squad-types'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header (client-side auth approach)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth header' },
        { status: 401 }
      )
    }

    // Create Supabase client with auth header
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      squad_id, 
      difficulty, 
      battle_type, 
      subtest_code, 
      question_count,
      time_limit_minutes,
      scheduled_start_at
    } = body

    // Validate required fields
    if (!squad_id) {
      return NextResponse.json(
        { error: 'Squad ID is required' },
        { status: 400 }
      )
    }

    if (!difficulty || !isValidDifficulty(difficulty)) {
      return NextResponse.json(
        { error: 'Valid difficulty is required (easy, medium, hard)' },
        { status: 400 }
      )
    }

    if (!battle_type || !['subtest', 'mini_tryout'].includes(battle_type)) {
      return NextResponse.json(
        { error: 'Valid battle_type is required (subtest or mini_tryout)' },
        { status: 400 }
      )
    }

    // Validate subtest fields
    if (battle_type === 'subtest') {
      if (!subtest_code) {
        return NextResponse.json(
          { error: 'Subtest code is required for subtest battles' },
          { status: 400 }
        )
      }
      if (!question_count || question_count < 5 || question_count > 30) {
        return NextResponse.json(
          { error: 'Question count must be between 5 and 30 for subtest battles' },
          { status: 400 }
        )
      }
    }

    if (time_limit_minutes && (time_limit_minutes < 5 || time_limit_minutes > 60)) {
      return NextResponse.json(
        { error: 'Time limit must be between 5 and 60 minutes' },
        { status: 400 }
      )
    }

    // Start battle
    const result = await startSquadBattle(user.id, {
      squad_id,
      difficulty,
      battle_type,
      subtest_code: battle_type === 'subtest' ? subtest_code : undefined,
      question_count: battle_type === 'subtest' ? question_count : undefined,
      time_limit_minutes: time_limit_minutes || 15,
      scheduled_start_at: scheduled_start_at || undefined
    })

    return NextResponse.json({
      success: true,
      battle: result.battle,
      questions: result.questions.map(q => ({
        id: q.question_id,
        order: q.question_order,
        // Don't send correct answer to client
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
    })

  } catch (error: any) {
    console.error('Error starting battle:', error)
    
    if (error.message.includes('Only squad leader')) {
      return NextResponse.json(
        { error: 'Only the squad leader can start battles' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to start battle' },
      { status: 500 }
    )
  }
}
