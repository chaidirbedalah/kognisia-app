import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const battleId = resolvedParams.id

    const ssr = await createClient()
    const { data: { user } } = await ssr.auth.getUser()
    let client = ssr
    if (!user) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      client = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      )
    }

    // Get battle info
    const { data: battle, error: battleError } = await client
      .from('squad_battles')
      .select('*')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }

    // Get leaderboard with user info
    const { data: leaderboard, error: leaderboardError } = await client
      .from('squad_battle_participants')
      .select(`
        id,
        user_id,
        score,
        correct_answers,
        total_questions,
        accuracy,
        rank,
        time_taken_seconds,
        completed_at,
        users:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('battle_id', battleId)
      .order('score', { ascending: false })
      .order('accuracy', { ascending: false })
      .order('time_taken_seconds', { ascending: true })

    if (leaderboardError) throw leaderboardError

    // Calculate ranks and add badges
    type LeaderboardRow = {
      id: string
      user_id: string
      score: number | null
      correct_answers: number | null
      total_questions: number | null
      accuracy: number | null
      rank: number | null
      time_taken_seconds: number | null
      completed_at: string | null
      users?: {
        id: string
        full_name?: string | null
        email?: string | null
        avatar_url?: string | null
      }
    }
    const rows = (leaderboard ?? []) as unknown as LeaderboardRow[]
    type LeaderboardEntry = LeaderboardRow & {
      badge: string | null
      user?: LeaderboardRow['users']
      rank: number
    }
    const rankedLeaderboard: LeaderboardEntry[] = rows.map((participant, index) => {
      const badge =
        index === 0 ? '🥇 1st Place' :
        index === 1 ? '🥈 2nd Place' :
        index === 2 ? '🥉 3rd Place' :
        null
      return {
        ...participant,
        rank: index + 1,
        badge,
        user: participant.users
      }
    })

    // Get battle stats
    const totalParticipants: number = rankedLeaderboard.length
    const completedParticipants: number = rankedLeaderboard.filter((p) => p.completed_at).length
    const averageScore: number = totalParticipants > 0
      ? rankedLeaderboard.reduce((sum, p) => sum + (p.score ?? 0), 0) / totalParticipants
      : 0
    const averageAccuracy: number = totalParticipants > 0
      ? rankedLeaderboard.reduce((sum, p) => sum + (p.accuracy ?? 0), 0) / totalParticipants
      : 0

    type BattleSummary = {
      id: string
      name: string
      status: string
      total_questions: number | null
      scheduled_start_at: string | null
      is_hots_mode: boolean | null
    }
    type LeaderboardStats = {
      total_participants: number
      completed_participants: number
      average_score: number
      average_accuracy: number
    }
    return NextResponse.json({
      success: true,
      battle: {
        id: battle.id,
        name: battle.squad_id, // Will be populated with squad name
        status: battle.status,
        total_questions: battle.total_questions,
        scheduled_start_at: battle.scheduled_start_at,
        is_hots_mode: battle.is_hots_mode
      } as BattleSummary,
      stats: {
        total_participants: totalParticipants,
        completed_participants: completedParticipants,
        average_score: Math.round(averageScore * 100) / 100,
        average_accuracy: Math.round(averageAccuracy * 100) / 100
      } as LeaderboardStats,
      leaderboard: rankedLeaderboard
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
