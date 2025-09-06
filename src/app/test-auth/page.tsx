'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  email: string
  user_metadata: Record<string, unknown>
}

export default function TestAuth() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata || {}
          } as UserData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      {user ? (
        <div>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <pre>{JSON.stringify(user.user_metadata, null, 2)}</pre>
        </div>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  )
}