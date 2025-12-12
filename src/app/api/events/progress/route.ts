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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_event_progress')
      .select(`
        id,
        challenge_id,
        completed_at,
        points_earned,
        event_challenges (
          id,
          challenge_code,
          description,
          points,
          difficulty,
          icon
        )
      `)
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .order('completed_at', { ascending: false });

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Get participation stats
    const { data: participation, error: participationError } = await supabase
      .from('user_event_participation')
      .select('total_points, challenges_completed')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    if (participationError && participationError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: participationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      progress: progress || [],
      stats: participation || {
        total_points: 0,
        challenges_completed: 0
      }
    });
  } catch (error) {
    console.error('Error fetching event progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
