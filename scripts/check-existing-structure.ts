import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkExistingStructure() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔍 Checking existing tables structure...')
    
    // Check topics table structure
    console.log('\n📋 Topics table:')
    const { data: topicsSample, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsError) {
      console.error('❌ Topics table error:', topicsError)
    } else if (topicsSample && topicsSample.length > 0) {
      console.log('Sample topics structure:')
      console.log(JSON.stringify(topicsSample[0], null, 2))
    }
    
    // Check question_bank structure
    console.log('\n📋 Question bank table:')
    const { data: questionSample, error: questionError } = await supabase
      .from('question_bank')
      .select('*')
      .limit(1)
    
    if (questionError) {
      console.error('❌ Question bank error:', questionError)
    } else if (questionSample && questionSample.length > 0) {
      console.log('Sample question structure:')
      console.log(JSON.stringify(questionSample[0], null, 2))
    }
    
    // Check if question_bank has topic_id
    console.log('\n🔍 Checking for topic_id column...')
    const { data: columnInfo, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'question_bank')
      .eq('column_name', 'topic_id')
    
    if (columnError) {
      console.error('❌ Error checking topic_id column:', columnError)
    } else if (columnInfo && columnInfo.length > 0) {
      console.log('✅ topic_id column exists:', columnInfo[0])
    } else {
      console.log('❌ topic_id column does not exist')
    }
    
  } catch (error) {
    console.error('Connection error:', error)
  }
}

checkExistingStructure()