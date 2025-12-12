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

    // Get achievement unlock statistics
    const { data: stats, error: statsError } = await supabase
      .from('achievement_unlock_stats')
      .select(`
        id,
        achievement_id,
        total_unlocks,
        unlock_percentage,
        average_unlock_time_days,
        last_unlocked_at,
        achievements (
          id,
          code,
          name,
          description,
          icon,
          points,
          rarity
        )
      `)
      .order('total_unlocks', { ascending: false });

    if (statsError) {
      return NextResponse.json(
        { error: statsError.message },
        { status: 500 }
      );
    }

    // Get user's achievement progress
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id);

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    const userAchievementIds = new Set(userAchievements?.map(a => a.achievement_id) || []);

    return NextResponse.json({
      stats: stats?.map(stat => ({
        ...stat,
        isUnlocked: userAchievementIds.has(stat.achievement_id)
      })) || [],
      totalStats: {
        totalAchievements: stats?.length || 0,
        userUnlocked: userAchievementIds.size,
        averageUnlockPercentage: stats?.length
          ? (stats.reduce((sum, s) => sum + (s.unlock_percentage || 0), 0) / stats.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching achievement analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
