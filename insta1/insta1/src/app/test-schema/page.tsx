'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface User {
  id: string
  email: string
  username: string
}

interface Post {
  id: string
  title: string
  content: string
  user_id: string
}

interface FetchResult<T> {
  data: T[] | null
  loading: boolean
  error: string | null
}

export default function TestSchema() {
  const [usersResult, setUsersResult] = useState<FetchResult<User>>({
    data: null,
    loading: true,
    error: null
  })
  
  const [postsResult, setPostsResult] = useState<FetchResult<Post>>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
        
        if (usersError) {
          setUsersResult({
            data: null,
            loading: false,
            error: usersError.message
          })
        } else {
          setUsersResult({
            data: usersData || [],
            loading: false,
            error: null
          })
        }
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
        
        if (postsError) {
          setPostsResult({
            data: null,
            loading: false,
            error: postsError.message
          })
        } else {
          setPostsResult({
            data: postsData || [],
            loading: false,
            error: null
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setUsersResult({
          data: null,
          loading: false,
          error: errorMessage
        })
        setPostsResult({
          data: null,
          loading: false,
          error: errorMessage
        })
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schema Test</h1>
      
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <div className="mb-6">
        {usersResult.loading ? (
          <p>Loading users...</p>
        ) : usersResult.error ? (
          <p className="text-red-500">Error: {usersResult.error}</p>
        ) : usersResult.data ? (
          usersResult.data.map(user => (
            <div key={user.id} className="border p-2 mb-2">
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Username: {user.username}</p>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Posts</h2>
      <div>
        {postsResult.loading ? (
          <p>Loading posts...</p>
        ) : postsResult.error ? (
          <p className="text-red-500">Error: {postsResult.error}</p>
        ) : postsResult.data ? (
          postsResult.data.map(post => (
            <div key={post.id} className="border p-2 mb-2">
              <p>ID: {post.id}</p>
              <p>Title: {post.title}</p>
              <p>Content: {post.content}</p>
              <p>User ID: {post.user_id}</p>
            </div>
          ))
        ) : (
          <p>No posts found</p>
        )}
      </div>
    </div>
  )
}