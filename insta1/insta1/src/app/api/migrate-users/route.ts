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
    console.log('Running users table migration...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getServiceRoleClient()
    
    // Check if the users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('Error checking for users table:', tablesError)
      return NextResponse.json({ 
        success: false, 
        error: tablesError.message 
      }, { status: 500 })
    }
    
    // If table doesn't exist, create it
    if (!tables || tables.length === 0) {
      console.log('Users table does not exist, creating it...')
      
      // Note: In a real application, you would use Supabase's SQL editor or migrations
      // For now, we'll just return a message
      return NextResponse.json({ 
        success: false, 
        message: 'Users table does not exist. Please create it using Supabase dashboard.' 
      })
    }
    
    // Check current columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('Error fetching column info:', columnsError)
      return NextResponse.json({ 
        success: false, 
        error: columnsError.message 
      }, { status: 500 })
    }
    
    console.log('Current columns:', columns)
    
    // Define required columns
    const requiredColumns = [
      { name: 'id', type: 'uuid' },
      { name: 'username', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'avatar_url', type: 'text' },
      { name: 'created_at', type: 'timestamp with time zone' }
    ]
    
    // Check for missing columns
    const missingColumns = requiredColumns.filter(required => 
      !columns.some(col => col.column_name === required.name)
    )
    
    console.log('Missing columns:', missingColumns)
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing columns detected. Please update your database schema.',
        missingColumns: missingColumns,
        currentColumns: columns
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Users table schema is correct',
      columns: columns
    })
  } catch (err: unknown) {
    console.error('Exception in migrate-users route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}