import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Create a service role client (has admin privileges)
    const supabase = createServiceRoleClient()
    
    // Find the user
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Confirm the user
    const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })
    
    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'User confirmed successfully' })
  } catch (error: unknown) {
    // Type guard to check if error has a message property
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Fallback for unknown error types
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}