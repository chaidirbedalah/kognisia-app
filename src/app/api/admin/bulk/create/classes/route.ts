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
      .select('role, school_id')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const schoolId = userData.school_id
    
    // Validate required fields
    const { name, grade, teacher } = body
    
    if (!name || !grade || !teacher) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Create class
    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert({
        name,
        grade,
        school_id: schoolId
      })
      .select()
      .single()
    
    if (classError) {
      console.error('Error creating class:', classError)
      return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
    }
    
    // Find or create teacher user
    const { data: teacherUser, error: teacherError } = await supabase
      .from('users')
      .select('id')
      .eq('name', teacher)
      .eq('role', 'teacher')
      .eq('school_id', schoolId)
      .single()
    
    if (teacherError || !teacherUser) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 400 })
    }
    
    // Update class with teacher
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update({ teacher_id: teacherUser.id })
      .eq('id', newClass.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating class teacher:', updateError)
      return NextResponse.json({ error: 'Failed to assign teacher' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Class created successfully',
      class: updatedClass
    })
  } catch (error) {
    console.error('Error in create class API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}