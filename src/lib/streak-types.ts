/**
 * Daily Streak Type Definitions
 */

export type ActivityType = 'daily_challenge' | 'squad_battle' | 'mini_tryout' | 'full_tryout'

export interface DailyStreak {
  id: string
  user_id: string
  activity_date: string
  activity_type: ActivityType
  activity_id: string | null
  completed_at: string
  created_at: string
}

export interface StreakStats {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_active_days: number
  last_activity_date: string | null
  updated_at: string
  created_at: string
}

export interface StreakCalendar {
  date: string
  activities: ActivityType[]
  hasActivity: boolean
}

export interface StreakSummary {
  current_streak: number
  longest_streak: number
  total_active_days: number
  last_activity_date: string | null
  calendar: StreakCalendar[]
  streak_status: 'active' | 'at_risk' | 'broken'
}

// API Request/Response types

export interface RecordActivityRequest {
  activity_type: ActivityType
  activity_id?: string
  activity_date?: string // Optional, defaults to today
}

export interface RecordActivityResponse {
  success: boolean
  streak: DailyStreak
  stats: StreakStats
}

export interface GetStreakResponse {
  stats: StreakStats
  recent_activities: DailyStreak[]
  calendar: StreakCalendar[]
}

// Helper functions

export function getActivityLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    daily_challenge: 'Daily Challenge',
    squad_battle: 'Squad Battle',
    mini_tryout: 'Mini Try Out',
    full_tryout: 'Try Out UTBK'
  }
  return labels[type]
}

export function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    daily_challenge: 'blue',
    squad_battle: 'purple',
    mini_tryout: 'orange',
    full_tryout: 'green'
  }
  return colors[type]
}

export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    daily_challenge: '📝',
    squad_battle: '⚔️',
    mini_tryout: '📊',
    full_tryout: '🎯'
  }
  return icons[type]
}

export function getStreakStatus(stats: StreakStats): 'active' | 'at_risk' | 'broken' {
  if (!stats.last_activity_date) return 'broken'
  
  const lastActivity = new Date(stats.last_activity_date)
  const today = new Date()
  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'active'
  if (diffDays === 1) return 'at_risk'
  return 'broken'
}

export function getStreakMessage(stats: StreakStats): string {
  const status = getStreakStatus(stats)
  
  if (status === 'active') {
    return `🔥 Streak ${stats.current_streak} hari! Pertahankan!`
  } else if (status === 'at_risk') {
    return `⚠️ Streak ${stats.current_streak} hari berisiko! Selesaikan test hari ini!`
  } else {
    return `💔 Streak terputus. Mulai lagi hari ini!`
  }
}

export function generateCalendar(activities: DailyStreak[], days: number = 30): StreakCalendar[] {
  const calendar: StreakCalendar[] = []
  const today = new Date()
  
  // Group activities by date
  const activityMap = new Map<string, ActivityType[]>()
  activities.forEach(activity => {
    const date = activity.activity_date
    if (!activityMap.has(date)) {
      activityMap.set(date, [])
    }
    activityMap.get(date)!.push(activity.activity_type)
  })
  
  // Generate calendar for last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayActivities = activityMap.get(dateStr) || []
    calendar.push({
      date: dateStr,
      activities: dayActivities,
      hasActivity: dayActivities.length > 0
    })
  }
  
  return calendar
}
