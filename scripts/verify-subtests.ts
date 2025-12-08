/**
 * Verification Script for Subtests Table
 * 
 * Run this script to verify that the subtests table was created correctly
 * and contains the expected UTBK 2026 data.
 * 
 * Usage: node --loader ts-node/esm scripts/verify-subtests.ts
 * Or: npx ts-node scripts/verify-subtests.ts
 */

import { supabase } from '../src/lib/supabase.js'
import { UTBK_2026_SUBTESTS } from '../src/lib/utbk-constants.js'

async function verifySubtests() {
  console.log('🔍 Verifying subtests table...\n')

  try {
    // Check if table exists and fetch all subtests
    const { data: subtests, error } = await supabase
      .from('subtests')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ Error fetching subtests:', error.message)
      process.exit(1)
    }

    if (!subtests || subtests.length === 0) {
      console.error('❌ No subtests found in database')
      console.log('💡 Please run the migration: database/migrations/001_create_subtests_table.sql')
      process.exit(1)
    }

    // Verify count
    console.log(`✅ Found ${subtests.length} subtests`)
    if (subtests.length !== 6) {
      console.error(`❌ Expected 6 subtests, found ${subtests.length}`)
      process.exit(1)
    }

    // Verify each subtest
    console.log('\n📋 Subtest Details:')
    console.log('─'.repeat(80))
    
    let totalQuestions = 0
    let totalMinutes = 0

    for (const subtest of subtests) {
      const expected = UTBK_2026_SUBTESTS.find(s => s.code === subtest.code)
      
      console.log(`\n${subtest.icon} ${subtest.name} (${subtest.code})`)
      console.log(`   Order: ${subtest.display_order}`)
      console.log(`   Questions: ${subtest.utbk_question_count}`)
      console.log(`   Duration: ${subtest.utbk_duration_minutes} minutes`)
      
      totalQuestions += subtest.utbk_question_count
      totalMinutes += subtest.utbk_duration_minutes

      // Verify against expected values
      if (expected) {
        if (subtest.name !== expected.name) {
          console.log(`   ⚠️  Name mismatch: expected "${expected.name}"`)
        }
        if (subtest.utbk_question_count !== expected.utbkQuestionCount) {
          console.log(`   ⚠️  Question count mismatch: expected ${expected.utbkQuestionCount}`)
        }
        if (subtest.utbk_duration_minutes !== expected.utbkDurationMinutes) {
          console.log(`   ⚠️  Duration mismatch: expected ${expected.utbkDurationMinutes}`)
        }
      } else {
        console.log(`   ⚠️  Unexpected subtest code: ${subtest.code}`)
      }
    }

    console.log('\n' + '─'.repeat(80))
    console.log(`\n📊 Totals:`)
    console.log(`   Total Questions: ${totalQuestions} (expected: 160)`)
    console.log(`   Total Duration: ${totalMinutes} minutes (expected: 195)`)

    // Verify totals
    if (totalQuestions !== 160) {
      console.error(`\n❌ Total questions mismatch: expected 160, got ${totalQuestions}`)
      process.exit(1)
    }

    if (totalMinutes !== 195) {
      console.error(`\n❌ Total duration mismatch: expected 195, got ${totalMinutes}`)
      process.exit(1)
    }

    console.log('\n✅ All verifications passed!')
    console.log('🎉 Subtests table is correctly configured for UTBK 2026\n')

  } catch (error) {
    console.error('❌ Exception during verification:', error)
    process.exit(1)
  }
}

// Run verification
verifySubtests()
