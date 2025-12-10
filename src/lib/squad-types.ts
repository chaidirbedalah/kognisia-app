/**
 * Squad Battle Type Definitions
 */

export interface Squad {
  id: string
  name: string
  invite_code: string
  leader_id: string
  max_members: number
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Computed fields
  member_count?: number
  leader_name?: string
}

export interface SquadMember {
  id: string
  squad_id: string
  user_id: string
  role: 'leader' | 'member'
  is_active: boolean
  joined_at: string
  left_at: string | null
  
  // Computed fields
  user_name?: string
  user_email?: string
  is_current_user?: boolean
}

export interface SquadBattle {
  id: string
  squad_id: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled'
  total_questions: number
  time_limit_minutes: number
  battle_type: 'subtest' | 'mini_tryout'
  subtest_code: string | null
  question_count: number | null
  scheduled_start_at: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
  
  // Computed fields
  squad_name?: string
  participant_count?: number
  subtest_name?: string
}

export interface SquadBattleParticipant {
  id: string
  battle_id: string
  user_id: string
  score: number
  correct_answers: number
  total_questions: number
  accuracy: number
  rank: number | null
  time_taken_seconds: number | null
  completed_at: string | null
  created_at: string
  
  // Computed fields
  user_name?: string
  is_current_user?: boolean
}

export interface SquadBattleQuestion {
  id: string
  battle_id: string
  question_id: string
  question_order: number
  created_at: string
  
  // Populated question data
  question?: {
    id: string
    question_text: string
    question_image_url: string | null
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string
    correct_answer: string
    difficulty: string
    subtest_utbk: string
    hint_text: string | null
    solution_steps: string | null
  }
}

export interface SquadBattleLeaderboard {
  battle_id: string
  participants: SquadBattleParticipant[]
  current_user_rank: number | null
  total_participants: number
  updated_at: string
}

export interface SquadBattleHistory {
  battle_id: string
  squad_name: string
  date: string
  rank: number
  score: number
  accuracy: number
  total_participants: number
  difficulty: 'easy' | 'medium' | 'hard'
}

// API Request/Response types

export interface CreateSquadRequest {
  name: string
  max_members?: number
}

export interface CreateSquadResponse {
  squad: Squad
  invite_code: string
}

export interface JoinSquadRequest {
  invite_code: string
}

export interface JoinSquadResponse {
  squad: Squad
  member: SquadMember
}

export interface StartBattleRequest {
  squad_id: string
  difficulty: 'easy' | 'medium' | 'hard'
  battle_type: 'subtest' | 'mini_tryout'
  subtest_code?: string
  question_count?: number
  time_limit_minutes?: number
  scheduled_start_at?: string // ISO timestamp for scheduled battles
}

export interface StartBattleResponse {
  battle: SquadBattle
  questions: SquadBattleQuestion[]
}

export interface SubmitAnswerRequest {
  battle_id: string
  question_id: string
  selected_answer: string
  time_spent_seconds: number
}

export interface SubmitAnswerResponse {
  is_correct: boolean
  correct_answer: string
  current_score: number
  current_rank: number
}

export interface CompleteBattleRequest {
  battle_id: string
}

export interface CompleteBattleResponse {
  final_rank: number
  final_score: number
  accuracy: number
  leaderboard: SquadBattleLeaderboard
}

// Validation helpers

export function isValidSquadName(name: string): boolean {
  return name.length >= 3 && name.length <= 30
}

export function isValidInviteCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

export function isValidDifficulty(difficulty: string): difficulty is 'easy' | 'medium' | 'hard' {
  return ['easy', 'medium', 'hard'].includes(difficulty)
}

export function calculateRank(participants: SquadBattleParticipant[]): SquadBattleParticipant[] {
  // Sort by score (descending), then by time (ascending)
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0)
  })
  
  // Assign ranks
  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1
  }))
}

export function getBattleStatusLabel(status: SquadBattle['status']): string {
  const labels = {
    waiting: 'Menunggu',
    active: 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    scheduled: 'Terjadwal'
  }
  return labels[status] || status
}

export function getDifficultyLabel(difficulty: SquadBattle['difficulty']): string {
  const labels = {
    easy: 'Mudah',
    medium: 'Sedang',
    hard: 'Sulit'
  }
  return labels[difficulty]
}

export function getDifficultyColor(difficulty: SquadBattle['difficulty']): string {
  const colors = {
    easy: 'green',
    medium: 'yellow',
    hard: 'red'
  }
  return colors[difficulty]
}

// Battle Notifications

export interface BattleNotification {
  id: string
  battle_id: string
  user_id: string
  notification_type: 'battle_scheduled' | 'battle_starting' | 'battle_started'
  message: string
  is_read: boolean
  created_at: string
  read_at: string | null
}

export function getTimeUntilBattle(scheduledTime: string): string {
  const now = new Date()
  const scheduled = new Date(scheduledTime)
  const diffMs = scheduled.getTime() - now.getTime()
  
  if (diffMs < 0) return 'Started'
  
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays} hari lagi`
  if (diffHours > 0) return `${diffHours} jam lagi`
  if (diffMins > 0) return `${diffMins} menit lagi`
  return 'Segera dimulai!'
}
