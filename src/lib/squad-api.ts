/**
 * Squad Battle API Functions
 * Handles all Squad Battle related database operations
 */

import { supabase } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Squad,
  SquadMember,
  SquadBattle,
  SquadBattleParticipant,
  SquadBattleQuestion,
  SquadBattleLeaderboard,
  SquadBattleHistory,
  CreateSquadRequest,
  JoinSquadRequest,
  StartBattleRequest,
  SubmitAnswerRequest
} from './squad-types'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique 6-character invite code
 */
async function generateInviteCode(): Promise<string> {
  // Try database function first
  const { data: codeData, error: codeError } = await supabase
    .rpc('generate_invite_code')
  
  if (!codeError && codeData) {
    return codeData as string
  }
  
  // Fallback: Generate code in TypeScript
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  // Try up to 10 times to generate unique code
  for (let attempt = 0; attempt < 10; attempt++) {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    // Check if code already exists
    const { data: existing } = await supabase
      .from('squads')
      .select('id')
      .eq('invite_code', code)
      .single()
    
    if (!existing) {
      return code
    }
  }
  
  throw new Error('Failed to generate unique invite code')
}

// ============================================================================
// SQUAD MANAGEMENT
// ============================================================================

/**
 * Create a new squad
 */
export async function createSquad(userId: string, request: CreateSquadRequest): Promise<Squad> {
  // Generate invite code
  const inviteCode = await generateInviteCode()
  
  // Create squad
  const { data: squad, error: squadError } = await supabase
    .from('squads')
    .insert({
      name: request.name,
      invite_code: inviteCode,
      leader_id: userId,
      max_members: request.max_members || 8
    })
    .select()
    .single()
  
  if (squadError) throw squadError
  
  // Add leader as first member
  const { error: memberError } = await supabase
    .from('squad_members')
    .insert({
      squad_id: squad.id,
      user_id: userId,
      role: 'leader'
    })
  
  if (memberError) throw memberError
  
  return squad
}

/**
 * Join a squad using invite code
 */
