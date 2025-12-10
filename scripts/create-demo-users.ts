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

  // Create student accounts
  console.log('📚 Creating Student Accounts...')
  for (const username of studentAccounts) {
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
  for (const username of teacherAccounts) {
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
  console.log('📋 Student Accounts: 30')
  console.log('   Format: [name]@siswa.id')
  console.log('')
  console.log('👨‍🏫 Teacher Accounts: 10')
  console.log('   Format: [name]@guru.id')
  console.log('')
  console.log('✅ Done!')
}

main().catch(console.error)
