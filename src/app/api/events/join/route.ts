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

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('user_event_participation')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already joined this event' },
        { status: 400 }
      );
    }

    // Join event
    const { data: participation, error: joinError } = await supabase
      .from('user_event_participation')
      .insert({
        user_id: user.id,
        event_id: eventId,
        total_points: 0,
        challenges_completed: 0
      })
      .select()
      .single();

    if (joinError) {
      return NextResponse.json(
        { error: joinError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully joined event',
      participation
    });
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
