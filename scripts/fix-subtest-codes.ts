/**
 * Fix subtest_code in existing student_progress records
 * Maps question_id to subtest_utbk from question_bank
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  console.log('🔧 Fixing subtest_code in student_progress...\n')
  
  // Get all progress records
  const { data: progressRecords, error: progressError } = await supabase
    .from('student_progress')
    .select('id, question_id, subtest_code')
  
  if (progressError || !progressRecords) {
    console.error('❌ Error fetching progress:', progressError)
    return
  }
  
  console.log(`📊 Found ${progressRecords.length} progress records`)
  
  // Get all questions with subtest_utbk
  const questionIds = progressRecords.map(p => p.question_id)
  const { data: questions, error: questionError } = await supabase
    .from('question_bank')
    .select('id, subtest_utbk')
    .in('id', questionIds)
  
  if (questionError || !questions) {
    console.error('❌ Error fetching questions:', questionError)
    return
  }
  
  // Create map of question_id -> subtest_utbk
  const questionMap = new Map<string, string>()
  questions.forEach(q => {
    questionMap.set(q.id, q.subtest_utbk)
  })
  
  console.log(`📋 Found ${questions.length} questions with subtest info`)
  
  // Update each progress record
  let updated = 0
  let skipped = 0
  
  for (const record of progressRecords) {
    const subtestCode = questionMap.get(record.question_id)
    
    if (subtestCode && subtestCode !== record.subtest_code) {
      const { error } = await supabase
        .from('student_progress')
        .update({ subtest_code: subtestCode })
        .eq('id', record.id)
      
      if (error) {
        console.error(`❌ Error updating record ${record.id}:`, error.message)
      } else {
        updated++
        if (updated % 50 === 0) {
          console.log(`  ✓ Updated ${updated} records...`)
        }
      }
    } else {
      skipped++
    }
  }
  
  console.log(`\n✅ Update complete!`)
  console.log(`  • Updated: ${updated} records`)
  console.log(`  • Skipped: ${skipped} records`)
  
  // Verify
  const { data: verification } = await supabase
    .from('student_progress')
    .select('subtest_code')
  
  if (verification) {
    const subtestCounts: Record<string, number> = {}
    verification.forEach(p => {
      const code = p.subtest_code || 'NULL'
      subtestCounts[code] = (subtestCounts[code] || 0) + 1
    })
    
    console.log('\n📊 Subtest distribution:')
    Object.entries(subtestCounts).sort().forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })
  }
}

main()
