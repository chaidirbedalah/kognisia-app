/**
 * Simple insert test with minimal fields
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🧪 Simple insert test...\n')
  
  // Get test user
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'test@kognisia.com')
    .single()
  
  if (!userData) {
    console.error('❌ Test user not found')
    return
  }
  
  // Get a question
  const { data: questionData } = await supabase
    .from('question_bank')
    .select('id')
    .limit(1)
    .single()
  
  if (!questionData) {
    console.error('❌ No questions found')
    return
  }
  
  // Try minimal insert
  const { data, error } = await supabase
    .from('student_progress')
    .insert({
      user_id: userData.id,
      question_id: questionData.id,
      is_correct: true
    })
    .select()
  
  if (error) {
    console.log(`❌ Error: ${error.message}`)
    console.log('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log(`✅ Success!`)
    console.log('Record:', data[0])
    console.log('\n📋 Available columns:')
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]}`)
    })
    
    // Clean up
    await supabase
      .from('student_progress')
      .delete()
      .eq('id', data[0].id)
  }
}

main()
