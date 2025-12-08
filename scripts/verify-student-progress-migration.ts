/**
 * Verification script for student_progress schema migration
 * 
 * This script verifies that migration 003_update_student_progress_schema.sql
 * was executed successfully by checking:
 * 1. New columns exist (daily_challenge_mode, focus_subtest_code)
 * 2. Indexes were created
 * 3. Constraints are in place
 * 4. Data integrity is maintained
 * 
 * Run with: npx tsx scripts/verify-student-progress-migration.ts
 */

import { supabase } from '../src/lib/supabase'

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface IndexInfo {
  indexname: string
  indexdef: string
}

interface ConstraintInfo {
  constraint_name: string
  constraint_definition: string
}

async function verifyColumns(): Promise<boolean> {
  console.log('\n📋 Verifying columns...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'student_progress' 
        AND column_name IN ('daily_challenge_mode', 'focus_subtest_code')
      ORDER BY column_name
    `
  })

  if (error) {
    console.error('❌ Error checking columns:', error.message)
    return false
  }

  const columns = data as ColumnInfo[]
  
  if (columns.length !== 2) {
    console.error(`❌ Expected 2 columns, found ${columns.length}`)
    return false
  }

  const dailyChallengeMode = columns.find(c => c.column_name === 'daily_challenge_mode')
  const focusSubtestCode = columns.find(c => c.column_name === 'focus_subtest_code')

  if (!dailyChallengeMode) {
    console.error('❌ Column daily_challenge_mode not found')
    return false
  }

  if (!focusSubtestCode) {
    console.error('❌ Column focus_subtest_code not found')
    return false
  }

  console.log('✅ daily_challenge_mode column exists')
  console.log(`   Type: ${dailyChallengeMode.data_type}`)
  console.log(`   Nullable: ${dailyChallengeMode.is_nullable}`)
  
  console.log('✅ focus_subtest_code column exists')
  console.log(`   Type: ${focusSubtestCode.data_type}`)
  console.log(`   Nullable: ${focusSubtestCode.is_nullable}`)

  return true
}

async function verifyIndexes(): Promise<boolean> {
  console.log('\n🔍 Verifying indexes...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes
      WHERE tablename = 'student_progress'
        AND indexname LIKE 'idx_student_progress_%'
      ORDER BY indexname
    `
  })

  if (error) {
    console.error('❌ Error checking indexes:', error.message)
    return false
  }

  const indexes = data as IndexInfo[]
  
  const expectedIndexes = [
    'idx_student_progress_subtest_code',
    'idx_student_progress_assessment_type',
    'idx_student_progress_user_subtest',
    'idx_student_progress_user_mode'
  ]

  let allFound = true
  for (const expectedIndex of expectedIndexes) {
    const found = indexes.find(idx => idx.indexname === expectedIndex)
    if (found) {
      console.log(`✅ Index ${expectedIndex} exists`)
    } else {
      console.error(`❌ Index ${expectedIndex} not found`)
      allFound = false
    }
  }

  return allFound
}

