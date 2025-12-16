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
    
    // Get classes for this school
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        grade,
        users!inner(name),
        enrollments(count)
      `)
      .eq('school_id', schoolId)
      .eq('users.role', 'teacher')
    
    if (classesError) {
      console.error('Error fetching classes:', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }
    
    // Process class data
    const processedClasses = classes.map(classItem => ({
      id: classItem.id,
      name: classItem.name,
      grade: classItem.grade,
      teacher: classItem.users?.name || 'Unknown',
      student_count: classItem.enrollments?.[0]?.count || 0
    }))
    
    return NextResponse.json({ classes: processedClasses })
  } catch (error) {
    console.error('Error in classes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}