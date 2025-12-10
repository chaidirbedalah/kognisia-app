import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugQuestions() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔍 Debugging questions...')

  // Get sample questions to see structure
  const { data: sampleQuestions, error } = await supabase
    .from('question_bank')
    .select('*')
    .limit(3)

  if (error) {
    console.error('❌ Error fetching questions:', error)
    return
  }

  console.log('\n📋 Sample questions structure:')
  if (sampleQuestions && sampleQuestions.length > 0) {
    console.log('Columns:', Object.keys(sampleQuestions[0]))
    console.log('\nFirst question:')
    console.log(JSON.stringify(sampleQuestions[0], null, 2))
  }

  // Check for questions with null subtest_code
  const { count: nullSubtestCount } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })
    .is('subtest_code', null)

  console.log(`\n📊 Questions with null subtest_code: ${nullSubtestCount}`)

  // Check for questions with old 'subtest' column
  const { data: oldSubtestQuestions } = await supabase
    .from('question_bank')
    .select('subtest, subtest_code')
    .limit(5)

  if (oldSubtestQuestions) {
    console.log('\n📋 Old subtest vs new subtest_code:')
    oldSubtestQuestions.forEach((q, i) => {
      console.log(`  ${i + 1}. subtest: "${q.subtest}" -> subtest_code: "${q.subtest_code}"`)
    })
  }
}

debugQuestions().catch(console.error)