import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get seasonal performance stats
    const { data: seasonalStats, error: seasonalError } = await supabase
      .from('seasonal_performance_stats')
      .select(`
        id,
        season_id,
        battles_completed,
        achievements_unlocked,
        total_points,
        rank,
        performance_score,
        seasons (
          id,
          name,
          theme,
          start_date,
          end_date
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (seasonalError) {
      return NextResponse.json(
        { error: seasonalError.message },
        { status: 500 }
      );
    }

    // Get streak statistics
    const { data: streakStats, error: streakError } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: streakError.message },
        { status: 500 }
      );
    }

    // Get achievement unlock timeline
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achievement_id,
        unlocked_at,
        achievements (
          id,
          name,
          icon,
          points,
          rarity
        )
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: true });

    if (achievementsError) {
      return NextResponse.json(
        { error: achievementsError.message },
        { status: 500 }
      );
    }

    // Build achievement timeline
    const achievementTimeline = achievements?.map(a => {
      const achievement = Array.isArray(a.achievements) ? a.achievements[0] : a.achievements;
      return {
        date: a.unlocked_at,
        achievement: achievement,
        points: achievement?.points || 0
      };
    }) || [];

    // Calculate cumulative points over time
    let cumulativePoints = 0;
    const pointsTimeline = achievementTimeline.map(item => {
      cumulativePoints += item.points;
      return {
        date: item.date,
        cumulativePoints
      };
    });

    return NextResponse.json({
      seasonalPerformance: seasonalStats || [],
      streakStats: streakStats || {
        current_streak: 0,
        longest_streak: 0,
        total_days_active: 0
      },
      achievementTimeline,
      pointsTimeline,
      trends: {
        totalSeasons: seasonalStats?.length || 0,
        averagePerformanceScore: seasonalStats?.length
          ? (seasonalStats.reduce((sum, s) => sum + (s.performance_score || 0), 0) / seasonalStats.length).toFixed(2)
          : 0,
        bestRank: seasonalStats?.length
          ? Math.min(...seasonalStats.map(s => s.rank || 999))
          : null,
        totalAchievementsUnlocked: achievements?.length || 0,
        currentStreak: streakStats?.current_streak || 0,
        longestStreak: streakStats?.longest_streak || 0
      }
    });
  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
