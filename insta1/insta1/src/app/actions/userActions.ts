'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createUserProfile(userId: string, email: string) {
  try {
    // Create a server-side Supabase client
    const supabase = await createServerSupabaseClient()
    
    // Insert user with the actual schema
    const { error } = await supabase.from('users').insert({
      id: userId,
      email: email,
      // Only include fields that actually exist in the table
    })

    if (error) {
      console.error('Error creating user profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Exception creating user profile:', error)
    // Type guard to check if error has a message property
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    // Fallback for unknown error types
    return { success: false, error: 'An unknown error occurred' }
  }
}