import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Validate required fields
    const { title, description, assessment_type, scheduled_at, start_time, end_time, target_classes } = body
    
    if (!title || !assessment_type || !scheduled_at || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get school_id for the admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('school_id')
      .eq('id', user.id)
      .single()
    
    if (adminError || !adminData?.school_id) {
      return NextResponse.json({ error: 'Admin not associated with a school' }, { status: 400 })
    }
    
    // Create scheduled assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('scheduled_assessments')
      .insert({
        title,
        description,
        assessment_type,
        school_id: adminData.school_id,
        scheduled_at: new Date(scheduled_at).toISOString(),
        start_time,
        end_time,
        is_published: false,
        is_completed: false,
        created_by: user.id
      })
      .select()
      .single()
    
    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
    }
    
    // If target classes provided, create relationships
    if (target_classes && target_classes.length > 0) {
      const classRelations = target_classes.map((classId: string) => ({
        assessment_id: assessment.id,
        class_id
      }))
      
      const { error: relationError } = await supabase
        .from('assessment_classes')
        .insert(classRelations)
      
      if (relationError) {
        console.error('Error creating class relations:', relationError)
        // Don't fail the request, but log the error
      }
    }
    
    return NextResponse.json({ 
      message: 'Assessment scheduled successfully',
      assessment 
    })
  } catch (error) {
    console.error('Error in schedule assessment API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}