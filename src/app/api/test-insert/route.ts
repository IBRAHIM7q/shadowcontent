import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

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

export async function POST() {
  try {
    console.log('Testing user insertion...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getServiceRoleClient()
    
    // Generate a proper UUID for testing
    const testUserId = '12345678-1234-1234-1234-123456789012' // Valid UUID format
    
    // First, try to see what columns exist by attempting different insertions
    const minimalData = { id: testUserId }
    
    const { data, error } = await supabase
      .from('users')
      .insert(minimalData)
      .select()
    
    if (error) {
      console.error('Error inserting user with minimal data:', {
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
    
    console.log('Successfully inserted user with minimal data:', data)
    
    // Now try to query the inserted record to see what columns exist
    const { data: queryData, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (queryError) {
      console.error('Error querying inserted user:', queryError)
    } else {
      console.log('Queried user data:', queryData)
      const columns = Object.keys(queryData)
      console.log('Columns in users table:', columns)
    }
    
    // Clean up test data
    await supabase
      .from('users')
      .delete()
      .eq('id', testUserId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test completed',
      insertedData: data,
      queriedData: queryData || null,
      columns: queryData ? Object.keys(queryData) : null
    })
  } catch (err: unknown) {
    console.error('Exception in test-insert route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}