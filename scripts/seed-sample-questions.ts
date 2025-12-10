import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { UTBK_2026_SUBTESTS } from '../src/lib/utbk-constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function seedSampleQuestions() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🌱 Seeding sample questions...')

  // Check existing questions
  const { count: existingCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Found ${existingCount} existing questions`)

  // Show breakdown by subtest
  console.log('\n📋 Questions per subtest:')
  for (const subtest of UTBK_2026_SUBTESTS) {
    const { count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('subtest_code', subtest.code)

    console.log(`  ${subtest.code}: ${count || 0} questions`)
  }

  if (existingCount && existingCount > 0) {
    console.log(`\n✅ Already have ${existingCount} questions, skipping seed`)
    return
  }

  // Create sample questions for each subtest and difficulty
  const difficulties = ['easy', 'medium', 'hard']
  const questionsPerSubtestPerDifficulty = 10

  for (const subtest of UTBK_2026_SUBTESTS) {
    console.log(`📝 Creating questions for ${subtest.code} - ${subtest.name}`)
    
    for (const difficulty of difficulties) {
      const questions = []
      
      for (let i = 1; i <= questionsPerSubtestPerDifficulty; i++) {
        questions.push({
          subtest_code: subtest.code,
          difficulty,
          topic: `Sample Topic ${i}`,
          question_text: `Sample question ${i} for ${subtest.name} (${difficulty} level). This is a placeholder question for testing purposes.`,
          option_a: 'Option A',
          option_b: 'Option B', 
          option_c: 'Option C',
          option_d: 'Option D',
          option_e: 'Option E',
          correct_answer: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
          explanation: `This is the explanation for the correct answer. Sample explanation for ${subtest.name} question.`,
          source: 'Sample Data',
          year: 2024
        })
      }

      console.log(`  Adding ${questions.length} ${difficulty} questions...`)
      
      const { error } = await supabase
        .from('question_bank')
        .insert(questions)

      if (error) {
        console.error(`❌ Error inserting ${difficulty} questions for ${subtest.code}:`, error)
      } else {
        console.log(`✅ Added ${questions.length} ${difficulty} questions for ${subtest.code}`)
      }
    }
  }

  // Verify final count
  const { count: finalCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total questions created: ${finalCount}`)

  // Show breakdown by subtest
  console.log('\n📋 Questions per subtest:')
  for (const subtest of UTBK_2026_SUBTESTS) {
    const { count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('subtest_code', subtest.code)

    console.log(`  ${subtest.code}: ${count || 0} questions`)
  }
}

seedSampleQuestions().catch(console.error)