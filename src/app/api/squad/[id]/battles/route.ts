import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    const formattedBattles = battles.map((battle: any) => ({
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

  } catch (error: any) {
    console.error('Error fetching squad battles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch battles' },
      { status: 500 }
    )
  }
}
