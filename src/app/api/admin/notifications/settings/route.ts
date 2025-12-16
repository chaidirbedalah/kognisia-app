import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const schoolId = userData.school_id
    
    // Get notification settings for this school
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('school_id', schoolId)
      .single()
    
    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
    
    // Return default settings if none found
    const defaultSettings = {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      assessment_reminder_hours: 24,
      achievement_notification: true,
      streak_notification: true,
      class_announcement: true,
      digest_frequency: 'weekly'
    }
    
    return NextResponse.json({ 
      settings: settings || defaultSettings
    })
  } catch (error) {
    console.error('Error in notification settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const schoolId = userData.school_id
    
    // Update notification settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('notification_settings')
      .upsert({
        school_id: schoolId,
        ...body
      }, {
        onConflict: 'school_id'
      })
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating settings:', updateError)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error in notification settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}