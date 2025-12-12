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
      .select('*')
      .eq('is_active', true)
      .single()

    if (seasonError && seasonError.code !== 'PGRST116') {
      throw seasonError
    }

    if (!season) {
      return NextResponse.json({
        success: true,
        season: null,
        achievements: [],
        user_achievements: [],
        leaderboard_rank: null
      })
    }

    // Get seasonal achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('seasonal_achievements')
      .select('*')
      .eq('season_id', season.id)
      .order('points', { ascending: false })

    if (achievementsError) throw achievementsError

    // Get user's unlocked seasonal achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_seasonal_achievements')
      .select('seasonal_achievement_id, unlocked_at')
      .eq('user_id', user.id)
      .eq('season_id', season.id)

    if (userAchievementsError) throw userAchievementsError

    // Get user's seasonal leaderboard rank
    const { data: leaderboardEntry, error: leaderboardError } = await supabase
      .from('seasonal_leaderboard')
      .select('rank, total_points, achievement_count')
      .eq('season_id', season.id)
      .eq('user_id', user.id)
      .single()

    if (leaderboardError && leaderboardError.code !== 'PGRST116') {
      throw leaderboardError
    }

    // Combine achievements with unlock status
    const unlockedIds = new Set(userAchievements?.map(a => a.seasonal_achievement_id) || [])
    const achievementsWithStatus = (achievements || []).map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements?.find(a => a.seasonal_achievement_id === achievement.id)?.unlocked_at
    }))

    return NextResponse.json({
      success: true,
      season: {
        ...season,
        days_remaining: Math.ceil((new Date(season.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      },
      achievements: achievementsWithStatus,
      user_achievements: userAchievements || [],
      leaderboard_rank: leaderboardEntry?.rank || null,
      leaderboard_stats: leaderboardEntry || null
    })

  } catch (error: any) {
    console.error('Error fetching current season:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch current season' },
      { status: 500 }
    )
  }
}

