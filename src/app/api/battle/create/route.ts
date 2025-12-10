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
      scheduled_start_at,
      hots_mode
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

    // Get questions for the battle with smart distribution
    const questionLimit = battle_type === 'subtest' 
      ? (question_count || 10)
      : 20

    let finalQuestions: any[] = []

    if (hots_mode) {
      // ELITE Mode: 100% HOTS questions
      let hotsQuery = supabase
        .from('question_bank')
        .select('*')
        .eq('is_hots', true)

      if (battle_type === 'subtest' && subtest_code) {
        hotsQuery = hotsQuery.eq('subtest_utbk', subtest_code)
      }

      const { data: hotsQuestions, error: hotsError } = await hotsQuery.limit(questionLimit)

      if (hotsError) {
        console.error('HOTS questions error:', hotsError)
        throw new Error(`Database error: ${hotsError.message}`)
      }

      if (!hotsQuestions || hotsQuestions.length === 0) {
        throw new Error(`No HOTS questions found for ${subtest_code ? `subtest: ${subtest_code}` : 'mini tryout'}`)
      }

      finalQuestions = hotsQuestions
      console.log('ELITE Mode - HOTS questions:', {
        total: finalQuestions.length,
        hots: finalQuestions.length,
        regular: 0
      })

    } else {
      // Regular Mode: 70% Regular + 30% HOTS distribution
      const hotsCount = Math.ceil(questionLimit * 0.3) // 30% HOTS
      const regularCount = questionLimit - hotsCount   // 70% Regular

      // Get HOTS questions (30%)
      let hotsQuery = supabase
        .from('question_bank')
        .select('*')
        .eq('is_hots', true)

      if (battle_type === 'subtest' && subtest_code) {
        hotsQuery = hotsQuery.eq('subtest_utbk', subtest_code)
      }

      const { data: hotsQuestions, error: hotsError } = await hotsQuery.limit(hotsCount)

      // Get Regular questions (70%)
      let regularQuery = supabase
        .from('question_bank')
        .select('*')
        .eq('is_hots', false)

      if (battle_type === 'subtest' && subtest_code) {
        regularQuery = regularQuery.eq('subtest_utbk', subtest_code)
      }

      const { data: regularQuestions, error: regularError } = await regularQuery.limit(regularCount)

      if (hotsError || regularError) {
        console.error('Questions error:', { hotsError, regularError })
        throw new Error(`Database error: ${hotsError?.message || regularError?.message}`)
      }

      // Combine questions
      const availableHots = hotsQuestions || []
      const availableRegular = regularQuestions || []
      
      // If we don't have enough HOTS questions, fill with regular questions
      if (availableHots.length < hotsCount) {
        const additionalRegularNeeded = hotsCount - availableHots.length
        const additionalRegularQuery = supabase
          .from('question_bank')
          .select('*')
          .eq('is_hots', false)

        if (battle_type === 'subtest' && subtest_code) {
          additionalRegularQuery.eq('subtest_utbk', subtest_code)
        }

        const { data: additionalRegular } = await additionalRegularQuery
          .limit(regularCount + additionalRegularNeeded)

        finalQuestions = [
          ...availableHots,
          ...(additionalRegular || []).slice(0, questionLimit - availableHots.length)
        ]
      } else {
        finalQuestions = [...availableHots.slice(0, hotsCount), ...availableRegular.slice(0, regularCount)]
      }

      console.log('Regular Mode - Question distribution:', {
        total: finalQuestions.length,
        hots: availableHots.slice(0, hotsCount).length,
        regular: finalQuestions.length - availableHots.slice(0, hotsCount).length,
        targetHots: hotsCount,
        targetRegular: regularCount
      })
    }

    console.log('Question query params:', {
      battle_type,
      subtest_code,
      questionLimit,
      hots_mode,
      finalQuestionsCount: finalQuestions.length
    })

    if (!finalQuestions || finalQuestions.length === 0) {
      const errorMsg = hots_mode 
        ? `No HOTS questions found for ${subtest_code ? `subtest: ${subtest_code}` : 'mini tryout'}`
        : `No questions found for ${subtest_code ? `subtest: ${subtest_code}` : 'mini tryout'}`
      throw new Error(errorMsg)
    }

    // Shuffle questions
    const shuffled = finalQuestions.sort(() => Math.random() - 0.5)

    // Create battle
    const { data: battle, error: battleError } = await supabase
      .from('squad_battles')
      .insert({
        squad_id: squad.id,
        difficulty: hots_mode ? 'hots' : 'medium', // Use 'hots' for HOTS mode
        battle_type,
        subtest_code: battle_type === 'subtest' ? subtest_code : null,
        question_count: battle_type === 'subtest' ? question_count : null,
        total_questions: shuffled.length,
        time_limit_minutes: 15,
        scheduled_start_at: scheduled_start_at || null,
        status: scheduled_start_at ? 'scheduled' : 'active',
        is_hots_mode: hots_mode || false
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