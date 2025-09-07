import { NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

// Function to create Supabase client only when needed
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function GET() {
  try {
    console.log('Testing table structure...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getSupabaseClient()
    
    // Try to get information about the users table by querying it
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error querying users table:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Try just querying for id
      const { data: idData, error: idError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (idError) {
        console.error('Error querying just id:', {
          message: idError.message,
          code: idError.code,
          details: idError.details,
          hint: idError.hint
        })
        
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          details: {
            code: error.code,
            details: error.details,
            hint: error.hint
          },
          idQueryError: {
            message: idError.message,
            code: idError.code
          }
        }, { status: 500 })
      }
      
      console.log('Successfully queried just id:', idData)
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully queried just id',
        sampleData: idData,
        columns: ['id']
      })
    }
    
    console.log('Successfully queried users table:', data)
    
    // Get column names from the returned data
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      console.log('Columns found:', columns)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully queried users table',
        sampleData: data,
        columns: columns
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Users table exists but is empty',
      columns: []
    })
  } catch (err: unknown) {
    console.error('Exception in test-structure route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}