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
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get scheduled assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('scheduled_assessments')
      .select(`
        *,
        schools(name),
        assessment_classes(
          class_id,
          classes(name, grade)
        )
      `)
      .order('scheduled_at', { ascending: true })
    
    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError)
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }
    
    return NextResponse.json({ assessments })
  } catch (error) {
    console.error('Error in scheduled assessments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}