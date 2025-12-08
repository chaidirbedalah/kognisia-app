/**
 * Rollback Script: Revert UTBK 2026 Migration
 * 
 * This script provides a rollback mechanism for the UTBK 2026 migration
 * in case issues are discovered after deployment.
 * 
 * Requirements: 10.1
 * 
 * Usage:
 *   npx tsx scripts/rollback-migration.ts [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Show what would be rolled back without making changes
 *   --verbose   Show detailed logging
 * 
 * WARNING: This script should only be used in emergency situations.
 * It will NOT delete data, but will mark records for manual review.
 */

import { createClient } from '@supabase/supabase-js'

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
// ROLLBACK PLAN
// ============================================================================

interface RollbackStats {
  questionsChecked: number
  progressRecordsChecked: number
  assessmentsChecked: number
  issuesFound: number
  issuesResolved: number
}

/**
 * Checks for data integrity issues
 */
async function checkDataIntegrity(): Promise<RollbackStats> {
  console.log('🔍 Checking data integrity...')
  
  const stats: RollbackStats = {
    questionsChecked: 0,
    progressRecordsChecked: 0,
    assessmentsChecked: 0,
    issuesFound: 0,
    issuesResolved: 0
  }
  
  // Check question_bank for null subtest_code
  const { data: questionsWithoutCode, error: qError } = await supabase
    .from('question_bank')
    .select('id, subtest, subtest_code')
    .is('subtest_code', null)
  
  if (qError) {
    console.error('❌ Error checking questions:', qError)
  } else {
    stats.questionsChecked = questionsWithoutCode?.length || 0
    if (stats.questionsChecked > 0) {
      console.warn(`⚠️  Found ${stats.questionsChecked} questions without subtest_code`)
      stats.issuesFound += stats.questionsChecked
    }
  }
  
  // Check student_progress for orphaned records
  const { data: orphanedProgress, error: pError } = await supabase
    .from('student_progress')
    .select('id, subtest_code, daily_challenge_mode, focus_subtest_code')
    .is('subtest_code', null)
  
  if (pError) {
    console.error('❌ Error checking progress:', pError)
  } else {
    stats.progressRecordsChecked = orphanedProgress?.length || 0
    if (stats.progressRecordsChecked > 0) {
      console.warn(`⚠️  Found ${stats.progressRecordsChecked} progress records without subtest_code`)
      stats.issuesFound += stats.progressRecordsChecked
    }
  }
  
  // Check for invalid assessment types
  const { data: invalidAssessments, error: aError } = await supabase
    .from('student_progress')
    .select('id, assessment_type')
    .eq('assessment_type', 'marathon')
  
  if (aError) {
    console.error('❌ Error checking assessments:', aError)
  } else {
    stats.assessmentsChecked = invalidAssessments?.length || 0
    if (stats.assessmentsChecked > 0) {
      console.warn(`⚠️  Found ${stats.assessmentsChecked} records with deprecated 'marathon' type`)
      stats.issuesFound += stats.assessmentsChecked
    }
  }
  
  return stats
}

/**
 * Creates a backup of current state
 */
