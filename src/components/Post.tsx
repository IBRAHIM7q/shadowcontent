'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthUser } from '@/lib/store'
import Link from 'next/link'

interface PostProps {
  post: {
    id: string
    user_id: string
    media_url: string
    title: string
    created_at: string
  }
}

interface UserData {
  id: string
  username: string
  avatar_url: string
}

export default function Post({ post }: PostProps) {
  const currentUser = useAuthUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .eq('id', post.user_id)
        .single()
      
      if (error) throw error
      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchLikes = async () => {
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id)
      
      if (error) throw error
      setLikes(count || 0)
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const fetchComments = async () => {
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id)
      
      if (error) throw error
      setComments(count || 0)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const checkIfLiked = async () => {
    if (!currentUser) return
    
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id)
        .maybeSingle()
      
      if (error) throw error
      setLiked(!!data)
    } catch (error) {
      console.error('Error checking if liked:', error)
    }
  }

  const handleLike = async () => {
    if (!currentUser) return
    
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id)
        
        if (error) throw error
        setLiked(false)
        setLikes(prev => prev - 1)
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: currentUser.id
          })
        
        if (error) throw error
        setLiked(true)
        setLikes(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchLikes(),
        fetchComments(),
        checkIfLiked()
      ])
      setLoading(false)
    }

    fetchData()
  }, [post.user_id, post.id, currentUser, fetchUserData, fetchLikes, fetchComments, checkIfLiked])

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-card animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-700"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
        <div className="h-64 bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-card">
      {/* Post header */}
      <div className="flex items-center gap-3 mb-4">
        {userData?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={userData.avatar_url} 
            alt={userData.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <span className="text-white font-bold">
              {userData?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div>
          <Link href={`/profile/${post.user_id}`} className="font-semibold hover:text-green-400 transition-colors">
            {userData?.username || 'User'}
          </Link>
          <p className="text-gray-400 text-sm">
            {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </div>

      {/* Post media */}
      <div className="rounded-xl overflow-hidden mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={post.media_url} 
          alt={post.title} 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Post title */}
      {post.title && (
        <p className="mb-4">{post.title}</p>
      )}

      {/* Post actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-700">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{likes}</span>
        </button>
        
        <Link 
          href={`/post/${post.id}`} 
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments}</span>
        </Link>
      </div>
    </div>
  )
}