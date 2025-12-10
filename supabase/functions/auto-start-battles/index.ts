// Supabase Edge Function: Auto-start Scheduled Battles
// This function runs every minute to:
// 1. Auto-start battles that have reached their scheduled time
// 2. Send reminder notifications 5 minutes before battle starts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🚀 Starting auto-start-battles cron job...')

    // 1. Auto-start scheduled battles
    console.log('📍 Calling auto_start_scheduled_battles()...')
    const { data: startData, error: startError } = await supabase
      .rpc('auto_start_scheduled_battles')

    if (startError) {
      console.error('❌ Error auto-starting battles:', startError)
      throw startError
    }
    console.log('✅ Auto-start completed')

    // 2. Send battle reminders
    console.log('📍 Calling send_battle_reminders()...')
    const { data: reminderData, error: reminderError } = await supabase
      .rpc('send_battle_reminders')

    if (reminderError) {
      console.error('❌ Error sending reminders:', reminderError)
      throw reminderError
    }
    console.log('✅ Reminders sent')

    // 3. Get stats for logging
    const { data: stats, error: statsError } = await supabase
      .from('squad_battles')
      .select('status')
      .eq('status', 'scheduled')

    const scheduledCount = stats?.length || 0
    console.log(`📊 Current scheduled battles: ${scheduledCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-start cron job completed successfully',
        scheduled_battles: scheduledCount,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
