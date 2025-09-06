import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing service role client...')
    
    // Create a service role client (has admin privileges)
    const supabase = createServiceRoleClient()
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .limit(1)
    
    if (error) {
      console.error('Error querying users table with service role:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 })
    }
    
    console.log('Successfully queried users table with service role, got data:', data)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service role test passed',
      usersSample: data
    })
  } catch (err: unknown) {
    console.error('Exception in test-service-role route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}