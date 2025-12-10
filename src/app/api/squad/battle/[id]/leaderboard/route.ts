import { NextRequest, NextResponse } from 'next/server'
import { getBattleLeaderboard } from '@/lib/squad-api'
import { createClient } from '@/lib/supabase-server'

export async function GET(
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

    // Get leaderboard
    const leaderboard = await getBattleLeaderboard(battleId, user.id)

    return NextResponse.json({
      success: true,
      leaderboard
    })

  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
