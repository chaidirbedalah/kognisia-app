import { NextRequest, NextResponse } from 'next/server'
import { submitBattleAnswer } from '@/lib/squad-api'
import { createClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params
    
    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    const result = await submitBattleAnswer(user.id, {
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

  } catch (error: any) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
