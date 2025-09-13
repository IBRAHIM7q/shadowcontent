'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username: string
  created_at: string
}

export default function TestUserData() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First, get the current user
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        
        if (!userId) {
          throw new Error('No authenticated user')
        }
        
        // Then, fetch user data from the users table
        const { data, error } = await supabase.getInstance()
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) throw error
        setUser(data as User)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Data Test</h1>
      {user ? (
        <div className="border p-4 rounded">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  )
}