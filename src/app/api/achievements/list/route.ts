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

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: false })
      .order('points', { ascending: false })

    if (achievementsError) throw achievementsError

    // Get user's unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id)

    if (userAchievementsError) throw userAchievementsError

    const unlockedIds = new Set(userAchievements?.map(a => a.achievement_id) || [])

    // Combine data
    const achievements = (allAchievements || []).map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements?.find(a => a.achievement_id === achievement.id)?.unlocked_at
    }))

    // Calculate stats
    const totalAchievements = achievements.length
    const unlockedCount = achievements.filter(a => a.unlocked).length
    const totalPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + (a.points || 0), 0)

    return NextResponse.json({
      success: true,
      stats: {
        total_achievements: totalAchievements,
        unlocked_count: unlockedCount,
        locked_count: totalAchievements - unlockedCount,
        total_points: totalPoints,
        completion_percentage: Math.round((unlockedCount / totalAchievements) * 100)
      },
      achievements
    })

  } catch (error: any) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
