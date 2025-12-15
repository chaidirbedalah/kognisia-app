import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    // Get active events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        icon,
        start_date,
        end_date,
        bonus_multiplier,
        status,
        event_challenges (
          id,
          challenge_code,
          description,
          points,
          difficulty,
          icon
        )
      `)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: false });

    if (eventsError) {
      return NextResponse.json(
        { error: eventsError.message },
        { status: 500 }
      );
    }

    // Get user participation for each event
    const { data: participation, error: participationError } = await supabase
      .from('user_event_participation')
      .select('event_id, total_points, challenges_completed')
      .eq('user_id', user.id);

    if (participationError) {
      return NextResponse.json(
        { error: participationError.message },
        { status: 500 }
      );
    }

    // Get user progress for each event
    const { data: progress, error: progressError } = await supabase
      .from('user_event_progress')
      .select('event_id, challenge_id, completed_at, points_earned')
      .eq('user_id', user.id);

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Combine data
    const eventsWithProgress = events?.map(event => {
      const userParticipation = participation?.find(p => p.event_id === event.id);
      const userProgress = progress?.filter(p => p.event_id === event.id) || [];

      return {
        ...event,
        isJoined: !!userParticipation,
        userStats: userParticipation || {
          total_points: 0,
          challenges_completed: 0
        },
        userProgress: userProgress.reduce((acc, p) => {
          acc[p.challenge_id] = {
            completed_at: p.completed_at,
            points_earned: p.points_earned
          };
          return acc;
        }, {} as Record<string, unknown>)
      };
    }) || [];

    return NextResponse.json({
      events: eventsWithProgress,
      count: eventsWithProgress.length
    });
  } catch (error) {
    console.error('Error fetching active events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
