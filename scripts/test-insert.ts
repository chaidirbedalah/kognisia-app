/**
 * Test insert to student_progress
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🧪 Testing insert...\n')
  
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
  
  console.log(`User ID: ${userData.id}`)
  console.log(`Question ID: ${questionData.id}`)
  
  // Try different column names
  const testRecords = [
    {
      student_id: userData.id,
      question_id: questionData.id,
      is_correct: true,
      hint_used: false,
      solution_viewed: false,
      time_spent: 60
    },
    {
      user_id: userData.id,
      question_id: questionData.id,
      is_correct: true,
      hint_used: false,
      solution_viewed: false,
      time_spent: 60
    }
  ]
  
  for (let i = 0; i < testRecords.length; i++) {
    console.log(`\nTrying record ${i + 1}...`)
    const { data, error } = await supabase
      .from('student_progress')
      .insert(testRecords[i])
      .select()
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
    } else {
      console.log(`✅ Success!`)
      console.log('Columns:', Object.keys(data[0]))
      
      // Clean up
      await supabase
        .from('student_progress')
        .delete()
        .eq('id', data[0].id)
      
      break
    }
  }
}

main()
