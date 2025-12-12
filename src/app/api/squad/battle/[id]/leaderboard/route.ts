import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const battleId = resolvedParams.id

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get battle info
    const { data: battle, error: battleError } = await supabase
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
    const { data: leaderboard, error: leaderboardError } = await supabase
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

    if (leaderboardError) {
      console.error('Leaderboard error:', leaderboardError)
      throw leaderboardError
    }

    // Calculate ranks and add badges
    const rankedLeaderboard = (leaderboard || []).map((participant: any, index: number) => {
      let badge = null
      
      if (index === 0) badge = '🥇 1st Place'
      else if (index === 1) badge = '🥈 2nd Place'
      else if (index === 2) badge = '🥉 3rd Place'

      return {
        ...participant,
        rank: index + 1,
        badge,
        user: participant.users
      }
    })

    // Get battle stats
    const totalParticipants = rankedLeaderboard.length
    const completedParticipants = rankedLeaderboard.filter((p: any) => p.completed_at).length
    const averageScore = totalParticipants > 0
      ? rankedLeaderboard.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / totalParticipants
      : 0
    const averageAccuracy = totalParticipants > 0
      ? rankedLeaderboard.reduce((sum: number, p: any) => sum + (p.accuracy || 0), 0) / totalParticipants
      : 0

    return NextResponse.json({
      success: true,
      battle: {
        id: battle.id,
        name: battle.squad_id, // Will be populated with squad name
        status: battle.status,
        total_questions: battle.total_questions,
        scheduled_start_at: battle.scheduled_start_at,
        is_hots_mode: battle.is_hots_mode
      },
      stats: {
        total_participants: totalParticipants,
        completed_participants: completedParticipants,
        average_score: Math.round(averageScore * 100) / 100,
        average_accuracy: Math.round(averageAccuracy * 100) / 100
      },
      leaderboard: rankedLeaderboard
    })

  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
