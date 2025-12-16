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
    
    // Get bulk operations for this school
    const { data: operations, error: operationsError } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (operationsError) {
      console.error('Error fetching operations:', operationsError)
      return NextResponse.json({ error: 'Failed to fetch operations' }, { status: 500 })
    }
    
    return NextResponse.json({ operations })
  } catch (error) {
    console.error('Error in bulk operations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}