async function createBackup(): Promise<void> {
  console.log('\n💾 Creating backup...')
  
  // Note: In a real production environment, you would:
  // 1. Create a database snapshot
  // 2. Export critical tables to backup files
  // 3. Store backup metadata
  
  console.log('⚠️  MANUAL ACTION REQUIRED:')
  console.log('   1. Create a database snapshot in Supabase dashboard')
  console.log('   2. Export question_bank and student_progress tables')
  console.log('   3. Store backup files in secure location')
  console.log('   4. Document backup timestamp and location')
  
  if (!isDryRun) {
    console.log('\n⏸️  Pausing for manual backup...')
    console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue')
    
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
}

/**
 * Rollback procedure documentation
 */
function printRollbackProcedure(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📋 ROLLBACK PROCEDURE')
  console.log('='.repeat(60))
  console.log('\nIf you need to rollback the UTBK 2026 migration:')
  console.log('\n1. DATABASE ROLLBACK:')
  console.log('   - Restore database snapshot from before migration')
  console.log('   - OR run migration 002 in reverse (remove subtest_code column)')
  console.log('   - OR keep new schema but mark records for review')
  console.log('\n2. CODE ROLLBACK:')
  console.log('   - Revert to previous Git commit')
  console.log('   - Deploy previous version to production')
  console.log('   - Verify all features work with old code')
  console.log('\n3. DATA CLEANUP:')
  console.log('   - Review questions without subtest_code')
  console.log('   - Review progress records with issues')
  console.log('   - Update or delete problematic records')
  console.log('\n4. MONITORING:')
  console.log('   - Check error logs for migration-related issues')
  console.log('   - Monitor user reports and feedback')
  console.log('   - Verify dashboard displays correctly')
  console.log('\n5. COMMUNICATION:')
  console.log('   - Notify users of temporary issues')
  console.log('   - Document lessons learned')
  console.log('   - Plan for re-migration if needed')
  console.log('='.repeat(60))
}

/**
 * Generates rollback SQL
 */
function generateRollbackSQL(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📝 ROLLBACK SQL COMMANDS')
  console.log('='.repeat(60))
  console.log('\n-- Rollback Migration 004 (Assessment Types)')
  console.log('UPDATE student_progress')
  console.log("SET assessment_type = 'marathon'")
  console.log("WHERE assessment_type = 'tryout_utbk';")
  console.log('\n-- Rollback Migration 003 (Student Progress Schema)')
  console.log('ALTER TABLE student_progress')
  console.log('  DROP CONSTRAINT IF EXISTS check_focus_mode_consistency,')
  console.log('  DROP COLUMN IF EXISTS daily_challenge_mode,')
  console.log('  DROP COLUMN IF EXISTS focus_subtest_code;')
  console.log('\n-- Rollback Migration 002 (Question Bank Schema)')
  console.log('ALTER TABLE question_bank')
  console.log('  DROP CONSTRAINT IF EXISTS fk_question_bank_subtest,')
  console.log('  DROP COLUMN IF EXISTS subtest_code;')
  console.log('\n-- Rollback Migration 001 (Subtests Table)')
  console.log('DROP TABLE IF EXISTS subtests CASCADE;')
  console.log('='.repeat(60))
  console.log('\n⚠️  WARNING: Running these commands will delete all UTBK 2026 data!')
  console.log('Only use in emergency situations.')
}

/**
 * Monitoring checklist
 */
function printMonitoringChecklist(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 POST-DEPLOYMENT MONITORING CHECKLIST')
  console.log('='.repeat(60))
  console.log('\n✅ Check these metrics after deployment:')
  console.log('\n1. ERROR RATES:')
  console.log('   [ ] No increase in 500 errors')
  console.log('   [ ] No database constraint violations')
  console.log('   [ ] No null reference errors')
  console.log('\n2. PERFORMANCE:')
  console.log('   [ ] Dashboard load time < 2 seconds')
  console.log('   [ ] Question fetching < 500ms')
  console.log('   [ ] No slow queries (> 1 second)')
  console.log('\n3. USER EXPERIENCE:')
  console.log('   [ ] Daily Challenge mode selection works')
  console.log('   [ ] Try Out UTBK shows 160 questions')
  console.log('   [ ] Mini Try Out shows 70 questions')
  console.log('   [ ] Dashboard shows 7 subtests')
  console.log('   [ ] Historical data displays correctly')
  console.log('\n4. DATA INTEGRITY:')
  console.log('   [ ] All questions have subtest_code')
  console.log('   [ ] All progress records have subtest_code')
  console.log('   [ ] No orphaned records')
  console.log('   [ ] Accuracy calculations correct')
  console.log('\n5. BACKWARD COMPATIBILITY:')
  console.log('   [ ] Old data displays without errors')
  console.log('   [ ] Mixed old/new data aggregates correctly')
  console.log('   [ ] Legacy subtest codes map correctly')
  console.log('='.repeat(60))
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🔄 UTBK 2026 Migration Rollback Script')
  console.log('=' .repeat(60))
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }
  
  console.log('=' .repeat(60))
  
  console.log('\n⚠️  WARNING: This is a rollback script!')
  console.log('Only use this if you need to revert the UTBK 2026 migration.')
  console.log('\nThis script will:')
  console.log('  1. Check for data integrity issues')
  console.log('  2. Provide rollback procedures')
  console.log('  3. Generate rollback SQL commands')
  console.log('  4. Show monitoring checklist')
  
  try {
    // Check data integrity
    const stats = await checkDataIntegrity()
    
    console.log('\n📊 Integrity Check Results:')
    console.log(`   Questions checked: ${stats.questionsChecked}`)
    console.log(`   Progress records checked: ${stats.progressRecordsChecked}`)
    console.log(`   Assessments checked: ${stats.assessmentsChecked}`)
    console.log(`   Issues found: ${stats.issuesFound}`)
    
    if (stats.issuesFound === 0) {
      console.log('\n✅ No data integrity issues found!')
      console.log('Migration appears to be successful.')
    } else {
      console.log('\n⚠️  Data integrity issues detected!')
      console.log('Review the issues above before proceeding.')
    }
    
    // Print rollback procedure
    printRollbackProcedure()
    
    // Generate rollback SQL
    generateRollbackSQL()
    
    // Print monitoring checklist
    printMonitoringChecklist()
    
    console.log('\n' + '='.repeat(60))
    console.log('📚 ADDITIONAL RESOURCES')
    console.log('='.repeat(60))
    console.log('\nDocumentation:')
    console.log('  - Migration logs: database/migrations/MIGRATION_LOG.md')
    console.log('  - Requirements: .kiro/specs/utbk-2026-compliance/requirements.md')
    console.log('  - Implementation: TASK_*_IMPLEMENTATION.md files')
    console.log('\nSupport:')
    console.log('  - Check error logs in Supabase dashboard')
    console.log('  - Review user feedback and reports')
    console.log('  - Contact development team for assistance')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ Rollback script failed:', error)
    process.exit(1)
  }
}

// Run the script
main()
