import { NextResponse } from 'next/server'
// Import only what we need to avoid unused import warnings
import { type CookieOptions, createServerClient } from '@supabase/ssr'

// Function to create service role client only when needed
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // Create a minimal client for service role operations
  return createServerClient(supabaseUrl, supabaseServiceKey, {
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
}

export async function GET() {
  try {
    console.log('Testing service role client...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getServiceRoleClient()
    
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