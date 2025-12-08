/**
 * Data Migration Script: Update Question Bank with UTBK 2026 Subtest Codes
 * 
 * This script migrates all question_bank records to use the new 7-subtest
 * UTBK 2026 structure with proper subtest_code values.
 * 
 * Requirements: 10.5
 * 
 * Usage:
 *   npx tsx scripts/migrate-question-bank.ts [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Show what would be migrated without making changes
 *   --verbose   Show detailed logging for each question
 */

import { createClient } from '@supabase/supabase-js'
import { VALID_SUBTEST_CODES } from '../src/lib/types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isVerbose = args.includes('--verbose')

// ============================================================================
// LEGACY SUBTEST MAPPING
// ============================================================================

/**
 * Maps legacy subtest values to UTBK 2026 subtest codes
 */
const LEGACY_SUBTEST_MAPPING: Record<string, string> = {
  // Current UTBK 2026 codes (pass through)
  'PU': 'PU',
  'PPU': 'PPU',
  'PBM': 'PBM',
  'PK': 'PK',
  'LIT_INDO': 'LIT_INDO',
  'LIT_ING': 'LIT_ING',
  'PM': 'PM',
  
  // Legacy code variations
  'PENALARAN_UMUM': 'PU',
  'PENGETAHUAN_UMUM': 'PPU',
  'PEMAHAMAN_UMUM': 'PPU',
  'BACAAN_MENULIS': 'PBM',
  'PEMAHAMAN_BACAAN': 'PBM',
  'KUANTITATIF': 'PK',
  'PENGETAHUAN_KUANTITATIF': 'PK',
  'LITERASI_INDONESIA': 'LIT_INDO',
  'BAHASA_INDONESIA': 'LIT_INDO',
  'LITERASI_INGGRIS': 'LIT_ING',
  'BAHASA_INGGRIS': 'LIT_ING',
  'PENALARAN_MATEMATIKA': 'PM',
  'MATEMATIKA': 'PM'
}

/**
 * Maps a legacy subtest value to UTBK 2026 code
 */
