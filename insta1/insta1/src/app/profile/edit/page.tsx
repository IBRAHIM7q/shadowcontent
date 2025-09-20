'use client'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Link from 'next/link'
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

interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export default function Profile() {
  const user = useAuthStore((state) => state.user) as User
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Move function declaration before useEffect
  const fetchProfileData = async () => {
    setLoading(true)
    try {
      // Posts - Updated to include title and created_at
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, media_url, title, created_at')
        .eq('user_id', user.id)
      
      if (postsError) {
        console.error('Error fetching posts:', postsError)
      } else {
        setPosts(postsData || [])
      }
      
      // Follower
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('following_id', user.id)
      
      if (followersError) {
        console.error('Error fetching followers:', followersError)
      } else {
        setFollowers(followersCount || 0)
      }
      
      // Following
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('follower_id', user.id)
      
      if (followingError) {
        console.error('Error fetching following:', followingError)
      } else {
        setFollowing(followingCount || 0)
      }
      
      // Note: Removed the follow status check since this is the user's own profile
      
    } catch (error) {
      console.error('Exception fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchProfileData()
  }, [user])

  const handleFollow = async () => {
    try {
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: user.id,
      })
      
      if (error) {
        console.error('Error following user:', error)
      } else {
        setIsFollowing(true)
        setFollowers(followers + 1)
      }
    } catch (error) {
      console.error('Exception following user:', error)
    }
  }

  const handleUnfollow = async () => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', user.id)
      
      if (error) {
        console.error('Error unfollowing user:', error)
      } else {
        setIsFollowing(false)
        setFollowers(followers - 1)
      }
    } catch (error) {
      console.error('Exception unfollowing user:', error)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Profile: {user.username}</h1>
        </div>
        <div className="p-6">
          {/* Statistics */}
          <div className="flex gap-8 text-center mb-6">
            <div>
              <strong>{posts.length}</strong> Posts
            </div>
            <Link href={`/profile/${user.id}/followers`} className="hover:underline text-green-400">
              <strong>{followers}</strong> Followers
            </Link>
            <Link href={`/profile/${user.id}/following`} className="hover:underline text-green-400">
              <strong>{following}</strong> Following
            </Link>
          </div>
          
          {/* Removed the follow button since this is the user's own profile */}
          
          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square rounded-lg overflow-hidden border border-gray-700 shadow-card">
                <img
                  src={post.media_url}
                  alt="Post"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}