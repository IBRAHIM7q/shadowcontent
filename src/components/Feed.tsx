'use client'

import { useEffect, useState, useCallback } from 'react'
import Post from './Post'
import { getSupabaseClient } from '@/lib/supabase'

interface PostData {
  id: string
  user_id: string
  media_url: string
  title: string
  created_at: string
}

export default function Feed() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-card animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-64 bg-gray-700 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}