function mapSubtestCode(legacyValue: string | null): string | null {
  if (!legacyValue) return null
  
  const normalized = legacyValue.toUpperCase().trim()
  return LEGACY_SUBTEST_MAPPING[normalized] || null
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

interface QuestionRecord {
  id: string
  subtest?: string
  subtest_code?: string
  topic?: string
  difficulty?: string
}

interface MigrationStats {
  total: number
  alreadyMigrated: number
  needsMigration: number
  successful: number
  failed: number
  unmapped: number
}

/**
 * Fetches all questions from the database
 */
async function fetchAllQuestions(): Promise<QuestionRecord[]> {
  console.log('📥 Fetching questions from database...')
  
  const { data, error } = await supabase
    .from('question_bank')
    .select('id, subtest, subtest_code, topic, difficulty')
    .order('id')
  
  if (error) {
    console.error('❌ Error fetching questions:', error)
    throw error
  }
  
  console.log(`✅ Fetched ${data.length} questions`)
  return data
}

/**
 * Analyzes questions and determines migration needs
 */
function analyzeQuestions(questions: QuestionRecord[]): MigrationStats {
  const stats: MigrationStats = {
    total: questions.length,
    alreadyMigrated: 0,
    needsMigration: 0,
    successful: 0,
    failed: 0,
    unmapped: 0
  }
  
  for (const question of questions) {
    // Check if already has valid subtest_code
    if (question.subtest_code && VALID_SUBTEST_CODES.includes(question.subtest_code as any)) {
      stats.alreadyMigrated++
    } else {
      stats.needsMigration++
      
      // Check if we can map it
      const mapped = mapSubtestCode(question.subtest || question.subtest_code || null)
      if (!mapped) {
        stats.unmapped++
      }
    }
  }
  
  return stats
}

/**
 * Migrates a single question
 */
async function migrateQuestion(question: QuestionRecord): Promise<boolean> {
  // Skip if already has valid subtest_code
  if (question.subtest_code && VALID_SUBTEST_CODES.includes(question.subtest_code as any)) {
    if (isVerbose) {
      console.log(`  ⏭️  Question ${question.id}: Already migrated (${question.subtest_code})`)
    }
    return true
  }
  
  // Try to map from subtest or subtest_code
  const sourceValue = question.subtest || question.subtest_code
  const mappedCode = mapSubtestCode(sourceValue || null)
  
  if (!mappedCode) {
    console.warn(`  ⚠️  Question ${question.id}: Cannot map "${sourceValue}" to valid subtest code`)
    return false
  }
  
  if (isVerbose) {
    console.log(`  🔄 Question ${question.id}: Mapping "${sourceValue}" → "${mappedCode}"`)
  }
  
  // Update in database (unless dry run)
  if (!isDryRun) {
    const { error } = await supabase
      .from('question_bank')
      .update({ subtest_code: mappedCode })
      .eq('id', question.id)
    
    if (error) {
      console.error(`  ❌ Question ${question.id}: Update failed:`, error.message)
      return false
    }
  }
  
  return true
}

/**
 * Migrates all questions
 */
async function migrateAllQuestions(questions: QuestionRecord[]): Promise<MigrationStats> {
  console.log('\n🔄 Starting migration...')
  
  const stats: MigrationStats = {
    total: questions.length,
    alreadyMigrated: 0,
    needsMigration: 0,
    successful: 0,
    failed: 0,
    unmapped: 0
  }
  
  for (const question of questions) {
    // Check if already migrated
    if (question.subtest_code && VALID_SUBTEST_CODES.includes(question.subtest_code as any)) {
      stats.alreadyMigrated++
      continue
    }
    
    stats.needsMigration++
    
    // Try to migrate
    const success = await migrateQuestion(question)
    
    if (success) {
      stats.successful++
    } else {
      stats.failed++
      stats.unmapped++
    }
  }
  
  return stats
}

/**
 * Verifies migration results
 */
async function verifyMigration(): Promise<void> {
  console.log('\n🔍 Verifying migration...')
  
  // Check for questions without subtest_code
  const { data: unmapped, error: unmappedError } = await supabase
    .from('question_bank')
    .select('id, subtest, subtest_code')
    .is('subtest_code', null)
  
  if (unmappedError) {
    console.error('❌ Error checking unmapped questions:', unmappedError)
    return
  }
  
  if (unmapped && unmapped.length > 0) {
    console.warn(`⚠️  Found ${unmapped.length} questions without subtest_code:`)
    unmapped.forEach(q => {
      console.warn(`   - Question ${q.id}: subtest="${q.subtest}"`)
    })
  } else {
    console.log('✅ All questions have subtest_code')
  }
  
  // Check for invalid subtest_codes
  const { data: invalid, error: invalidError } = await supabase
    .from('question_bank')
    .select('id, subtest_code')
    .not('subtest_code', 'in', `(${VALID_SUBTEST_CODES.join(',')})`)
  
  if (invalidError) {
    console.error('❌ Error checking invalid codes:', invalidError)
    return
  }
  
  if (invalid && invalid.length > 0) {
    console.warn(`⚠️  Found ${invalid.length} questions with invalid subtest_code:`)
    invalid.forEach(q => {
      console.warn(`   - Question ${q.id}: subtest_code="${q.subtest_code}"`)
    })
  } else {
    console.log('✅ All subtest_codes are valid')
  }
  
  // Show distribution
  const { data: distribution, error: distError } = await supabase
    .from('question_bank')
    .select('subtest_code')
  
  if (distError) {
    console.error('❌ Error checking distribution:', distError)
    return
  }
  
  if (distribution) {
    const counts = distribution.reduce((acc, q) => {
      const code = q.subtest_code || 'NULL'
      acc[code] = (acc[code] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n📊 Question distribution by subtest:')
    Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([code, count]) => {
        console.log(`   ${code}: ${count} questions`)
      })
  }
}

/**
 * Prints migration summary
 */
function printSummary(stats: MigrationStats): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total questions:        ${stats.total}`)
  console.log(`Already migrated:       ${stats.alreadyMigrated}`)
  console.log(`Needed migration:       ${stats.needsMigration}`)
  console.log(`Successfully migrated:  ${stats.successful}`)
  console.log(`Failed to migrate:      ${stats.failed}`)
  console.log(`Unmapped questions:     ${stats.unmapped}`)
  console.log('='.repeat(60))
  
  if (stats.unmapped > 0) {
    console.log('\n⚠️  WARNING: Some questions could not be mapped')
    console.log('Please review unmapped questions manually')
  }
  
  if (stats.failed === 0 && stats.unmapped === 0) {
    console.log('\n✅ Migration completed successfully!')
  } else {
    console.log('\n⚠️  Migration completed with warnings')
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Question Bank Migration Script')
  console.log('=' .repeat(60))
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }
  
  if (isVerbose) {
    console.log('📝 VERBOSE MODE - Detailed logging enabled')
  }
  
  console.log('=' .repeat(60))
  
  try {
    // Fetch all questions
    const questions = await fetchAllQuestions()
    
    // Analyze current state
    console.log('\n📊 Analyzing current state...')
    const preStats = analyzeQuestions(questions)
    console.log(`   Total questions: ${preStats.total}`)
    console.log(`   Already migrated: ${preStats.alreadyMigrated}`)
    console.log(`   Need migration: ${preStats.needsMigration}`)
    console.log(`   Cannot map: ${preStats.unmapped}`)
    
    if (preStats.needsMigration === 0) {
      console.log('\n✅ All questions already migrated!')
      return
    }
    
    // Perform migration
    const stats = await migrateAllQuestions(questions)
    
    // Verify results (only if not dry run)
    if (!isDryRun) {
      await verifyMigration()
    }
    
    // Print summary
    printSummary(stats)
    
    if (isDryRun) {
      console.log('\n💡 Run without --dry-run to apply changes')
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the script
main()
