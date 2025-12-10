/**
 * Test script to verify squad data structure
 * Run with: npx tsx scripts/test-squad-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSquadData() {
  console.log('=== Testing Squad Data Structure ===\n')

  try {
    // 1. Get all squads
    console.log('1. Fetching all squads...')
    const { data: squads, error: squadsError } = await supabase
      .from('squads')
      .select('*')
      .limit(5)

    if (squadsError) {
      console.error('❌ Error fetching squads:', squadsError)
      return
    }

    console.log(`✅ Found ${squads?.length || 0} squads`)
    if (squads && squads.length > 0) {
      console.log('First squad structure:')
      console.log(JSON.stringify(squads[0], null, 2))
    }

    // 2. Test getUserSquads query pattern
    console.log('\n2. Testing getUserSquads query pattern...')
    
    // Get a user who has squads
    const { data: members, error: membersError } = await supabase
      .from('squad_members')
      .select('user_id')
      .eq('is_active', true)
      .limit(1)

    if (membersError || !members || members.length === 0) {
      console.log('⚠️  No active squad members found')
      return
    }

    const testUserId = members[0].user_id
    console.log(`Testing with user ID: ${testUserId}`)

    // Test the actual query used in getUserSquads
    const { data: userSquadsData, error: userSquadsError } = await supabase
      .from('squad_members')
      .select(`
        squad_id,
        role,
        squads!inner (
          id,
          name,
          invite_code,
          leader_id,
          max_members,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', testUserId)
      .eq('is_active', true)

    if (userSquadsError) {
      console.error('❌ Error in getUserSquads query:', userSquadsError)
      return
    }

    console.log(`✅ Found ${userSquadsData?.length || 0} squads for user`)
    if (userSquadsData && userSquadsData.length > 0) {
      console.log('First result structure:')
      console.log(JSON.stringify(userSquadsData[0], null, 2))
      
      // Check if squad data is properly nested
      const firstSquad = userSquadsData[0].squads
      console.log('\nExtracted squad object:')
      console.log(JSON.stringify(firstSquad, null, 2))
      
      if (firstSquad && firstSquad.length > 0 && firstSquad[0].id) {
        console.log('✅ Squad ID is present:', firstSquad[0].id)
      } else {
        console.log('❌ Squad ID is missing!')
      }
    }

    // 3. Test member count query
    if (squads && squads.length > 0) {
      const testSquadId = squads[0].id
      console.log(`\n3. Testing member count for squad: ${testSquadId}`)
      
      const { count, error: countError } = await supabase
        .from('squad_members')
        .select('*', { count: 'exact', head: true })
        .eq('squad_id', testSquadId)
        .eq('is_active', true)

      if (countError) {
        console.error('❌ Error counting members:', countError)
      } else {
        console.log(`✅ Member count: ${count}`)
      }
    }

    console.log('\n=== Test Complete ===')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testSquadData()
  .then(() => {
    console.log('\n✅ All tests completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
