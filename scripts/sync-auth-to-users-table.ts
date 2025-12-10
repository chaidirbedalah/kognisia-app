/**
 * Sync Auth Users to Users Table
 * 
 * This script syncs existing auth users to the users table
 * Useful when auth users were created but users table wasn't updated
 * 
 * Usage:
 *   npx tsx scripts/sync-auth-to-users-table.ts
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

async function syncAuthUsers() {
  console.log('========================================')
  console.log('Syncing Auth Users to Users Table')
  console.log('========================================')
  console.log('')

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message)
      return
    }

    console.log(`Found ${authUsers.users.length} auth users`)
    console.log('')

    let syncedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Sync each user
    for (const authUser of authUsers.users) {
      const email = authUser.email!
      const fullName = authUser.user_metadata?.full_name || email.split('@')[0]
      
      // Determine role from email domain
      let role: 'student' | 'teacher' = 'student'
      if (email.includes('@guru.id')) {
        role = 'teacher'
      } else if (email.includes('@siswa.id')) {
        role = 'student'
      } else if (authUser.user_metadata?.role) {
        role = authUser.user_metadata.role
      }

      // Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (existingUser) {
        console.log(`⏭️  Skipped ${email} (already in users table)`)
        skippedCount++
        continue
      }

      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: email,
          role: role,
          full_name: fullName
        })

      if (insertError) {
        console.error(`❌ Failed to sync ${email}:`, insertError.message)
        errorCount++
      } else {
        console.log(`✅ Synced ${email} (${role})`)
        syncedCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    console.log('')
    console.log('========================================')
    console.log('Summary')
    console.log('========================================')
    console.log(`✅ Synced: ${syncedCount} users`)
    console.log(`⏭️  Skipped: ${skippedCount} users (already exist)`)
    console.log(`❌ Errors: ${errorCount} users`)
    console.log('')
    console.log('✅ Done!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

syncAuthUsers().catch(console.error)
