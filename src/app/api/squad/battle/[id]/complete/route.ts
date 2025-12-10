import { NextRequest, NextResponse } from 'next/server'
import { completeBattle, getBattleLeaderboard } from '@/lib/squad-api'
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

    // Complete battle for this user
    await completeBattle(user.id, battleId)

    // Record streak activity
    try {
      await fetch(`${request.nextUrl.origin}/api/streak/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          activity_type: 'squad_battle',
          activity_id: battleId
        })
      })
    } catch (streakError) {
      // Don't fail the request if streak recording fails
      console.error('Failed to record streak:', streakError)
    }

    // Get final leaderboard
    const leaderboard = await getBattleLeaderboard(battleId, user.id)

    // Get user's final stats
    const userStats = leaderboard.participants.find(p => p.user_id === user.id)

    return NextResponse.json({
      success: true,
      final_rank: userStats?.rank || null,
      final_score: userStats?.score || 0,
      accuracy: userStats?.accuracy || 0,
      leaderboard
    })

  } catch (error: any) {
    console.error('Error completing battle:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete battle' },
      { status: 500 }
    )
  }
}
