import { NextRequest, NextResponse } from 'next/server'
import { submitBattleAnswer } from '@/lib/squad-api'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function POST(
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

    // Parse request body
    const body = await request.json()
    const { question_id, selected_answer, time_spent_seconds } = body

    // Validate required fields
    if (!question_id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    if (!selected_answer) {
      return NextResponse.json(
        { error: 'Selected answer is required' },
        { status: 400 }
      )
    }

    // Validate answer format (A, B, C, D, or E)
    if (!['A', 'B', 'C', 'D', 'E'].includes(selected_answer.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid answer format. Must be A, B, C, D, or E' },
        { status: 400 }
      )
    }

    // Submit answer
    const result = await submitBattleAnswer(currentUserId!, {
      battle_id: battleId,
      question_id,
      selected_answer: selected_answer.toUpperCase(),
      time_spent_seconds: time_spent_seconds || 0
    })

    return NextResponse.json({
      success: true,
      is_correct: result.is_correct,
      correct_answer: result.correct_answer
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit answer'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
