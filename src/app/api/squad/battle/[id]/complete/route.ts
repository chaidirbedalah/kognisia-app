import { NextRequest, NextResponse } from 'next/server'
import { completeBattle, getBattleLeaderboard } from '@/lib/squad-api'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params
    
    // Get current user with SSR cookies, fallback to Bearer
    const ssr = await createClient()
    const { data: { user }, error: authError } = await ssr.auth.getUser()
    let currentUserId = user?.id || null
    if (authError || !currentUserId) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const anon = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      )
      const { data: tokenUser } = await anon.auth.getUser()
      if (!tokenUser?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      currentUserId = tokenUser.user.id
    }

    const battleId = resolvedParams.id

    // Complete battle for this user
    await completeBattle(currentUserId!, battleId)

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
    const leaderboard = await getBattleLeaderboard(battleId, currentUserId!)

    // Get user's final stats
    const userStats = leaderboard.participants.find(p => p.user_id === currentUserId)

    return NextResponse.json({
      success: true,
      final_rank: userStats?.rank || null,
      final_score: userStats?.score || 0,
      accuracy: userStats?.accuracy || 0,
      leaderboard
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to complete battle'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
