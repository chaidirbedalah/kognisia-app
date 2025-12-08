import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  // Get one question to see all columns
  const { data: sample } = await supabase
    .from('question_bank')
    .select('*')
    .limit(1)
  
  if (sample && sample.length > 0) {
    console.log('📋 Question columns:')
    Object.keys(sample[0]).forEach(col => {
      console.log(`  - ${col}: ${sample[0][col]}`)
    })
  }
  
  // Check student_progress subtest_code
  const { data: progress } = await supabase
    .from('student_progress')
    .select('subtest_code')
    .limit(10)
  
  if (progress) {
    console.log('\n📊 Student progress subtest_codes:')
    const codes = new Set(progress.map(p => p.subtest_code || 'NULL'))
    codes.forEach(code => console.log(`  - ${code}`))
  }
}

main()
