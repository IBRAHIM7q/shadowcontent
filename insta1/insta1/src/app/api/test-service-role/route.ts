import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase environment variables' 
      }, { status: 500 })
    }
    
    // Create a service role client
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        get() {
          return null
        },
        set() {
          // no-op
        },
        remove() {
          // no-op
        },
      },
    })
    
    // Test a simple query to verify the service role works
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Service role test failed:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service role client working correctly',
      sampleData: data
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