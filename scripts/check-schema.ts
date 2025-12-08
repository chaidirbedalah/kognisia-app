/**
 * Check student_progress schema
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Checking student_progress schema...\n')
  
  // Try to get one record to see columns
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  if (data && data.length > 0) {
    console.log('📋 Available columns:')
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}`)
    })
  } else {
    console.log('⚠️  No data in student_progress table')
  }
}

main()
