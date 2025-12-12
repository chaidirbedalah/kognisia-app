import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    const { eventId, challengeId } = await request.json();

    if (!eventId || !challengeId) {
      return NextResponse.json(
        { error: 'Event ID and Challenge ID are required' },
        { status: 400 }
      );
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('event_challenges')
      .select('id, points, event_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, bonus_multiplier')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already completed
    const { data: existing } = await supabase
      .from('user_event_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already completed' },
        { status: 400 }
      );
    }

    // Calculate points with bonus multiplier
    const pointsEarned = Math.floor(challenge.points * event.bonus_multiplier);

    // Record progress
    const { data: progress, error: progressError } = await supabase
      .from('user_event_progress')
      .insert({
        user_id: user.id,
        event_id: eventId,
        challenge_id: challengeId,
        completed_at: new Date().toISOString(),
        points_earned: pointsEarned
      })
      .select()
      .single();

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Update participation stats
    const { data: participation, error: participationError } = await supabase
      .from('user_event_participation')
      .select('total_points, challenges_completed')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    if (!participationError && participation) {
      await supabase
        .from('user_event_participation')
        .update({
          total_points: participation.total_points + pointsEarned,
          challenges_completed: participation.challenges_completed + 1
        })
        .eq('user_id', user.id)
        .eq('event_id', eventId);
    }

    return NextResponse.json({
      message: 'Challenge completed successfully',
      progress,
      pointsEarned
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