async function verifyConstraints(): Promise<boolean> {
  console.log('\n🔒 Verifying constraints...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'student_progress'::regclass
        AND (conname LIKE '%daily_challenge_mode%' OR conname LIKE '%focus_mode%')
      ORDER BY conname
    `
  })

  if (error) {
    console.error('❌ Error checking constraints:', error.message)
    return false
  }

  const constraints = data as ConstraintInfo[]
  
  if (constraints.length === 0) {
    console.error('❌ No constraints found')
    return false
  }

  console.log(`✅ Found ${constraints.length} constraint(s)`)
  constraints.forEach(c => {
    console.log(`   - ${c.constraint_name}`)
  })

  return true
}

async function testDataIntegrity(): Promise<boolean> {
  console.log('\n🧪 Testing data integrity...')
  
  // Test 1: Try to insert balanced mode with focus_subtest_code (should fail)
  console.log('Test 1: Balanced mode with focus_subtest_code (should fail)...')
  const { error: error1 } = await supabase
    .from('student_progress')
    .insert({
      user_id: 'test-user-verify',
      assessment_type: 'daily_challenge',
      daily_challenge_mode: 'balanced',
      focus_subtest_code: 'PPU',
      subtest_code: 'PPU',
      is_correct: true
    })

  if (error1) {
    console.log('✅ Constraint correctly prevented invalid data')
  } else {
    console.error('❌ Constraint failed to prevent invalid data')
    // Clean up test data
    await supabase
      .from('student_progress')
      .delete()
      .eq('user_id', 'test-user-verify')
    return false
  }

  // Test 2: Try to insert focus mode without focus_subtest_code (should fail)
  console.log('Test 2: Focus mode without focus_subtest_code (should fail)...')
  const { error: error2 } = await supabase
    .from('student_progress')
    .insert({
      user_id: 'test-user-verify',
      assessment_type: 'daily_challenge',
      daily_challenge_mode: 'focus',
      focus_subtest_code: null,
      subtest_code: 'PPU',
      is_correct: true
    })

  if (error2) {
    console.log('✅ Constraint correctly prevented invalid data')
  } else {
    console.error('❌ Constraint failed to prevent invalid data')
    // Clean up test data
    await supabase
      .from('student_progress')
      .delete()
      .eq('user_id', 'test-user-verify')
    return false
  }

  // Test 3: Insert valid balanced mode record (should succeed)
  console.log('Test 3: Valid balanced mode record (should succeed)...')
  const { error: error3 } = await supabase
    .from('student_progress')
    .insert({
      user_id: 'test-user-verify',
      assessment_type: 'daily_challenge',
      daily_challenge_mode: 'balanced',
      focus_subtest_code: null,
      subtest_code: 'PPU',
      is_correct: true
    })

  if (!error3) {
    console.log('✅ Valid balanced mode record inserted successfully')
    // Clean up
    await supabase
      .from('student_progress')
      .delete()
      .eq('user_id', 'test-user-verify')
  } else {
    console.error('❌ Failed to insert valid balanced mode record:', error3.message)
    return false
  }

  // Test 4: Insert valid focus mode record (should succeed)
  console.log('Test 4: Valid focus mode record (should succeed)...')
  const { error: error4 } = await supabase
    .from('student_progress')
    .insert({
      user_id: 'test-user-verify',
      assessment_type: 'daily_challenge',
      daily_challenge_mode: 'focus',
      focus_subtest_code: 'PPU',
      subtest_code: 'PPU',
      is_correct: true
    })

  if (!error4) {
    console.log('✅ Valid focus mode record inserted successfully')
    // Clean up
    await supabase
      .from('student_progress')
      .delete()
      .eq('user_id', 'test-user-verify')
  } else {
    console.error('❌ Failed to insert valid focus mode record:', error4.message)
    return false
  }

  return true
}

async function main() {
  console.log('🚀 Starting student_progress migration verification...')
  console.log('=' .repeat(60))

  const results = {
    columns: await verifyColumns(),
    indexes: await verifyIndexes(),
    constraints: await verifyConstraints(),
    dataIntegrity: await testDataIntegrity()
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Verification Summary:')
  console.log('=' .repeat(60))
  console.log(`Columns:        ${results.columns ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Indexes:        ${results.indexes ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Constraints:    ${results.constraints ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Data Integrity: ${results.dataIntegrity ? '✅ PASS' : '❌ FAIL'}`)
  console.log('=' .repeat(60))

  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    console.log('\n✅ All verification checks passed!')
    console.log('Migration 003 was executed successfully.')
    process.exit(0)
  } else {
    console.log('\n❌ Some verification checks failed.')
    console.log('Please review the migration and try again.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Verification script failed:', error)
  process.exit(1)
})
