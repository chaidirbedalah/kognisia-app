import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testHOTSClassifier() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🧠 Testing HOTS Classification Engine...')

    // Test 1: Classify a specific question
    console.log('\n📝 Test 1: Single Question Classification')
    const { data: questions } = await supabase
      .from('question_bank')
      .select('*')
      .limit(1)

    if (questions && questions.length > 0) {
      const question = questions[0]
      console.log(`Question: ${question.question_text.substring(0, 100)}...`)
      console.log(`Current HOTS classification: ${question.is_hots}`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/hots_classify_question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'classify_question',
          questionId: question.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Classification result:', result)
      } else {
        console.log('❌ Classification failed:', await response.text())
      }
    }

    // Test 2: Batch classification for PU subtest
    console.log('\n📊 Test 2: Batch Classification for PU')
    const batchResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/hots_batch_classify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'batch_classify',
        subtestCode: 'PU'
      })
    })

    if (batchResponse.ok) {
      const batchResult = await batchResponse.json()
      console.log('✅ Batch classification result:', batchResult)
    } else {
      console.log('❌ Batch classification failed:', await batchResponse.text())
    }

    // Test 3: Quality analysis
    console.log('\n📈 Test 3: Quality Analysis')
    const qualityResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/hots_analyze_quality`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'analyze_quality'
      })
    })

    if (qualityResponse.ok) {
      const qualityResult = await qualityResponse.json()
      console.log('✅ Quality analysis result:', qualityResult)
    } else {
      console.log('❌ Quality analysis failed:', await qualityResponse.text())
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function testEnhancedAdaptive() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('\n🎯 Testing Enhanced Adaptive System...')

    // Create a test user or use existing
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError || !users || users.length === 0) {
      console.log('❌ No users found for testing')
      return
    }

    const testUser = users[0]
    console.log(`Testing with user: ${testUser.email}`)

    // Test comprehensive remedial
    console.log('\n🔧 Test: Comprehensive Remedial')
    const remedialResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/adaptive_enhanced_start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.aud}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: 'comprehensive-remedial'
      })
    })

    if (remedialResponse.ok) {
      const remedialResult = await remedialResponse.json()
      console.log('✅ Comprehensive remedial result:', remedialResult)
    } else {
      console.log('❌ Comprehensive remedial failed:', await remedialResponse.text())
    }

  } catch (error) {
    console.error('❌ Enhanced adaptive test failed:', error)
  }
}

async function testRemedialSystem() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('\n🏥 Testing 3-Tier Remedial System...')

    // Get a test user
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError || !users || users.length === 0) {
      console.log('❌ No users found for testing')
      return
    }

    const testUser = users[0]

    // Test Tier 1 remedial for PU
    console.log('\n📊 Test: Tier 1 Remedial for PU')
    const tier1Response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/remedial_start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.aud}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetSubtest: 'PU',
        tier: 1
      })
    })

    if (tier1Response.ok) {
      const tier1Result = await tier1Response.json()
      console.log('✅ Tier 1 remedial result:', tier1Result)
    } else {
      console.log('❌ Tier 1 remedial failed:', await tier1Response.text())
    }

  } catch (error) {
    console.error('❌ Remedial system test failed:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Kognisia UTBK System Tests...\n')
  
  await testHOTSClassifier()
  await testEnhancedAdaptive()
  await testRemedialSystem()
  
  console.log('\n✅ All tests completed!')
}

runAllTests()