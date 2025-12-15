import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { awardCoins } from '@/lib/economy'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cohort_id, completion_percent } = body as { cohort_id?: string, completion_percent?: number }
    if (!cohort_id) {
      return NextResponse.json({ error: 'cohort_id is required' }, { status: 400 })
    }
    if (typeof completion_percent !== 'number') {
      return NextResponse.json({ error: 'completion_percent is required' }, { status: 400 })
    }

    if (completion_percent >= 80) {
      await awardCoins(user.id, 3, 'cohort_completion', cohort_id, { cohort_id, completion_percent })
    }

    // Sync event participation progress based on completion percent
    try {
      const { data: event } = await client
        .from('events')
        .select(`
          id,
          bonus_multiplier,
          event_challenges (
            id,
            points
          )
        `)
        .eq('id', cohort_id)
        .single()
      
      if (event && Array.isArray(event.event_challenges)) {
        const totalChallenges = event.event_challenges.length
        const completedCount = Math.max(0, Math.floor(totalChallenges * (completion_percent / 100)))
        
        if (completedCount > 0) {
          const basePoints = event.event_challenges
            .slice(0, completedCount)
            .reduce((sum: number, ch: { points?: number }) => sum + (ch.points || 0), 0)
          const bonus = typeof event.bonus_multiplier === 'number' ? event.bonus_multiplier : 1
          const computedPoints = Math.floor(basePoints * bonus)
          
          const { data: participation } = await client
            .from('user_event_participation')
            .select('id, total_points, challenges_completed')
            .eq('user_id', user.id)
            .eq('event_id', event.id)
            .maybeSingle()
          
          if (!participation) {
            await client
              .from('user_event_participation')
              .insert({
                user_id: user.id,
                event_id: event.id,
                total_points: computedPoints,
                challenges_completed: completedCount
              })
          } else {
            await client
              .from('user_event_participation')
              .update({
                total_points: Math.max(participation.total_points || 0, computedPoints),
                challenges_completed: Math.max(participation.challenges_completed || 0, completedCount)
              })
              .eq('id', participation.id)
          }

          const completedChallenges = event.event_challenges.slice(0, completedCount)
          const completedIds = completedChallenges.map((c: { id: string }) => c.id)
          if (completedIds.length > 0) {
            const { data: existingProgress } = await client
              .from('user_event_progress')
              .select('challenge_id')
              .eq('user_id', user.id)
              .eq('event_id', event.id)
              .in('challenge_id', completedIds)
            const existingIds = new Set((existingProgress || []).map((p: { challenge_id: string }) => p.challenge_id))
            const toInsert = completedChallenges
              .filter((c: { id: string }) => !existingIds.has(c.id))
              .map((c: { id: string; points?: number }) => ({
                user_id: user.id,
                event_id: event.id,
                challenge_id: c.id,
                completed_at: new Date().toISOString(),
                points_earned: Math.floor((c.points || 0) * bonus)
              }))
            if (toInsert.length > 0) {
              await client
                .from('user_event_progress')
                .insert(toInsert)
            }
          }
        }
      }
    } catch {
      // Ignore event sync errors to not block cohort completion
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete cohort'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
