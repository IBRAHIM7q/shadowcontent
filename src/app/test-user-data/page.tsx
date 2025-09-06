'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestUserData() {
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        console.log('Checking session...')
        
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session data:', session)
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(`Session error: ${JSON.stringify(sessionError)}`)
          setLoading(false)
          return
        }
        
        if (!session?.user) {
          setError('No user is currently logged in')
          setLoading(false)
          return
        }
        
        console.log('Fetching user data for ID:', session.user.id)
        
        // Try to fetch user data
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email, avatar_url, created_at')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching user data:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          setError(`Error fetching user data: ${JSON.stringify(error)}`)
        } else {
          console.log('User data fetched successfully:', data)
          setUserData(data)
        }
      } catch (err) {
        console.error('Exception fetching user data:', err)
        setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test User Data Fetching</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {userData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">User Data:</p>
          <pre className="whitespace-pre-wrap">{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
      
      {!loading && !error && !userData && (
        <p>No data available</p>
      )}
    </div>
  )
}