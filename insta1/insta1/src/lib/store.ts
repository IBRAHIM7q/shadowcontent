// src/lib/store.ts
import { create } from 'zustand'
import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  created_at?: string
  // Optional fields that might exist
  username?: string
  avatar_url?: string
  // Add index signature to allow for unknown properties with specific types
  [key: string]: string | number | boolean | undefined | null
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  signOut: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

// Create the store
export const useAuthStore = create<AuthState>()((set) => {
  // Initialize loading state
  set({ loading: true, user: null })
  
  // Function to fetch user data
  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for ID:', userId);
      
      // Query with the actual columns we know exist
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at, username, avatar_url')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user data:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        // Also log the error object itself
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        // Try a more minimal query with just the required fields
        const { data: minimalData, error: minimalError } = await supabase
          .from('users')
          .select('id, email, created_at')
          .eq('id', userId)
          .single()
        
        if (minimalError) {
          console.error('Minimal query also failed:', {
            message: minimalError.message,
            code: minimalError.code,
            details: minimalError.details,
            hint: minimalError.hint
          });
          return null;
        }
        
        console.log('Minimal query successful:', minimalData);
        return minimalData;
      }
      
      console.log('User data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching user data:', error);
      // Log the full error object
      console.error('Full exception object:', JSON.stringify(error, null, 2));
      return null;
    }
  }
  
  // Check for existing session
  supabase.getInstance().auth.getSession().then(async ({ data: { session } }) => {
    console.log('Session check result:', session ? 'User logged in' : 'No user logged in');
    if (session?.user) {
      console.log('Fetching user data for session user:', session.user.id);
      const userData = await fetchUserData(session.user.id)
      set({ 
        user: userData || { 
          id: session.user.id, 
          email: session.user.email || ''
        },
        loading: false
      })
    } else {
      set({ user: null, loading: false })
    }
  })
  
  // Auth state change listener
  supabase.getInstance().auth.onAuthStateChange((_event, session) => {
    console.log('Auth state changed:', _event, session ? 'User logged in' : 'User logged out');
    if (session?.user) {
      fetchUserData(session.user.id).then(userData => {
        set({ 
          user: userData || { 
            id: session.user.id, 
            email: session.user.email || ''
          },
          loading: false
        })
      })
    } else {
      set({ user: null, loading: false })
    }
  })
  
  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
      await supabase.getInstance().auth.signOut()
      set({ user: null, loading: false })
    },
  }
})

// Export selector hooks
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthLoading = () => useAuthStore((state) => state.loading)