export async function joinSquad(userId: string, request: JoinSquadRequest): Promise<{ squad: Squad, member: SquadMember }> {
  // Find squad by invite code
  const { data: squad, error: squadError } = await supabase
    .from('squads')
    .select('*')
    .eq('invite_code', request.invite_code.toUpperCase())
    .eq('is_active', true)
    .single()
  
  if (squadError || !squad) {
    throw new Error('Squad not found or invite code invalid')
  }
  
  // Check if squad is full
  const { count } = await supabase
    .from('squad_members')
    .select('*', { count: 'exact', head: true })
    .eq('squad_id', squad.id)
    .eq('is_active', true)
  
  if (count && count >= squad.max_members) {
    throw new Error('Squad is full')
  }
  
  // Check if user already a member
  const { data: existing } = await supabase
    .from('squad_members')
    .select('*')
    .eq('squad_id', squad.id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (existing) {
    throw new Error('You are already a member of this squad')
  }
  
  // Add user as member
  const { data: member, error: memberError } = await supabase
    .from('squad_members')
    .insert({
      squad_id: squad.id,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single()
  
  if (memberError) throw memberError
  
  return { squad, member }
}

/**
 * Get user's squads
 */
export async function getUserSquads(userId: string, supabaseClient?: SupabaseClient): Promise<Squad[]> {
  const client = supabaseClient || supabase
  
  const { data, error } = await client
    .from('squad_members')
    .select(`
      squad_id,
      role,
      squads!inner (
        id,
        name,
        invite_code,
        leader_id,
        max_members,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
  
  if (error) {
    console.error('getUserSquads error:', error)
    throw error
  }
  
  type UserSquadRow = {
    squad_id: string
    role: string
    squads?: Squad
  }
  const rows = (data ?? []) as unknown as UserSquadRow[]
  const squadItems = rows.filter((item) => item.squads)
  const squadIds = squadItems.map((item) => item.squads!.id)
  const { data: membersForSquads } = await client
    .from('squad_members')
    .select('squad_id')
    .in('squad_id', squadIds)
    .eq('is_active', true)
  const countMap = new Map<string, number>()
  membersForSquads?.forEach((m: { squad_id: string }) => {
    countMap.set(m.squad_id, (countMap.get(m.squad_id) || 0) + 1)
  })
  const squads = squadItems.map((item) => ({
    ...(item.squads as Squad),
    member_count: countMap.get(item.squads!.id) || 0
  }))
  return squads
}

/**
 * Get squad details with members
 */
export async function getSquadDetails(squadId: string, currentUserId?: string, supabaseClient?: SupabaseClient): Promise<{ squad: Squad, members: SquadMember[] }> {
  const client = supabaseClient || supabase
  
  const { data: squad, error: squadError } = await client
    .from('squads')
    .select('*')
    .eq('id', squadId)
    .single()
  
  if (squadError) throw squadError
  
  const { data: members, error: membersError } = await client
    .from('squad_members')
    .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
    .eq('squad_id', squadId)
    .eq('is_active', true)
  
  if (membersError) throw membersError
  
  type MemberRow = SquadMember & { users?: { id: string; full_name?: string | null; email?: string | null } }
  const memberRows = (members ?? []) as unknown as MemberRow[]
  const membersWithNames = memberRows.map((m) => ({
    ...m,
    user_name: m.users?.full_name || m.users?.email || 'Unknown',
    user_email: m.users?.email ?? undefined,
    is_current_user: currentUserId ? m.user_id === currentUserId : false
  }))
  
  return { squad, members: membersWithNames }
}

/**
 * Leave a squad
 */
export async function leaveSquad(userId: string, squadId: string, supabaseClient?: SupabaseClient): Promise<void> {
  const client = supabaseClient || supabase
  
  const { error } = await client
    .from('squad_members')
    .update({
      is_active: false,
      left_at: new Date().toISOString()
    })
    .eq('squad_id', squadId)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ============================================================================
// SQUAD BATTLE MANAGEMENT
// ============================================================================

/**
 * Start a new squad battle
 */
export async function startSquadBattle(userId: string, request: StartBattleRequest): Promise<{ battle: SquadBattle, questions: SquadBattleQuestion[] }> {
  // Verify user is squad leader
  const { data: squad } = await supabase
    .from('squads')
    .select('*')
    .eq('id', request.squad_id)
    .eq('leader_id', userId)
    .single()
  
  if (!squad) {
    throw new Error('Only squad leader can start battles')
  }
  
  // Build question query based on battle type
  let questionQuery = supabase
    .from('question_bank')
    .select('*')
    .eq('difficulty', request.difficulty)
  
  // For subtest battles, filter by subtest_code
  if (request.battle_type === 'subtest' && request.subtest_code) {
    questionQuery = questionQuery.eq('subtest_code', request.subtest_code)
  }
  
  // Set limit based on battle type
  const questionLimit = request.battle_type === 'subtest' 
    ? (request.question_count || 10)
    : 20 // Mini try out - limit to 20 due to database constraint
  
  questionQuery = questionQuery.limit(questionLimit)
  
  const { data: questions, error: questionsError } = await questionQuery
  
  if (questionsError || !questions || questions.length === 0) {
    throw new Error('Failed to fetch questions')
  }
  
  // Shuffle questions
  const shuffled = questions.sort(() => Math.random() - 0.5)
  
  // Determine status and start time based on scheduling
  const isScheduled = !!request.scheduled_start_at
  const status = isScheduled ? 'scheduled' : 'active'
  const startedAt = isScheduled ? null : new Date().toISOString()
  
  // Create battle
  const { data: battle, error: battleError } = await supabase
    .from('squad_battles')
    .insert({
      squad_id: request.squad_id,
      difficulty: request.difficulty,
      battle_type: request.battle_type,
      subtest_code: request.subtest_code || null,
      question_count: request.question_count || null,
      total_questions: shuffled.length,
      time_limit_minutes: request.time_limit_minutes || 15,
      scheduled_start_at: request.scheduled_start_at || null,
      status,
      started_at: startedAt
    })
    .select()
    .single()
  
  if (battleError) throw battleError
  
  // Link questions to battle
  const battleQuestions = shuffled.map((q, index) => ({
    battle_id: battle.id,
    question_id: q.id,
    question_order: index + 1
  }))
  
  const { error: linkError } = await supabase
    .from('squad_battle_questions')
    .insert(battleQuestions)
  
  if (linkError) throw linkError
  
  // Get squad members and create participants
  const { data: members } = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', request.squad_id)
    .eq('is_active', true)
  
  if (members) {
    const participants = members.map(m => ({
      battle_id: battle.id,
      user_id: m.user_id,
      total_questions: shuffled.length
    }))
    
    await supabase
      .from('squad_battle_participants')
      .insert(participants)
  }
  
  // Return battle with questions
  const questionsWithOrder = shuffled.map((q, index) => ({
    id: '',
    battle_id: battle.id,
    question_id: q.id,
    question_order: index + 1,
    created_at: new Date().toISOString(),
    question: q
  }))
  
  return { battle, questions: questionsWithOrder }
}

/**
 * Get battle details with questions
 */
export async function getBattleDetails(battleId: string): Promise<{ battle: SquadBattle, questions: SquadBattleQuestion[] }> {
  const { data: battle, error: battleError } = await supabase
    .from('squad_battles')
    .select('*')
    .eq('id', battleId)
    .single()
  
  if (battleError) throw battleError
  
  const { data: questions, error: questionsError } = await supabase
    .from('squad_battle_questions')
    .select(`
      *,
      question_bank (*)
    `)
    .eq('battle_id', battleId)
    .order('question_order')
  
  if (questionsError) throw questionsError
  
  type QuestionRow = Omit<SquadBattleQuestion, 'question'> & { question_bank?: SquadBattleQuestion['question'] }
  const questionRows = (questions ?? []) as unknown as QuestionRow[]
  const questionsWithData = questionRows.map((q) => ({
    ...q,
    question: q.question_bank
  }))
  
  return { battle, questions: questionsWithData }
}

/**
 * Submit answer for a battle question
 */
export async function submitBattleAnswer(
  userId: string,
  request: SubmitAnswerRequest
): Promise<{ is_correct: boolean, correct_answer: string }> {
  // Get question details
  const { data: question } = await supabase
    .from('question_bank')
    .select('correct_answer')
    .eq('id', request.question_id)
    .single()
  
  if (!question) throw new Error('Question not found')
  
  const isCorrect = request.selected_answer === question.correct_answer
  
  // Update participant score
  const { data: participant } = await supabase
    .from('squad_battle_participants')
    .select('*')
    .eq('battle_id', request.battle_id)
    .eq('user_id', userId)
    .single()
  
  if (participant) {
    const newScore = participant.score + (isCorrect ? 1 : 0)
    const newCorrect = participant.correct_answers + (isCorrect ? 1 : 0)
    const total = participant.total_questions || 10
    const newAccuracy = total > 0 ? (newCorrect / total) * 100 : 0
    
    await supabase
      .from('squad_battle_participants')
      .update({
        score: newScore,
        correct_answers: newCorrect,
        accuracy: newAccuracy
      })
      .eq('id', participant.id)
  }
  
  // Record in student_progress
  await supabase
    .from('student_progress')
    .insert({
      student_id: userId,
      question_id: request.question_id,
      assessment_type: 'squad_battle',
      is_correct: isCorrect,
      time_spent_seconds: request.time_spent_seconds,
      answered_at: new Date().toISOString()
    })
  
  return {
    is_correct: isCorrect,
    correct_answer: question.correct_answer
  }
}

/**
 * Get live leaderboard for a battle
 */
export async function getBattleLeaderboard(battleId: string, userId: string): Promise<SquadBattleLeaderboard> {
  const { data: participants, error } = await supabase
    .from('squad_battle_participants')
    .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
    .eq('battle_id', battleId)
    .order('score', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
  
  if (error) throw error
  
  // Calculate ranks
  type ParticipantRow = SquadBattleParticipant & {
    users?: { id: string; full_name?: string | null; email?: string | null }
  }
  const participantRows = (participants ?? []) as unknown as ParticipantRow[]
  const ranked = participantRows.map((p, index) => ({
    ...p,
    rank: index + 1,
    user_name: p.users?.full_name || p.users?.email || 'Unknown',
    is_current_user: p.user_id === userId
  }))
  
  const currentUserRank = ranked.find(p => p.user_id === userId)?.rank || null
  
  return {
    battle_id: battleId,
    participants: ranked,
    current_user_rank: currentUserRank,
    total_participants: ranked.length,
    updated_at: new Date().toISOString()
  }
}

/**
 * Complete a battle
 */
export async function completeBattle(userId: string, battleId: string): Promise<void> {
  // Update participant completion
  await supabase
    .from('squad_battle_participants')
    .update({
      completed_at: new Date().toISOString()
    })
    .eq('battle_id', battleId)
    .eq('user_id', userId)
  
  // Check if all participants completed
  const { data: participants } = await supabase
    .from('squad_battle_participants')
    .select('completed_at')
    .eq('battle_id', battleId)
  
  const allCompleted = participants?.every(p => p.completed_at !== null)
  
  if (allCompleted) {
    // Mark battle as completed
    await supabase
      .from('squad_battles')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', battleId)
  }
}

/**
 * Get user's battle history
 */
export async function getUserBattleHistory(userId: string, supabaseClient?: SupabaseClient): Promise<SquadBattleHistory[]> {
  const client = supabaseClient || supabase
  const { data, error } = await client
    .from('squad_battle_participants')
    .select(`
      battle_id,
      score,
      accuracy,
      rank,
      squad_battles (
        id,
        difficulty,
        started_at,
        squad_id,
        squads (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  
  type HistoryRow = {
    battle_id: string
    score: number | null
    accuracy: number | null
    rank: number | null
    squad_battles?: {
      id: string
      difficulty?: string | null
      started_at?: string | null
      squad_id?: string
      squads?: { name?: string | null }
    }
  }
  const rows = (data ?? []) as unknown as HistoryRow[]
  return rows.map((item) => ({
    battle_id: item.battle_id,
    squad_name: item.squad_battles?.squads?.name || 'Unknown Squad',
    date: item.squad_battles?.started_at || '',
    rank: item.rank || 0,
    score: item.score || 0,
    accuracy: item.accuracy || 0,
    total_participants: 0,
    difficulty: (item.squad_battles?.difficulty as SquadBattle['difficulty']) || 'medium'
  }))
}
