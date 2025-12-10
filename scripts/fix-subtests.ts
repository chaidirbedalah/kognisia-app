import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { UTBK_2026_SUBTESTS } from '../src/lib/utbk-constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function fixSubtests() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔧 Fixing subtests...')

  // Check existing subtests
  const { data: existing } = await supabase
    .from('subtests')
    .select('code')

  const existingCodes = new Set(existing?.map(s => s.code) || [])

  // Insert missing subtests
  const missing = UTBK_2026_SUBTESTS.filter(s => !existingCodes.has(s.code))

  if (missing.length > 0) {
    console.log(`📝 Inserting ${missing.length} missing subtests...`)
    
    for (const subtest of missing) {
      console.log(`  Adding: ${subtest.code} - ${subtest.name}`)
      
      const { error } = await supabase
        .from('subtests')
        .insert({
          code: subtest.code,
          name: subtest.name,
          description: subtest.description,
          display_order: subtest.displayOrder,
          utbk_question_count: subtest.utbkQuestionCount,
          utbk_duration_minutes: subtest.utbkDurationMinutes
        })

      if (error) {
        console.error(`❌ Error inserting ${subtest.code}:`, error)
      } else {
        console.log(`✅ Added ${subtest.code}`)
      }
    }
  } else {
    console.log('✅ All subtests already exist')
  }

  // Verify final count
  const { data: final } = await supabase
    .from('subtests')
    .select('code, name')
    .order('display_order')

  console.log(`\n📊 Final count: ${final?.length || 0} subtests`)
  if (final) {
    final.forEach((s, i) => console.log(`  ${i + 1}. ${s.code} - ${s.name}`))
  }
}

fixSubtests().catch(console.error)