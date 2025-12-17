import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

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
}

function validateQuestions(questions: QuestionData[]): string[] {
  const errors: string[] = []
  
  questions.forEach((q, index) => {
    const qNum = index + 1
    
    // Check required fields
    if (!q.question_text?.trim()) {
      errors.push(`Question ${qNum}: question_text is required`)
    }
    
    if (!q.correct_answer || !['A', 'B', 'C', 'D', 'E'].includes(q.correct_answer)) {
      errors.push(`Question ${qNum}: correct_answer must be A, B, C, D, or E`)
    }
    
    if (!q.subtest_utbk || !['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'].includes(q.subtest_utbk)) {
      errors.push(`Question ${qNum}: subtest_utbk must be one of PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM`)
    }
    
    if (typeof q.is_hots !== 'boolean') {
      errors.push(`Question ${qNum}: is_hots must be true or false`)
    }
    
    // Check options
    const options = [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e]
    if (options.some(opt => !opt?.trim())) {
      errors.push(`Question ${qNum}: All options (A-E) are required`)
    }
    
    // Check if correct answer matches one of the options
    const optionMap: Record<string, string> = {
      'A': q.option_a,
      'B': q.option_b,
      'C': q.option_c,
      'D': q.option_d,
      'E': q.option_e
    }
    
    if (optionMap[q.correct_answer]?.trim() !== optionMap[q.correct_answer]?.trim()) {
      errors.push(`Question ${qNum}: correct_answer ${q.correct_answer} doesn't match option content`)
    }
  })
  
  return errors
}

async function importQuestionsSimple(filePath: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('📚 Starting simple question import...')
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

    // Prepare questions for import (only required fields)
    const questionsForImport = questions.map(q => ({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      option_e: q.option_e,
      correct_answer: q.correct_answer,
      subtest_utbk: q.subtest_utbk,
      is_hots: q.is_hots,
      hint_text: q.hint_text || null,
      solution_steps: q.solution_steps || null,
      question_image_url: q.question_image_url || null
    }))

    // Import in batches of 50
    const batchSize = 50
    let imported = 0
    let errors = 0

    for (let i = 0; i < questionsForImport.length; i += batchSize) {
      const batch = questionsForImport.slice(i, i + batchSize)
      
      console.log(`📤 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questionsForImport.length / batchSize)} (${batch.length} questions)`)

      const { data, error } = await supabase
        .from('question_bank')
        .insert(batch)
        .select()

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

    // Show breakdown by type
    console.log('\n🧠 Questions by type:')
    const typeCounts = questions.reduce((acc, q) => {
      const type = q.is_hots ? 'HOTS' : 'Regular'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(typeCounts).forEach(([type, count]) => {
      const percentage = ((count / questions.length) * 100).toFixed(1)
      console.log(`  ${type}: ${count} questions (${percentage}%)`)
    })

  } catch (error) {
    console.error('❌ Error during import:', error)
  }
}

// Run the import
const filePath = process.argv[2]
if (!filePath) {
  console.error('❌ Please provide file path: npm run import-simple <file-path>')
  process.exit(1)
}

importQuestionsSimple(filePath)