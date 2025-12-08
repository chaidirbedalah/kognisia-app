/**
 * Subtests API
 * 
 * Functions for fetching and working with UTBK 2026 subtests from the database
 */

import { supabase } from './supabase'
import { Subtest, UTBK_2026_SUBTESTS } from './utbk-constants'

export interface SubtestRecord {
  code: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  utbk_question_count: number
  utbk_duration_minutes: number
  created_at: string
  updated_at: string
}

/**
 * Fetch all subtests from the database
 * Falls back to constants if database is unavailable
 */
export async function fetchSubtests(): Promise<Subtest[]> {
  try {
    const { data, error } = await supabase
      .from('subtests')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching subtests from database:', error)
      // Fallback to constants
      return UTBK_2026_SUBTESTS
    }

    if (!data || data.length === 0) {
      console.warn('No subtests found in database, using constants')
      return UTBK_2026_SUBTESTS
    }

    // Transform database records to Subtest interface
    return data.map(record => ({
      code: record.code,
      name: record.name,
      description: record.description || '',
      icon: record.icon || '',
      displayOrder: record.display_order,
      utbkQuestionCount: record.utbk_question_count,
      utbkDurationMinutes: record.utbk_duration_minutes
    }))
  } catch (error) {
    console.error('Exception fetching subtests:', error)
    // Fallback to constants
    return UTBK_2026_SUBTESTS
  }
}

/**
 * Fetch a single subtest by code
 */
export async function fetchSubtestByCode(code: string): Promise<Subtest | null> {
  try {
    const { data, error } = await supabase
      .from('subtests')
      .select('*')
      .eq('code', code)
      .single()

    if (error) {
      console.error(`Error fetching subtest ${code}:`, error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      code: data.code,
      name: data.name,
      description: data.description || '',
      icon: data.icon || '',
      displayOrder: data.display_order,
      utbkQuestionCount: data.utbk_question_count,
      utbkDurationMinutes: data.utbk_duration_minutes
    }
  } catch (error) {
    console.error(`Exception fetching subtest ${code}:`, error)
    return null
  }
}

/**
 * Verify that the database has exactly 6 subtests
 */
export async function verifySubtestsCount(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('subtests')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error verifying subtests count:', error)
      return false
    }

    return count === 6
  } catch (error) {
    console.error('Exception verifying subtests count:', error)
    return false
  }
}

/**
 * Verify that total questions and duration match UTBK 2026 specs
 */
export async function verifySubtestsTotals(): Promise<{
  valid: boolean
  totalQuestions: number
  totalMinutes: number
}> {
  try {
    const subtests = await fetchSubtests()
    
    const totalQuestions = subtests.reduce((sum, s) => sum + s.utbkQuestionCount, 0)
    const totalMinutes = subtests.reduce((sum, s) => sum + s.utbkDurationMinutes, 0)

    return {
      valid: totalQuestions === 160 && totalMinutes === 195,
      totalQuestions,
      totalMinutes
    }
  } catch (error) {
    console.error('Exception verifying subtests totals:', error)
    return {
      valid: false,
      totalQuestions: 0,
      totalMinutes: 0
    }
  }
}
