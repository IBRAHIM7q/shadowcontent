'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

// Add this interface for the raw comment data from Supabase
interface RawComment {
  id: string
  text: string
  user_id: string
  users: Array<{
    username: string
  }>
}

interface Comment {
  id: string
  text: string
  user_id: string
  users: {
    username: string
  }
}

export default function Post({ post: initialPost }: { post: PostType }) {
  const user = useAuthStore((state) => state.user) as User
  const [post, setPost] = useState<PostType>(initialPost)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  
  // Move all function declarations before useEffect hooks
  const fetchLikes = async () => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id)
        
      if (error) {
        console.error('Error fetching likes:', error.message || error)
        return
      }
      
      setLikes(count || 0)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception fetching likes:', error.message)
      } else {
        console.error('Exception fetching likes:', error)
      }
    }
  }
  
  const fetchCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id)
        
      if (error) {
        console.error('Error fetching comment count:', error.message || error)
        return
      }
      
      setCommentCount(count || 0)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception fetching comment count:', error.message)
      } else {
        console.error('Exception fetching comment count:', error)
      }
    }
  }
  
  const checkIfLiked = async () => {
    if (!user || !post?.id) return
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single()
        
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error checking if liked:', error.message || error)
      }
      
      setLiked(!!data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception checking if liked:', error.message)
      } else {
        console.error('Exception checking if liked:', error)
      }
    }
  }
  
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, text, user_id, users(username)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        
      if (error) {
        console.error('Error fetching comments:', error.message || error)
        return
      }
      
      // Handle the nested user data properly
      const commentsData: Comment[] = (data as RawComment[]).map((comment: RawComment) => ({
        id: comment.id,
        text: comment.text,
        user_id: comment.user_id,
        users: comment.users && comment.users.length > 0 
          ? comment.users[0] 
          : { username: 'Unknown' }
      }))
      
      setComments(commentsData || [])
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception fetching comments:', error.message)
      } else {
        console.error('Exception fetching comments:', error)
      }
    }
  }
  
  // Fetch user data if it's missing
  const fetchUserData = async () => {
    if (post.users) return // User data already exists
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, avatar_url')
        .eq('id', post.user_id)
        .single()
        
      if (error) {
        console.error('Error fetching user data:', error.message || error)
        return
      }
      
      if (data) {
        setPost(prevPost => ({
          ...prevPost,
          users: data
        }))
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception fetching user data:', error.message)
      } else {
        console.error('Exception fetching user data:', error)
      }
    }
  }
  
  const toggleLike = async () => {
    if (!user || !post?.id) return
    try {
      // Ensure user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        // If user doesn't exist, create them
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            username: user.username || user.email?.split('@')[0] || 'User',
            email: user.email
          })
        
        if (insertError) {
          console.error('Error creating user:', insertError.message || insertError)
          return
        }
      }
      
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)
          
        if (error) {
          console.error('Error unliking post:', error.message || error)
          return
        }
        
        setLikes(likes - 1)
      } else {
        const { error } = await supabase.from('likes').insert({
          user_id: user.id,
          post_id: post.id,
        })
        
        if (error) {
          console.error('Error liking post:', error.message || error)
          return
        }
        
        setLikes(likes + 1)
      }
      setLiked(!liked)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception toggling like:', error.message)
      } else {
        console.error('Exception toggling like:', error)
      }
    }
  }
  
  const addComment = async () => {
    if (!newComment.trim() || !user || !post?.id) return
    try {
      // Ensure user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        // If user doesn't exist, create them
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            username: user.username || user.email?.split('@')[0] || 'User',
            email: user.email
          })
        
        if (insertError) {
          console.error('Error creating user:', insertError.message || insertError)
          return
        }
      }
      
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        post_id: post.id,
        text: newComment,
      })
      
      if (error) {
        console.error('Error adding comment:', error.message || error)
        return
      }
      
      setNewComment('')
      fetchComments()
      fetchCommentCount()
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception adding comment:', error.message)
      } else {
        console.error('Exception adding comment:', error)
      }
    }
  }
  
  // Add delete comment functionality
  const deleteComment = async (commentId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only delete their own comments
      
      if (error) {
        console.error('Error deleting comment:', error.message || error)
        return
      }
      
      fetchComments()
      fetchCommentCount()
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception deleting comment:', error.message)
      } else {
        console.error('Exception deleting comment:', error)
      }
    }
  }
  
  // Add delete post functionality
  const deletePost = async () => {
    if (!user || post.user_id !== user.id) return
    
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
    if (!confirmed) return
    
    try {
      // First delete associated likes and comments
      await supabase.from('likes').delete().eq('post_id', post.id)
      await supabase.from('comments').delete().eq('post_id', post.id)
      
      // Then delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error deleting post:', error.message || error)
        alert('Failed to delete post. Please try again.')
        return
      }
      
      // Refresh the page to reflect changes
      window.location.reload()
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception deleting post:', error.message)
      } else {
        console.error('Exception deleting post:', error)
      }
      alert('Failed to delete post. Please try again.')
    }
  }
  
  useEffect(() => {
    if (!post?.id) return
    fetchLikes()
    fetchComments()
    fetchCommentCount()
    checkIfLiked()
    fetchUserData() // Fetch user data if missing
  }, [post?.id, user])
  
  // Realtime: Live-Likes
  useEffect(() => {
    if (!post?.id) return
    const channel = supabase
      .channel(`likes-${post.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'likes',
        filter: `post_id=eq.${post.id}`,
      }, fetchLikes)
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'likes',
        filter: `post_id=eq.${post.id}`,
      }, fetchLikes)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [post?.id])
  
  // Realtime: Live-Comments
  useEffect(() => {
    if (!post?.id) return
    const channel = supabase
      .channel(`comments-${post.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${post.id}`,
      }, fetchCommentCount)
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${post.id}`,
      }, fetchCommentCount)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [post?.id])
  
  // Handle case where post data might be undefined
  if (!post) {
    return <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-4">Invalid post data</div>
  }
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-card">
      {/* User Info */}
      <div className="p-3 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {post.users?.id && post.users.id !== '' ? (
            <Link href={`/profile/${post.users.id}`}>
              <img
                src={post.users.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=profile'}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=profile'
                }}
              />
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700"></div>
          )}
          {post.users?.id && post.users.id !== '' ? (
            <Link href={`/profile/${post.users.id}`} className="text-white font-medium text-sm">
              {post.users.username || 'Unknown User'}
            </Link>
          ) : (
            <span className="text-white font-medium text-sm">
              {post.user_id ? 'Loading...' : 'Deleted User'}
            </span>
          )}
        </div>
        
        {/* Delete button for post owner */}
        {user && post.user_id === user.id && (
          <button 
            onClick={deletePost}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      {/* Media */}
      <img
        src={post.media_url || '/images/placeholder.png'}
        alt="Post"
        className="w-full aspect-video object-cover cursor-pointer"
        onError={(e) => {
          // If the image fails to load, try to get a signed URL as fallback
          console.log('Image failed to load, attempting to get signed URL')
          e.currentTarget.src = '/images/placeholder.png'
        }}
      />
      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className="text-2xl" disabled={!user}>
            {liked ? '❤️' : '🤍'}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="text-white">💬</button>
        </div>
        <div className="flex gap-4">
          <p className="text-white text-sm"><strong>{likes}</strong> Likes</p>
          <p className="text-white text-sm"><strong>{commentCount}</strong> Comments</p>
        </div>
        <p className="text-white"><strong>{post.users?.username || 'Unknown'}:</strong> {post.title || 'No title'}</p>
        {post.caption && <p className="text-gray-300 text-sm">{post.caption}</p>}
        {post.created_at && (
          <p className="text-gray-500 text-xs">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
      {/* Comments */}
      {showComments && (
        <div className="p-3 border-t border-gray-800 bg-gray-800/50">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 mb-2">
                <p className="text-sm flex-1">
                  <strong>{c.users?.username || 'Unknown'}:</strong> {c.text || ''}
                </p>
                {user && c.user_id === user.id && (
                  <button 
                    onClick={() => deleteComment(c.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-1 bg-gray-800 text-white rounded text-sm shadow-input"
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
              disabled={!user}
            />
            <button
              onClick={addComment}
              className="bg-gradient-to-r from-green-600 to-green-700 text-black px-3 py-1 rounded text-sm shadow-button"
              disabled={!user || !newComment.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}