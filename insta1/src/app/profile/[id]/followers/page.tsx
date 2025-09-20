'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

interface User {
  id: string
  username: string
  avatar_url: string
}

interface Follower {
  follower_id: string
  users: User
}

// Page-Funktion direkt mit Typen für params
export default function FollowersPage() {
  const { id } = useParams<{ id: string }>()
  const [followers, setFollowers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFollowers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          users!followers_follower_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('following_id', id)

      if (error) console.error(error)
       
      else setFollowers(data?.flatMap((f) => f.users) || []) 
   } catch (err) {

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchFollowers()
    }
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-center py-8 text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Followers</h1>
          {followers.length === 0 ? (
            <p className="text-gray-400">No followers</p>
          ) : (
            <div className="space-y-4">
              {followers.map(user => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors shadow-card"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }}
                  />
                  <span>{user.username}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}