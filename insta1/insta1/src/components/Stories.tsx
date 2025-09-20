'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'
import StoryViewer from './StoryViewer'

// Define types for our data
interface User {
  id: string
  username: string
  avatar_url: string
}

// Interface for the raw data from Supabase
interface RawStory {
  id: string
  media_url: string
  media_type: string
  created_at: string
  user_id: string
  users: Array<{
    id: string
    username: string
    avatar_url: string
  }>
}

interface Story {
  id: string
  media_url: string
  media_type: string
  created_at: string
  user_id: string
  users: User | null
}

export default function Stories() {
  const user = useAuthStore((state) => state.user) as User
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)
  
  // Fetch user data for a specific user ID
  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
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
  
  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          created_at,
          user_id,
          users (id, username, avatar_url)
        `)
        .filter('expires_at', 'gt', new Date().toISOString())
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching stories:', error.message || error)
      } else {
        // Handle the nested user data properly
        const storiesData: Story[] = await Promise.all(
          (data as RawStory[]).map(async (story: RawStory) => {
            // Extract the first user from the array or null if empty
            let userData = story.users && story.users.length > 0 ? story.users[0] : null
            
            // If user data is missing but we have a user_id, fetch the user data
            if (!userData && story.user_id) {
              userData = await fetchUserData(story.user_id)
            }
            
            return {
              id: story.id,
              media_url: story.media_url,
              media_type: story.media_type,
              created_at: story.created_at,
              user_id: story.user_id,
              users: userData
            }
          })
        )
        
        setStories(storiesData || [])
      }
    } catch (error) {
      console.error('Exception fetching stories:', error)
    }
  }
  
  useEffect(() => {
    if (!user) return
    fetchStories()
  }, [user])
  
  // Add a function to handle story click
  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index)
  }
  
  const handleNavigate = (index: number) => {
    // Use setTimeout to avoid updating state during render
    setTimeout(() => {
      setSelectedStoryIndex(index)
    }, 0)
  }
  
  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 p-4 bg-gray-900/50 border-b border-gray-800">
        {user && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-2 border-green-500 rounded-full p-0.5">
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.username || 'user')}
                alt="You"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.username || 'user')
                }}
              />
            </div>
            <span className="text-xs text-white mt-1">Your Story</span>
          </div>
        )}
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStoryClick(index)}
          >
            <div className="w-16 h-16 border-2 border-gradient rounded-full p-0.5 bg-gradient-to-r from-green-500 to-green-600">
              <img
                src={story.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (story.users?.username || story.user_id || 'user')}
                alt={story.users?.username || 'User'}
                className="w-full h-full rounded-full object-cover bg-gray-800"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (story.users?.username || story.user_id || 'user')
                }}
              />
            </div>
            <span className="text-xs text-white mt-1 truncate w-16 text-center">
              {story.users?.username || (story.user_id ? 'Loading...' : 'Deleted User')}
            </span>
          </div>
        ))}
      </div>
      {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
        <StoryViewer 
          storyId={stories[selectedStoryIndex].id} 
          stories={stories}
          currentIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)} 
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}