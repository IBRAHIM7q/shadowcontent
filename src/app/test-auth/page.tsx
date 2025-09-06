'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

export default function TestAuth() {
  const [session, setSession] = useState<any>(null)
  const [authState, setAuthState] = useState<string>('')
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication state...')
        setAuthState('Checking session...')
        
        // Check current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        console.log('Session data:', currentSession)
        
        if (error) {
          console.error('Session error:', error)
          setAuthState(`Session error: ${error.message}`)
          return
        }
        
        setSession(currentSession)
        setAuthState(currentSession?.user ? 'User logged in' : 'No user logged in')
      } catch (err) {
        console.error('Exception checking auth:', err)
        setAuthState(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setSession(session)
      setAuthState(`Auth event: ${event}`)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setAuthState('Signed out')
    } catch (err) {
      console.error('Error signing out:', err)
      setAuthState(`Sign out error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth State</h2>
        <p className="mb-2">{authState}</p>
        
        {session?.user && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Current Session:</p>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(session, null, 2)}</pre>
          </div>
        )}
        
        <button 
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Store State</h2>
        <p className="mb-2">Loading: {loading ? 'Yes' : 'No'}</p>
        
        {user ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">User from Store:</p>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(user, null, 2)}</pre>
          </div>
        ) : (
          <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No user in store
          </p>
        )}
      </div>
    </div>
  )
}