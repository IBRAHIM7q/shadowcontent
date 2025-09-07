'use client'  // ✅ Diese Zeile muss ganz oben stehen
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Post from './Post'

// Define types for our data
interface User {
  id: string
  username: string
  email: string
  avatar_url: string
}

interface PostType {
  id: string
  title: string
  caption: string
  media_url: string
  user_id: string
  created_at: string
  users: User | null
}

// Interface for the raw data from Supabase
interface RawPostType {
  id: string
  title: string
  caption: string
  media_url: string
  user_id: string
  created_at: string
  users: Array<{
    id: string
    username: string
    email: string
    avatar_url: string
  }>
}

export default function Feed() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data for a specific user ID with proper return type
  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, avatar_url')
        .eq('id', userId)
        .single()
        
      if (error) {
        console.error('Error fetching user data:', error.message || error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Exception fetching user data:', error)
      return null
    }
  }

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...')
      setLoading(true)
      setError(null)
      
      // Fixed the relationship reference to use the correct foreign key
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          caption,
          media_url,
          user_id,
          created_at,
          users!posts_user_id_fkey (id, username, email, avatar_url)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading posts:', error.message || error)
        setError(error.message || 'Failed to load posts')
      } else {
        console.log('Posts fetched:', data)
        // Handle the nested user data properly
        const postsData: PostType[] = await Promise.all(
          (data as RawPostType[]).map(async (post: RawPostType) => {
            // Extract the first user from the array or null if empty
            let userData = post.users && post.users.length > 0 ? post.users[0] : null
            
            // If user data is missing but we have a user_id, fetch the user data
            if (!userData && post.user_id) {
              userData = await fetchUserData(post.user_id)
            }
            
            return {
              id: post.id,
              title: post.title,
              caption: post.caption,
              media_url: post.media_url,
              user_id: post.user_id,
              created_at: post.created_at,
              users: userData
            }
          })
        )
        
        setPosts(postsData || [])
      }
    } catch (error: unknown) {
      // Type guard to check if error has a message property
      if (error instanceof Error) {
        console.error('Exception loading posts:', error.message)
        setError(error.message || 'Failed to load posts')
      } else {
        console.error('Exception loading posts:', error)
        setError('Failed to load posts')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) return <p className="text-center p-4 text-gray-400">Loading...</p>
  
  if (error) return <p className="text-center p-4 text-red-500">Error loading posts: {error}</p>

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {posts.length > 0 ? (
        posts.map(post => (
          <Post key={post.id} post={post} />
        ))
      ) : (
        <div className="col-span-full text-center p-8 rounded-2xl bg-gray-800/50 border border-gray-700 shadow-card">
          <p className="text-gray-400">No posts available</p>
        </div>
      )}
    </main>
  )
}