import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkQuestionsBySubtest() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔍 Checking questions by subtest_utbk...')

  // Get unique subtest_utbk values
  const { data: subtests } = await supabase
    .from('question_bank')
    .select('subtest_utbk')
    .not('subtest_utbk', 'is', null)

  const uniqueSubtests = [...new Set(subtests?.map(s => s.subtest_utbk) || [])]
  
  console.log('\n📋 Available subtests in question_bank:')
  for (const subtest of uniqueSubtests) {
    const { count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('subtest_utbk', subtest)

    console.log(`  ${subtest}: ${count || 0} questions`)
    
    // Check by difficulty
    const difficulties = ['easy', 'medium', 'hard']
    for (const difficulty of difficulties) {
      const { count: diffCount } = await supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .eq('subtest_utbk', subtest)
        .eq('difficulty', difficulty)
      
      console.log(`    ${difficulty}: ${diffCount || 0}`)
    }
  }
}

checkQuestionsBySubtest().catch(console.error)