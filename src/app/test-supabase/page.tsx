// src/app/test-supabase/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState('')
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus('Testing connection...')
      setDetails(null)
      
      // Test basic connection and authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setStatus(`Session Error: ${sessionError.message}`)
        setDetails(sessionError)
        return
      }
      
      setStatus(`Session Status: ${session ? 'Authenticated' : 'Not authenticated'}`)
      
      // Test users table access
      setStatus('Testing users table access...')
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .single()
      
      if (usersError) {
        setStatus(`Users Table Error: ${usersError.message}`)
        setDetails(usersError)
        return
      }
      
      setStatus(`Success: Users count = ${JSON.stringify(usersData)}`)
      
      // Test posts table access
      setStatus('Testing posts table access...')
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('count')
        .single()
      
      if (postsError) {
        setStatus(`Posts Table Error: ${postsError.message}`)
        setDetails(postsError)
        return
      }
      
      setStatus(`Success: Users count = ${JSON.stringify(usersData)}, Posts count = ${JSON.stringify(postsData)}`)
    } catch (err) {
      // Fix: Check if err is an Error instance before accessing message
      const errorMessage = err instanceof Error ? err.message : String(err)
      setStatus(`Exception: ${errorMessage}`)
      setDetails(err)
    }
  }

  // Run test automatically when page loads
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Supabase Connection</h1>
        <button 
          onClick={testConnection}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-button mb-4"
        >
          Test Connection
        </button>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-card">
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <p className="mb-4">{status}</p>
          
          {details && (
            <>
              <h2 className="text-lg font-semibold mb-2">Details:</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(details, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}