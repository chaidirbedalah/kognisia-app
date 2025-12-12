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

    // Get user engagement metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('user_engagement_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      );
    }

    // Get daily engagement stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyStats, error: dailyError } = await supabase
      .from('daily_engagement_stats')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyError) {
      return NextResponse.json(
        { error: dailyError.message },
        { status: 500 }
      );
    }

    // Get user's recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activityError) {
      return NextResponse.json(
        { error: activityError.message },
        { status: 500 }
      );
    }

    // Calculate engagement trends
    const engagementTrend = dailyStats?.map(stat => ({
      date: stat.date,
      activeUsers: stat.total_active_users,
      battles: stat.total_battles,
      achievements: stat.total_achievements_unlocked
    })) || [];

    return NextResponse.json({
      userMetrics: metrics || {
        total_battles: 0,
        total_achievements: 0,
        current_streak: 0,
        longest_streak: 0,
        total_points: 0,
        engagement_score: 0
      },
      engagementTrend,
      recentActivity: recentActivity || [],
      summary: {
        totalBattles: metrics?.total_battles || 0,
        totalAchievements: metrics?.total_achievements || 0,
        currentStreak: metrics?.current_streak || 0,
        longestStreak: metrics?.longest_streak || 0,
        totalPoints: metrics?.total_points || 0,
        engagementScore: metrics?.engagement_score || 0
      }
    });
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
