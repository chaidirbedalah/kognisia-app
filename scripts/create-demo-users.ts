/**
 * Create Demo Users Script
 * 
 * This script creates 30 student accounts and 10 teacher accounts
 * using Supabase Admin API
 * 
 * Usage:
 *   npx tsx scripts/create-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo accounts
const studentAccounts = [
  'andi', 'bagus', 'budi', 'candra', 'dedi', 'dewi', 'eka', 'fitri', 'galih', 'hana',
  'indra', 'joko', 'kiki', 'lina', 'maya', 'nanda', 'putri', 'rani', 'riski', 'sari',
  'tiara', 'tono', 'ujang', 'vera', 'wawan', 'yanti', 'yudi', 'zaki', 'zahra', 'riko'
]

const teacherAccounts = [
  'bambang', 'jaya', 'agus', 'rudi', 'surya', 'dewi', 'fitri', 'sari', 'ratna', 'lina'
]

const defaultPassword = 'demo123456'

// Optional CLI limits: --students N --teachers M
const args = process.argv.slice(2)
const studentsArgIndex = args.indexOf('--students')
const teachersArgIndex = args.indexOf('--teachers')
const studentsLimit = studentsArgIndex !== -1 ? parseInt(args[studentsArgIndex + 1] || '0', 10) : 0
const teachersLimit = teachersArgIndex !== -1 ? parseInt(args[teachersArgIndex + 1] || '0', 10) : 0
const selectedStudents = studentsLimit > 0 ? studentAccounts.slice(0, studentsLimit) : studentAccounts
const selectedTeachers = teachersLimit > 0 ? teacherAccounts.slice(0, teachersLimit) : teacherAccounts

async function createUser(email: string, role: 'student' | 'teacher', name: string) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role
      }
    })

    if (authError) {
      console.error(`❌ Failed to create ${email}:`, authError.message)
      return false
    }

    // Insert/Update users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        role: role,
        full_name: name
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.warn(`⚠️  Created auth user ${email} but failed to upsert to users table:`, upsertError.message)
    } else {
      console.log(`✅ Created ${role}: ${email}`)
    }

    return true
  } catch (error: any) {
    console.error(`❌ Error creating ${email}:`, error.message)
    return false
  }
}

async function main() {
  console.log('========================================')
  console.log('Creating Demo Accounts')
  console.log('========================================')
  console.log('')

  let successCount = 0
  let failCount = 0

  // Create specific test accounts required for manual testing
  console.log('🔒 Creating Specific Test Accounts...')
  const specificTests = [
    { email: 'test@kognisia.com', role: 'student' as const, name: 'Test', password: 'test123456' },
    { email: 'guru@kognisia.com', role: 'teacher' as const, name: 'Guru', password: 'guru123456' }
  ]
  for (const acc of specificTests) {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', acc.email)
        .single()

      if (!existing) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { full_name: acc.name, role: acc.role }
        })

        if (authError) {
          console.error(`❌ Failed to create ${acc.email}:`, authError.message)
          failCount++
        } else {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({ id: authData.user.id, email: acc.email, role: acc.role, full_name: acc.name }, { onConflict: 'id' })
          if (upsertError) {
            console.warn(`⚠️  Created auth user ${acc.email} but failed to upsert to users table:`, upsertError.message)
          }
          console.log(`✅ Created test account: ${acc.email}`)
          successCount++
        }
      } else {
        // Ensure password matches expected for testing
        if (existing?.id) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, { password: acc.password })
          if (updateError) {
            console.warn(`⚠️  Failed to reset password for ${acc.email}:`, updateError.message)
          } else {
            console.log(`🔑 Reset password for test account: ${acc.email}`)
          }
        }
        console.log(`ℹ️  Test account already exists: ${acc.email}`)
      }
    } catch (e: any) {
      console.error(`❌ Error ensuring test account ${acc.email}:`, e.message)
      failCount++
    }
  }

  // Create student accounts
  console.log('📚 Creating Student Accounts...')
  for (const username of selectedStudents) {
    const email = `${username}@siswa.id`
    const name = username.charAt(0).toUpperCase() + username.slice(1)
    const success = await createUser(email, 'student', name)
    if (success) successCount++
    else failCount++
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('')
  console.log('👨‍🏫 Creating Teacher Accounts...')
  for (const username of selectedTeachers) {
    const email = `${username}@guru.id`
    const name = username.charAt(0).toUpperCase() + username.slice(1)
    const success = await createUser(email, 'teacher', name)
    if (success) successCount++
    else failCount++
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('')
  console.log('========================================')
  console.log('Summary')
  console.log('========================================')
  console.log(`✅ Successfully created: ${successCount} accounts`)
  console.log(`❌ Failed: ${failCount} accounts`)
  console.log('')
  console.log('🔑 Default Password: demo123456')
  console.log('')
  console.log(`📋 Student Accounts: ${selectedStudents.length}`)
  console.log('   Format: [name]@siswa.id')
  console.log('')
  console.log(`👨‍🏫 Teacher Accounts: ${selectedTeachers.length}`)
  console.log('   Format: [name]@guru.id')
  console.log('')
  console.log('✅ Done!')
}

main().catch(console.error)
