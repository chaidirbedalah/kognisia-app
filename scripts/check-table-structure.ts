import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkTableStructure() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔍 Checking question_bank table structure...')
    
    // Get column information
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'question_bank' })
    
    if (error) {
      console.error('Error getting columns:', error)
      
      // Try alternative approach
      console.log('\n🔄 Trying direct query...')
      const { data: sampleData, error: sampleError } = await supabase
        .from('question_bank')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.error('Error querying sample:', sampleError)
      } else if (sampleData && sampleData.length > 0) {
        console.log('✅ Sample question structure:')
        console.log(JSON.stringify(sampleData[0], null, 2))
      }
    } else {
      console.log('✅ Table columns:')
      columns?.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }
    
    // Check if topics table exists
    console.log('\n🔍 Checking topics table...')
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsError) {
      console.error('Topics table error:', topicsError)
    } else {
      console.log('✅ Topics table exists')
    }
    
  } catch (error) {
    console.error('Connection error:', error)
  }
}

checkTableStructure()