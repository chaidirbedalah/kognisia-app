import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const { count } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 Total student_progress records: ${count}`)
  
  if (count && count > 0) {
    const { data } = await supabase
      .from('student_progress')
      .select('subtest_code, assessment_type')
      .limit(10)
    
    console.log('\n📋 Sample records:')
    data?.forEach((r, i) => {
      console.log(`  ${i + 1}. subtest_code: ${r.subtest_code || 'NULL'}, assessment_type: ${r.assessment_type || 'NULL'}`)
    })
  }
}

main()
