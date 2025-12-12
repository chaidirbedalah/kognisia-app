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

    // Get current active season
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single()

    if (seasonError && seasonError.code !== 'PGRST116') {
      throw seasonError
    }

    if (!season) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        current_user_rank: null
      })
    }

    // Get seasonal leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('seasonal_leaderboard')
      .select(`
        rank,
        total_points,
        achievement_count,
        user_id,
        auth.users!inner(email)
      `)
      .eq('season_id', season.id)
      .order('rank', { ascending: true })
      .limit(100)

    if (leaderboardError) throw leaderboardError

    // Get current user's rank
    const { data: userRank } = await supabase
      .from('seasonal_leaderboard')
      .select('rank')
      .eq('season_id', season.id)
      .eq('user_id', user.id)
      .single()

    const formattedLeaderboard = (leaderboard || []).map((entry: any) => ({
      rank: entry.rank,
      total_points: entry.total_points,
      achievement_count: entry.achievement_count,
      user_id: entry.user_id,
      email: entry.auth?.users?.[0]?.email || 'Unknown',
      is_current_user: entry.user_id === user.id
    }))

    return NextResponse.json({
      success: true,
      leaderboard: formattedLeaderboard,
      current_user_rank: userRank?.rank || null
    })

  } catch (error: any) {
    console.error('Error fetching seasonal leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seasonal leaderboard' },
      { status: 500 }
    )
  }
}

