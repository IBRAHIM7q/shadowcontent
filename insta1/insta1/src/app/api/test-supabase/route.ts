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
    // Test the Supabase connection
    console.log('Testing Supabase connection...');
    
    // Only create the Supabase client when we actually need it
    const supabase = getSupabaseClient()
    
    // Test authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        success: false, 
        error: 'Session error',
        details: sessionError
      }, { status: 500 });
    }
    
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error querying users table:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 });
    }
    
    console.log('Successfully queried users table, got data:', data);
    
    // Test posts table
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (postsError) {
      console.error('Error querying posts table:', {
        message: postsError.message,
        code: postsError.code,
        details: postsError.details,
        hint: postsError.hint
      });
      
      return NextResponse.json({ 
        success: false, 
        error: postsError.message,
        details: {
          code: postsError.code,
          details: postsError.details,
          hint: postsError.hint
        }
      }, { status: 500 });
    }
    
    console.log('Successfully queried posts table');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tests passed',
      session: session ? 'authenticated' : 'not authenticated',
      usersSample: data,
      postsSample: postsData
    });
  } catch (err: unknown) {
    console.error('Exception in test-supabase route:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  }
}