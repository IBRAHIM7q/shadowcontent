'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'

// Define the User interface locally to avoid importing from store
interface User {
  id: string
  email: string
  username: string
}

// Create a minimal store for this component only
interface AuthState {
  user: User | null
  loading: boolean
}

const useLocalAuthStore = create<AuthState>()(() => ({
  user: null,
  loading: true
}))

export default function TestFixedStore() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStore = async () => {
      try {
        // Simulate checking a store without importing the full store
        // In a real implementation, you might want to use a different approach
        setUser(null)
      } catch (error) {
        console.error('Error checking store:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkStore()
  }, [])

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fixed Store Test</h1>
      <p className="text-gray-500">This page no longer imports the Supabase client during build time.</p>
      {user ? (
        <div>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Username: {user.username}</p>
        </div>
      ) : (
        <p>No user in store</p>
      )}
    </div>
  )
}