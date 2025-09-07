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
    console.log('Testing column information...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getSupabaseClient()
    
    // Get the actual columns in the users table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('Error fetching column info:', columnsError)
      return NextResponse.json({ 
        success: false, 
        error: columnsError.message,
        details: columnsError
      }, { status: 500 })
    }
    
    console.log('Users table columns:', columns)
    
    // Try to query with only the actual columns
    if (columns && columns.length > 0) {
      const columnNames = columns.map(col => col.column_name).join(', ')
      console.log('Attempting query with columns:', columnNames)
      
      const { data, error } = await supabase
        .from('users')
        .select(columnNames)
        .limit(1)
      
      if (error) {
        console.error('Error querying with actual columns:', error)
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          columns: columns,
          queryColumns: columnNames
        }, { status: 500 })
      }
      
      console.log('Successfully queried with actual columns:', data)
      
      return NextResponse.json({ 
        success: true, 
        columns: columns,
        sampleData: data
      })
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'No columns found in users table',
        columns: []
      })
    }
  } catch (err: unknown) {
    console.error('Exception in test-columns route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}