/**
 * Seed Test Data Script
 * 
 * This script:
 * 1. Cleans existing student_progress data for test user
 * 2. Populates realistic test data for dashboard testing
 * 
 * Usage:
 *   npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test user email
const TEST_USER_EMAIL = 'andi@siswa.id'

// Subtest codes
const SUBTESTS = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']

/**
 * Get test user ID
 */
async function getTestUserId(): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_USER_EMAIL)
    .single()

  if (error || !data) {
    throw new Error(`Test user not found: ${TEST_USER_EMAIL}`)
  }

  return data.id
}

/**
 * Get random question IDs from question bank
 * Note: question_bank uses 'subtest_utbk' column, not 'subtest_code'
 */
async function getRandomQuestions(count: number, subtestCode?: string): Promise<string[]> {
  // First try with subtest_utbk if specified
  if (subtestCode) {
    const { data } = await supabase
      .from('question_bank')
      .select('id, subtest_utbk')
      .eq('subtest_utbk', subtestCode)
      .limit(count * 2)
    
    if (data && data.length > 0) {
      const shuffled = data.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count).map(q => q.id)
    }
  }
  
  // Fallback: get any questions
  const { data, error } = await supabase
    .from('question_bank')
    .select('id, subtest_utbk')
    .limit(count * 2)

  if (error || !data || data.length === 0) {
    console.warn(`⚠️  No questions found at all`)
    return []
  }

  // Shuffle and take only what we need
  const shuffled = data.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => q.id)
}

/**
 * Clean existing data for test user
 */
async function cleanExistingData(userId: string) {
  console.log('🧹 Cleaning existing data...')
  
  const { error } = await supabase
    .from('student_progress')
    .delete()
    .eq('student_id', userId)

  if (error) {
    console.error('❌ Error cleaning data:', error)
    throw error
  }

  console.log('✅ Existing data cleaned')
}

/**
 * Create progress records
 * Using actual schema column names:
 * - student_id (not user_id)
 * - hint_accessed (not hint_used)
 * - solution_accessed (not solution_viewed)
 * - time_spent_seconds (not time_spent)
 */
async function createProgressRecords(
  userId: string,
  questionIds: string[],
  assessmentType: string,
  subtestCode: string,
  date: Date,
  accuracyRate: number = 0.7
) {
  const records = questionIds.map(questionId => {
    const isCorrect = Math.random() < accuracyRate
    const hintAccessed = Math.random() < 0.2 // 20% chance
    const solutionAccessed = Math.random() < 0.1 // 10% chance
    const timeSpentSeconds = Math.floor(Math.random() * 120) + 30 // 30-150 seconds

    return {
      student_id: userId,
      question_id: questionId,
      assessment_type: assessmentType,
      subtest_code: subtestCode,
      is_correct: isCorrect,
      hint_accessed: hintAccessed,
      solution_accessed: solutionAccessed,
      time_spent_seconds: timeSpentSeconds,
      answered_at: date.toISOString(),
      created_at: date.toISOString()
    }
  })

  const { error } = await supabase
    .from('student_progress')
    .insert(records)

  if (error) {
    console.error(`❌ Error creating ${assessmentType} records:`, error)
    throw error
  }
}

/**
 * Seed Daily Challenge data (last 7 days)
 */
async function seedDailyChallenges(userId: string) {
  console.log('📚 Seeding Daily Challenge data...')
  
  const today = new Date()
  
  // Create daily challenges for last 7 days (to build streak)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(10, 0, 0, 0) // Set to 10 AM
    
    // Balanced mode: 3 questions per subtest (21 total)
    for (const subtest of SUBTESTS) {
      const questionIds = await getRandomQuestions(3, subtest)
      if (questionIds.length > 0) {
        await createProgressRecords(
          userId,
          questionIds,
          'daily_challenge',
          subtest,
          date,
          0.65 + Math.random() * 0.25 // 65-90% accuracy
        )
      }
    }
    
    console.log(`  ✓ Day ${i + 1}: ${date.toISOString().split('T')[0]}`)
  }
  
  console.log('✅ Daily Challenge data seeded (7 days, current streak: 7)')
}

/**
 * Seed Mini Try Out data
 */
async function seedMiniTryOuts(userId: string) {
  console.log('⚡ Seeding Mini Try Out data...')
  
  const dates = [
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  ]
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    date.setHours(14, 0, 0, 0) // Set to 2 PM
    
    // Mini Try Out: 10 questions per subtest (70 total)
    for (const subtest of SUBTESTS) {
      const questionIds = await getRandomQuestions(10, subtest)
      if (questionIds.length > 0) {
        await createProgressRecords(
          userId,
          questionIds,
          'mini_tryout',
          subtest,
          date,
          0.60 + Math.random() * 0.30 // 60-90% accuracy
        )
      }
    }
    
    console.log(`  ✓ Mini Try Out ${i + 1}: ${date.toISOString().split('T')[0]}`)
  }
  
  console.log('✅ Mini Try Out data seeded (3 sessions)')
}

/**
 * Seed Try Out UTBK data
 */
async function seedTryOutUTBK(userId: string) {
  console.log('📝 Seeding Try Out UTBK data...')
  
  const dates = [
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  ]
  
  // UTBK distribution
  const utbkDistribution: Record<string, number> = {
    'PU': 30,
    'PPU': 20,
    'PBM': 20,
    'PK': 20,
    'LIT_INDO': 30,
    'LIT_ING': 20,
    'PM': 20
  }
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    date.setHours(9, 0, 0, 0) // Set to 9 AM
    
    // Try Out UTBK: 160 questions total
    for (const subtest of SUBTESTS) {
      const count = utbkDistribution[subtest]
      const questionIds = await getRandomQuestions(count, subtest)
      if (questionIds.length > 0) {
        await createProgressRecords(
          userId,
          questionIds,
          'tryout_utbk',
          subtest,
          date,
          0.55 + Math.random() * 0.30 // 55-85% accuracy
        )
      }
    }
    
    console.log(`  ✓ Try Out UTBK ${i + 1}: ${date.toISOString().split('T')[0]}`)
  }
  
  console.log('✅ Try Out UTBK data seeded (2 sessions)')
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting test data seeding...\n')
  
  try {
    // Get test user ID
    console.log('👤 Finding test user...')
    const userId = await getTestUserId()
    console.log(`✅ Test user found: ${userId}\n`)
    
    // Clean existing data
    await cleanExistingData(userId)
    console.log('')
    
    // Seed data
    await seedDailyChallenges(userId)
    console.log('')
    
    await seedMiniTryOuts(userId)
    console.log('')
    
    await seedTryOutUTBK(userId)
    console.log('')
    
    console.log('🎉 Test data seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('  • Daily Challenges: 7 sessions (7-day streak)')
    console.log('  • Mini Try Outs: 3 sessions (70 questions each)')
    console.log('  • Try Out UTBK: 2 sessions (160 questions each)')
    console.log('  • Total questions: ~630 questions')
    console.log('\n✨ Dashboard should now show realistic test data!')
    
  } catch (error) {
    console.error('\n❌ Error seeding data:', error)
    process.exit(1)
  }
}

// Run the script
main()
