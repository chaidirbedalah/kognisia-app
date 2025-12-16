import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
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
    
    // Get notification templates for this school
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
    
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error in notification templates API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
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
    
    // Create notification template
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .insert({
        school_id: schoolId,
        ...body,
        created_by: user.id
      })
      .select()
      .single()
    
    if (templateError) {
      console.error('Error creating template:', templateError)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Template created successfully',
      template
    })
  } catch (error) {
    console.error('Error in notification templates API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}