import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkTopicsTable() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔍 Checking topics table structure...')

  // Get sample topic to see structure
  const { data: sampleTopic, error } = await supabase
    .from('topics')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error fetching topics:', error)
    return
  }

  if (sampleTopic && sampleTopic.length > 0) {
    console.log('📋 Topics table columns:')
    console.log(Object.keys(sampleTopic[0]))
    console.log('\nSample topic:')
    console.log(JSON.stringify(sampleTopic[0], null, 2))
  } else {
    console.log('📋 Topics table is empty')
  }

  // Count topics
  const { count } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total topics: ${count}`)
}

checkTopicsTable().catch(console.error)