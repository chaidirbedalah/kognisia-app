import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { UTBK_2026_SUBTESTS } from '../src/lib/utbk-constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkSubtests() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔍 Checking subtests...')
  console.log(`📚 Constants has ${UTBK_2026_SUBTESTS.length} subtests`)

  // Check database subtests
  const { data: dbSubtests, error } = await supabase
    .from('subtests')
    .select('code, name, display_order')
    .order('display_order')

  if (error) {
    console.error('❌ Error fetching subtests:', error)
    return
  }

  console.log(`🗄️ Database has ${dbSubtests?.length || 0} subtests`)
  
  if (dbSubtests) {
    console.log('\n📋 Database subtests:')
    dbSubtests.forEach(subtest => {
      console.log(`  ${subtest.display_order}. ${subtest.code} - ${subtest.name}`)
    })
  }

  console.log('\n📋 Constants subtests:')
  UTBK_2026_SUBTESTS.forEach(subtest => {
    console.log(`  ${subtest.displayOrder}. ${subtest.code} - ${subtest.name}`)
  })

  // Check for missing subtests
  const dbCodes = new Set(dbSubtests?.map(s => s.code) || [])
  const constantCodes = new Set(UTBK_2026_SUBTESTS.map(s => s.code))

  const missingInDb = UTBK_2026_SUBTESTS.filter(s => !dbCodes.has(s.code))
  const extraInDb = dbSubtests?.filter(s => !constantCodes.has(s.code)) || []

  if (missingInDb.length > 0) {
    console.log('\n❌ Missing in database:')
    missingInDb.forEach(s => console.log(`  - ${s.code}: ${s.name}`))
  }

  if (extraInDb.length > 0) {
    console.log('\n⚠️ Extra in database:')
    extraInDb.forEach(s => console.log(`  - ${s.code}: ${s.name}`))
  }

  // Check questions for each subtest
  console.log('\n🔍 Checking questions per subtest...')
  for (const subtest of UTBK_2026_SUBTESTS) {
    const { count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('subtest_code', subtest.code)

    console.log(`  ${subtest.code}: ${count || 0} questions`)
  }
}

checkSubtests().catch(console.error)