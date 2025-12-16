import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
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
    
    // Create bulk operation record
    const { data: operation, error: operationError } = await supabase
      .from('bulk_operations')
      .insert({
        type: 'student_import',
        status: 'pending',
        progress: 0,
        total_items: 0,
        processed_items: 0,
        school_id: schoolId,
        created_by: user.id
      })
      .select()
      .single()
    
    if (operationError) {
      console.error('Error creating operation record:', operationError)
      return NextResponse.json({ error: 'Failed to create operation record' }, { status: 500 })
    }
    
    // Process file upload in background (simplified for demo)
    // In a real implementation, this would be a background job
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Update operation status to running
    await supabase
      .from('bulk_operations')
      .update({ status: 'running' })
      .eq('id', operation.id)
    
    // Simulate processing (in real implementation, this would be async)
    const buffer = await file.arrayBuffer()
    const content = new TextDecoder().decode(buffer)
    const lines = content.split('\n').filter(line => line.trim())
    
    // Update progress
    await supabase
      .from('bulk_operations')
      .update({ 
        total_items: lines.length,
        processed_items: 0,
        progress: 0
      })
      .eq('id', operation.id)
    
    // Process each line (simplified)
    let processedCount = 0
    for (const line of lines) {
      const [name, email, className, nis] = line.split(',').map(item => item.trim())
      
      if (name && email && className) {
        // Create or update student record
        await supabase
          .from('users')
          .upsert({
            name,
            email,
            role: 'student',
            school_id: schoolId,
            nis
          }, {
            onConflict: 'email'
          })
        
        processedCount++
        
        // Update progress every 10 records
        if (processedCount % 10 === 0) {
          await supabase
            .from('bulk_operations')
            .update({ 
              processed_items: processedCount,
              progress: (processedCount / lines.length) * 100
            })
            .eq('id', operation.id)
        }
      }
    }
    
    // Mark operation as completed
    await supabase
      .from('bulk_operations')
      .update({ 
        status: 'completed',
        processed_items: processedCount,
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', operation.id)
    
    return NextResponse.json({ 
      message: 'Student import completed',
      operation_id: operation.id,
      processed_count: processedCount
    })
  } catch (error) {
    console.error('Error in student import API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}