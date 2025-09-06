'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'

interface User {
  id: string
  email: string
  username: string
}

export default function TestFixedStore() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStore = async () => {
      try {
        const storeUser = useAuthStore.getState().user
        if (storeUser) {
          setUser({
            id: storeUser.id,
            email: storeUser.email || '',
            username: storeUser.username || ''
          } as User)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking store:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkStore()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fixed Store Test</h1>
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