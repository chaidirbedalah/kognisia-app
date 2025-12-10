import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface QuestionData {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'
  subtest_utbk: 'PU' | 'PPU' | 'PBM' | 'PK' | 'LIT_INDO' | 'LIT_ING' | 'PM'
  is_hots: boolean
  hint_text?: string
  solution_steps?: string
  question_image_url?: string
  difficulty?: 'easy' | 'medium' | 'hard' // For backward compatibility
  logic_clues?: string
  distractor_analysis?: string
}

async function importQuestions(filePath: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('📚 Starting question import...')
  console.log(`📁 Reading file: ${filePath}`)

  try {
    // Read and parse JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const questions: QuestionData[] = JSON.parse(fileContent)

    console.log(`📊 Found ${questions.length} questions to import`)

    // Validate questions
    const validationErrors = validateQuestions(questions)
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors found:')
      validationErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`)
      })
      return
    }

    console.log('✅ All questions passed validation')

    // Get or create default topic for each subtest
    const topicMap = await getOrCreateTopics(supabase, questions)

    // Add topic_id and default difficulty for backward compatibility
    const questionsWithTopics = questions.map(q => ({
      ...q,
      topic_id: topicMap[q.subtest_utbk],
      difficulty: q.difficulty || 'medium' // Default for backward compatibility
    }))

    // Import in batches of 50
    const batchSize = 50
    let imported = 0
    let errors = 0

    for (let i = 0; i < questionsWithTopics.length; i += batchSize) {
      const batch = questionsWithTopics.slice(i, i + batchSize)
      
      console.log(`📤 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questionsWithTopics.length / batchSize)} (${batch.length} questions)`)

      const { data, error } = await supabase
        .from('question_bank')
        .insert(batch)

      if (error) {
        console.error(`❌ Error importing batch:`, error)
        errors += batch.length
      } else {
        imported += batch.length
        console.log(`✅ Batch imported successfully`)
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n📊 Import Summary:')
    console.log(`✅ Successfully imported: ${imported} questions`)
    console.log(`❌ Failed to import: ${errors} questions`)
    console.log(`📈 Success rate: ${((imported / questions.length) * 100).toFixed(1)}%`)

    // Show breakdown by subtest
    console.log('\n📋 Questions by subtest:')
    const subtestCounts = questions.reduce((acc, q) => {
      acc[q.subtest_utbk] = (acc[q.subtest_utbk] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(subtestCounts).forEach(([subtest, count]) => {
      console.log(`  ${subtest}: ${count} questions`)
    })

  } catch (error) {
    console.error('❌ Error during import:', error)
  }
}

function validateQuestions(questions: QuestionData[]): string[] {
  const errors: string[] = []
  const validSubtests = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
  const validDifficulties = ['easy', 'medium', 'hard']
  const validAnswers = ['A', 'B', 'C', 'D', 'E']

  questions.forEach((question, index) => {
    const questionNum = index + 1

    // Required fields
    if (!question.question_text?.trim()) {
      errors.push(`Question ${questionNum}: question_text is required`)
    }
    if (!question.option_a?.trim()) {
      errors.push(`Question ${questionNum}: option_a is required`)
    }
    if (!question.option_b?.trim()) {
      errors.push(`Question ${questionNum}: option_b is required`)
    }
    if (!question.option_c?.trim()) {
      errors.push(`Question ${questionNum}: option_c is required`)
    }
    if (!question.option_d?.trim()) {
      errors.push(`Question ${questionNum}: option_d is required`)
    }
    if (!question.option_e?.trim()) {
      errors.push(`Question ${questionNum}: option_e is required`)
    }

    // Validate correct_answer
    if (!validAnswers.includes(question.correct_answer)) {
      errors.push(`Question ${questionNum}: correct_answer must be A, B, C, D, or E`)
    }

    // Validate subtest_utbk
    if (!validSubtests.includes(question.subtest_utbk)) {
      errors.push(`Question ${questionNum}: subtest_utbk must be one of ${validSubtests.join(', ')}`)
    }

    // Validate is_hots
    if (typeof question.is_hots !== 'boolean') {
      errors.push(`Question ${questionNum}: is_hots must be true or false`)
    }

    // Length validations
    if (question.question_text && question.question_text.length > 1000) {
      errors.push(`Question ${questionNum}: question_text too long (max 1000 characters)`)
    }
    if (question.hint_text && question.hint_text.length > 500) {
      errors.push(`Question ${questionNum}: hint_text too long (max 500 characters)`)
    }
    if (question.solution_steps && question.solution_steps.length > 1000) {
      errors.push(`Question ${questionNum}: solution_steps too long (max 1000 characters)`)
    }
  })

  return errors
}

async function getOrCreateTopics(supabase: any, questions: QuestionData[]): Promise<Record<string, string>> {
  const subtests = [...new Set(questions.map(q => q.subtest_utbk))]
  const topicMap: Record<string, string> = {}

  console.log('📋 Setting up topics for subtests...')

  // Get all existing topics
  const { data: existingTopics } = await supabase
    .from('topics')
    .select('id, name')

  // Create a simple mapping - use first available topic or create generic ones
  const subtestNames = {
    'PU': 'Penalaran Umum',
    'PPU': 'Pengetahuan & Pemahaman Umum', 
    'PBM': 'Pemahaman Bacaan & Menulis',
    'PK': 'Pengetahuan Kuantitatif',
    'LIT_INDO': 'Literasi Bahasa Indonesia',
    'LIT_ING': 'Literasi Bahasa Inggris',
    'PM': 'Penalaran Matematika'
  }

  for (const subtest of subtests) {
    const subtestName = subtestNames[subtest as keyof typeof subtestNames] || subtest
    
    // Try to find existing topic by name
    let existingTopic = existingTopics?.find(t => 
      t.name.toLowerCase().includes(subtestName.toLowerCase()) ||
      t.name.toLowerCase().includes(subtest.toLowerCase())
    )

    if (existingTopic) {
      topicMap[subtest] = existingTopic.id
      console.log(`✅ Found existing topic for ${subtest}: ${existingTopic.name}`)
    } else {
      // Create new topic with minimal fields
      const { data: newTopic, error } = await supabase
        .from('topics')
        .insert({
          name: subtestName,
          subject: 'UTBK 2026'
        })
        .select('id')
        .single()

      if (error) {
        console.error(`❌ Error creating topic for ${subtest}:`, error)
        // Use first available topic as fallback
        if (existingTopics && existingTopics.length > 0) {
          topicMap[subtest] = existingTopics[0].id
          console.log(`⚠️ Using fallback topic for ${subtest}: ${existingTopics[0].name}`)
        } else {
          throw error
        }
      } else {
        topicMap[subtest] = newTopic.id
        console.log(`✅ Created new topic for ${subtest}: ${subtestName}`)
      }
    }
  }

  return topicMap
}

async function showCurrentStats() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('📊 Current database statistics:')

  const { count: totalCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })

  console.log(`📚 Total questions: ${totalCount}`)

  // Count by subtest
  const subtests = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
  
  console.log('\n📋 Questions by subtest:')
  for (const subtest of subtests) {
    const { count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('subtest_utbk', subtest)

    console.log(`  ${subtest}: ${count || 0} questions`)
  }

  // Count by HOTS classification
  console.log('\n🧠 Questions by type:')
  
  const { count: hotsCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })
    .eq('is_hots', true)

  const { count: regularCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })
    .eq('is_hots', false)

  console.log(`  Regular (Non-HOTS): ${regularCount || 0} questions`)
  console.log(`  HOTS: ${hotsCount || 0} questions`)
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📚 Question Import Tool')
    console.log('\nUsage:')
    console.log('  npm run import-questions <file.json>  # Import questions from JSON file')
    console.log('  npm run import-questions --stats      # Show current database stats')
    console.log('\nExample:')
    console.log('  npm run import-questions questions/math-questions.json')
    return
  }

  if (args[0] === '--stats') {
    await showCurrentStats()
    return
  }

  const filePath = args[0]
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return
  }

  await importQuestions(filePath)
}

main().catch(console.error)