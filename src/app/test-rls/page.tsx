'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface Post {
  id: string
  title: string
  content: string
  user_id: string
}

export default function TestRLS() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get Supabase client instance
        const supabase = getSupabaseClient()
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
        
        if (error) throw error
        setPosts((data as Post[]) || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RLS Test</h1>
      <div>
        {posts.map(post => (
          <div key={post.id} className="border p-2 mb-2">
            <p>Title: {post.title}</p>
            <p>Content: {post.content}</p>
            <p>User ID: {post.user_id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}