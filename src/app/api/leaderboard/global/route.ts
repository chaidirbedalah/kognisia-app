import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get leaderboard by achievement points
    const { data: leaderboard, error: leaderboardError } = await supabase
      .rpc('get_achievement_leaderboard', {
        limit_count: 100
      })

    if (leaderboardError) {
      // Fallback: calculate manually
      const { data: users } = await supabase
        .from('auth.users')
        .select('id, email')

      if (!users) {
        return NextResponse.json({
          success: true,
          leaderboard: [],
          total_users: 0
        })
      }

      // Get achievements for each user
      const leaderboardData = await Promise.all(
        users.map(async (u) => {
          const { data: achievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', u.id)

          const { data: allAchievements } = await supabase
            .from('achievements')
            .select('points')
            .in('id', achievements?.map(a => a.achievement_id) || [])

          const totalPoints = allAchievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

          return {
            user_id: u.id,
            email: u.email,
            total_points: totalPoints,
            achievement_count: achievements?.length || 0,
            is_current_user: u.id === user.id
          }
        })
      )

      const sorted = leaderboardData
        .sort((a, b) => b.total_points - a.total_points)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))

      return NextResponse.json({
        success: true,
        leaderboard: sorted,
        total_users: sorted.length,
        current_user_rank: sorted.find(l => l.is_current_user)?.rank || null
      })
    }

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard || [],
      total_users: leaderboard?.length || 0
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
