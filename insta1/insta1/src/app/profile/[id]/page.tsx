'use client'

import { useAuthStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

// Define types for our data
interface User {
  id: string
  username: string
  email: string
  avatar_url: string
  created_at: string
}

interface Post {
  id: string
  media_url: string
  title: string
  created_at: string
}

export default function Profile() {
  const currentUser = useAuthStore((state) => state.user)
  const { id } = useParams<{ id: string }>()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)

  // Move function declarations before useEffect hooks
  const fetchUserProfile = async () => {
    setUserLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, avatar_url, created_at')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setProfileUser(data)
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, media_url, title, created_at')
        .eq('user_id', profileUser?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Exception fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchUserProfile()
  }, [id])

  useEffect(() => {
    if (!profileUser?.id) return
    fetchUserPosts()
  }, [profileUser?.id])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
        <Header />
        <div className="flex-grow md:ml-64 pb-16 md:pb-0">
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
        <Header />
        <div className="flex-grow md:ml-64 pb-16 md:pb-0">
          <div className="flex items-center justify-center min-h-screen">
            <div>
              <p>Profile not found.</p>
              <Link href="/" className="text-green-400 hover:underline ml-2">← Back</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={profileUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profileUser.username}
              alt={profileUser.username}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profileUser.username
              }}
            />
            <div>
              <h1 className="text-2xl font-bold">{profileUser.username}</h1>
              <p className="text-gray-400">{posts.length} Posts</p>
            </div>
          </div>
          {isOwnProfile && (
            <Link href="/profile/edit" className="text-green-400 hover:underline">Edit profile</Link>
          )}
          <Link href="/" className="text-green-400 hover:underline block mt-2">← Back</Link>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-400">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No posts available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square rounded-lg overflow-hidden border border-gray-700 shadow-card">
                <img src={post.media_url} alt={post.title || 'Post image'} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}