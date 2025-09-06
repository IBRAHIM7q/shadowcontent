'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

export default function TestFixedStore() {
  const [session, setSession] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication state...')
        setTestResult('Checking session...')
        
        // Check current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        console.log('Session data:', currentSession)
        
        if (error) {
          console.error('Session error:', error)
          setTestResult(`Session error: ${error.message}`)
          return
        }
        
        setSession(currentSession)
        setTestResult(currentSession?.user ? 'User logged in' : 'No user logged in')
      } catch (err) {
        console.error('Exception checking auth:', err)
        setTestResult(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fixed Store Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Result</h2>
        <p className="mb-2">{testResult}</p>
        
        {session?.user && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Current Session:</p>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(session, null, 2)}</pre>
          </div>
        )}
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
      
      <div className="mt-6 bg-purple-50 border border-purple-200 p-4 rounded">
        <h3 className="font-bold text-lg mb-2">Fix Summary:</h3>
        <ul className="list-disc pl-5">
          <li>Updated store to query only the columns that actually exist in the database</li>
          <li>Modified the user creation logic to match the actual table schema</li>
          <li>Added fallback queries for better error handling</li>
          <li>Adjusted the User interface to match the actual database structure</li>
        </ul>
      </div>
    </div>
  )
}