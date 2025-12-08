/**
 * Check Question Bank Data
 * Quick script to check if question bank has data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Checking question bank...\n')
  
  // Check total count
  const { count, error } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`📊 Total questions: ${count}`)
  
  // Check by subtest_code
  const { data: subtestData } = await supabase
    .from('question_bank')
    .select('subtest_code')
  
  if (subtestData) {
    const subtestCounts: Record<string, number> = {}
    subtestData.forEach(q => {
      const code = q.subtest_code || 'NULL'
      subtestCounts[code] = (subtestCounts[code] || 0) + 1
    })
    
    console.log('\n📋 Questions by subtest:')
    Object.entries(subtestCounts).forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })
  }
  
  // Sample a few questions
  const { data: samples } = await supabase
    .from('question_bank')
    .select('id, subtest_code, question_text')
    .limit(3)
  
  if (samples && samples.length > 0) {
    console.log('\n📝 Sample questions:')
    samples.forEach((q, i) => {
      console.log(`  ${i + 1}. [${q.subtest_code}] ${q.question_text?.substring(0, 50)}...`)
    })
  }
}

main()
