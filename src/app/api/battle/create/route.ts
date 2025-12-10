import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
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
      battle_name,
      battle_type, 
      subtest_code, 
      question_count,
      scheduled_start_at
    } = body

    // Validate required fields
    if (!battle_name) {
      return NextResponse.json(
        { error: 'Battle name is required' },
        { status: 400 }
      )
    }

    if (!battle_type || !['subtest', 'mini_tryout'].includes(battle_type)) {
      return NextResponse.json(
        { error: 'Valid battle_type is required (subtest or mini_tryout)' },
        { status: 400 }
      )
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // First create a squad for this battle
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .insert({
        name: battle_name,
        invite_code: inviteCode,
        leader_id: user.id,
        max_members: 8
      })
      .select()
      .single()

    if (squadError) throw squadError

    // Add leader as first member
    await supabase
      .from('squad_members')
      .insert({
        squad_id: squad.id,
        user_id: user.id,
        role: 'leader'
      })

    // Get questions for the battle
    let questionQuery = supabase
      .from('question_bank')
      .select('*')

    if (battle_type === 'subtest' && subtest_code) {
      // Try subtest_code first, fallback to subtest_utbk
      questionQuery = questionQuery.eq('subtest_utbk', subtest_code)
    }

    const questionLimit = battle_type === 'subtest' 
      ? (question_count || 10)
      : 20

    console.log('Question query params:', {
      battle_type,
      subtest_code,
      questionLimit
    })

    const { data: questions, error: questionsError } = await questionQuery.limit(questionLimit)

    console.log('Questions result:', {
      questionsCount: questions?.length || 0,
      questionsError,
      hasQuestions: !!questions
    })

    if (questionsError) {
      console.error('Questions error:', questionsError)
      throw new Error(`Database error: ${questionsError.message}`)
    }

    if (!questions || questions.length === 0) {
      throw new Error(`No questions found for subtest: ${subtest_code || 'all'}`)
    }

    // Shuffle questions
    const shuffled = questions.sort(() => Math.random() - 0.5)

    // Create battle
    const { data: battle, error: battleError } = await supabase
      .from('squad_battles')
      .insert({
        squad_id: squad.id,
        difficulty: 'medium', // Default difficulty
        battle_type,
        subtest_code: battle_type === 'subtest' ? subtest_code : null,
        question_count: battle_type === 'subtest' ? question_count : null,
        total_questions: shuffled.length,
        time_limit_minutes: 15,
        scheduled_start_at: scheduled_start_at || null,
        status: scheduled_start_at ? 'scheduled' : 'active'
      })
      .select()
      .single()

    if (battleError) throw battleError

    // Link questions to battle
    const battleQuestions = shuffled.map((q, index) => ({
      battle_id: battle.id,
      question_id: q.id,
      question_order: index + 1
    }))

    await supabase
      .from('squad_battle_questions')
      .insert(battleQuestions)

    // Create participant for leader
    await supabase
      .from('squad_battle_participants')
      .insert({
        battle_id: battle.id,
        user_id: user.id,
        total_questions: shuffled.length
      })

    return NextResponse.json({
      success: true,
      battle: {
        ...battle,
        squad_name: squad.name,
        invite_code: squad.invite_code
      }
    })

  } catch (error: any) {
    console.error('Error creating battle:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create battle' },
      { status: 500 }
    )
  }
}