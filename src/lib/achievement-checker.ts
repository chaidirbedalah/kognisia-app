import { supabase } from './supabase'

interface BattleResult {
  score: number
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  timeTakenSeconds: number
  rank: number
  isHots: boolean
}

/**
 * Check and unlock achievements based on battle result
 */
export async function checkAndUnlockAchievements(
  userId: string,
  battleResult: BattleResult,
  session: any
) {
  const achievementsToUnlock: string[] = []

  // Check First Battle
  const { data: battleCount } = await supabase
    .from('squad_battle_participants')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  if (battleCount === 1) {
    achievementsToUnlock.push('first_battle')
  }

  // Check Perfect Score
  if (battleResult.accuracy === 1.0) {
    achievementsToUnlock.push('perfect_score')
  }

  // Check Speed Demon (under 5 minutes = 300 seconds)
  if (battleResult.timeTakenSeconds < 300) {
    achievementsToUnlock.push('speed_demon')
  }

  // Check First Place
  if (battleResult.rank === 1) {
    achievementsToUnlock.push('first_place')
  }

  // Check HOTS Challenger
  if (battleResult.isHots) {
    achievementsToUnlock.push('hots_challenger')
    
    // Check HOTS Master (5 wins)
    const { data: hotsWins } = await supabase
      .from('squad_battle_participants')
      .select('id')
      .eq('user_id', userId)
      .eq('rank', 1)
      .filter('battle_id', 'in', `(
        SELECT id FROM squad_battles WHERE is_hots_mode = true
      )`)

    if (hotsWins && hotsWins.length >= 5) {
      achievementsToUnlock.push('hots_master')
    }
  }

  // Check Accuracy Master (90%+ across 5 battles)
  const { data: accurateGames } = await supabase
    .from('squad_battle_participants')
    .select('accuracy')
    .eq('user_id', userId)
    .gte('accuracy', 0.9)

  if (accurateGames && accurateGames.length >= 5) {
    achievementsToUnlock.push('accuracy_master')
  }

  // Check Top Three (top 3 in 5 battles)
  const { data: topThreeGames } = await supabase
    .from('squad_battle_participants')
    .select('rank')
    .eq('user_id', userId)
    .lte('rank', 3)

  if (topThreeGames && topThreeGames.length >= 5) {
    achievementsToUnlock.push('top_three')
  }

  // Unlock all achievements
  for (const code of achievementsToUnlock) {
    try {
      await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ achievement_code: code })
      })
    } catch (error) {
      console.error(`Error unlocking achievement ${code}:`, error)
    }
  }

  return achievementsToUnlock
}

/**
 * Get achievement progress for a user
 */
export async function getAchievementProgress(userId: string) {
  try {
    const { data: stats } = await supabase
      .from('user_achievements')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    const { data: totalAchievements } = await supabase
      .from('achievements')
      .select('id', { count: 'exact' })

    return {
      unlocked: stats || 0,
      total: totalAchievements || 0,
      percentage: totalAchievements ? Math.round(((stats || 0) / totalAchievements) * 100) : 0
    }
  } catch (error) {
    console.error('Error getting achievement progress:', error)
    return {
      unlocked: 0,
      total: 0,
      percentage: 0
    }
  }
}
