'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'
import { X, Image, Video } from 'lucide-react'

// Define types for our data
interface User {
  id: string
  username: string
  email: string
  avatar_url: string
}

interface UploadModalProps {
  onClose: () => void
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const user = useAuthStore((state) => state.user) as User
  const loading = useAuthStore((state) => state.loading)
  const [step, setStep] = useState<'select' | 'post'>('select')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isStory, setIsStory] = useState(false) // Track if this is a story upload

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, story: boolean = false) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setIsStory(story)
      setStep('post')
    }
  }

  const ensureUserExists = async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    try {
      // Check if user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (userError || !userData) {
        // If user doesn't exist, create them
        const username = user.username || user.email?.split('@')[0] || 'User'
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            username: username,
            email: user.email,
            avatar_url: user.avatar_url || ''
          })
          .select()
          .single()
        
        if (insertError) {
          throw new Error('Error creating user profile: ' + insertError.message)
        }
        
        // Update the store with the new user data
        useAuthStore.getState().setUser({
          ...user,
          username: username,
          avatar_url: user.avatar_url || ''
        })
        
        return newUser
      }
      
      // Update the store with fresh user data
      useAuthStore.getState().setUser(userData)
      
      return userData
    } catch (err) {
      console.error('Error ensuring user exists:', err)
      throw err
    }
  }

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to upload content.')
      return
    }
    
    // Only require title for posts, not stories
    if (!isStory && !title.trim()) {
      setError('Title is required.')
      return
    }
    
    setError('')
    setUploading(true)

    try {
      // Ensure user exists in database and get updated user data
      const userData = await ensureUserExists()

      const fileName = `${Date.now()}_${file!.name}`
      const filePath = isStory ? `stories/${fileName}` : `posts/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file!)

      if (uploadError) {
        console.error('Upload error details:', JSON.stringify(uploadError, null, 2))
        throw uploadError
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath)

      // Log the public URL data for debugging
      console.log('Public URL data:', publicUrlData)

      const mediaUrl = publicUrlData.publicUrl

      // Verify that we got a valid URL
      if (!mediaUrl) {
        throw new Error('Failed to get public URL for uploaded media')
      }

      if (isStory) {
        // Insert into stories table
        const { error: dbError } = await supabase.from('stories').insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: file!.type.startsWith('image') ? 'image' : 'video',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        })

        if (dbError) {
          console.error('Database error details:', JSON.stringify(dbError, null, 2))
          throw dbError
        }
      } else {
        // Insert into posts table
        const { error: dbError } = await supabase.from('posts').insert({
          user_id: user.id,
          title,
          caption,
          media_url: mediaUrl,
          media_type: file!.type.startsWith('image') ? 'image' : 'video',
          created_at: new Date().toISOString(),
        })

        if (dbError) {
          console.error('Database error details:', JSON.stringify(dbError, null, 2))
          throw dbError
        }
      }

      alert(isStory ? 'Story successfully uploaded!' : 'Post successfully uploaded!')
      onClose()
      window.location.reload()
    } catch (err: unknown) {
      // Enhanced error logging as suggested
      console.error('Upload error:', JSON.stringify(err, null, 2))
      console.dir(err)
      
      // More descriptive error messages
      if (err instanceof Error) {
        console.error('Upload error:', err)
        setError('Upload failed: ' + err.message)
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        // Handle Supabase StorageApiError or similar objects
        const errorObj = err as { message?: string };
        setError('Upload failed: ' + (errorObj.message || 'Unknown error'))
      } else {
        console.error('Upload error:', err)
        setError('Upload failed: Unknown error')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-screen overflow-y-auto border border-gray-700 shadow-card">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img 
                src="/images/shadow-logo.png" 
                alt="Shadow Logo" 
                className="w-full h-full rounded-full object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 'select' ? 'Create' : isStory ? 'New Story' : 'New Post'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'select' && (
          <div className="p-6 space-y-6">
            <label className="flex flex-col items-center p-8 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-700/50 transition-colors">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="/images/shadow-logo.png" 
                  alt="Shadow Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-lg font-medium text-white">Select Photo or Video</span>
              <span className="text-gray-400 text-sm mt-1">Choose from your device</span>
              <input type="file" accept="image/*,video/*" onChange={(e) => handleFileChange(e, false)} className="hidden" />
            </label>

            <div className="flex space-x-4 text-center">
              <div className="flex-1">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Image size={28} className="text-green-400" />
                </div>
                <h3 className="font-medium text-white">Feed Post</h3>
                <p className="text-gray-400 text-sm mt-1">Share with followers</p>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={(e) => handleFileChange(e, false)} 
                  className="hidden" 
                  id="feed-post-upload"
                />
                <label 
                  htmlFor="feed-post-upload"
                  className="mt-2 inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm cursor-pointer transition-colors shadow-button"
                >
                  Select
                </label>
              </div>
              <div className="flex-1">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video size={28} className="text-green-500" />
                </div>
                <h3 className="font-medium text-white">Story</h3>
                <p className="text-gray-400 text-sm mt-1">24-hour content</p>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={(e) => handleFileChange(e, true)} 
                  className="hidden" 
                  id="story-upload"
                />
                <label 
                  htmlFor="story-upload"
                  className="mt-2 inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm cursor-pointer transition-colors shadow-button"
                >
                  Select
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 'post' && (
          <div className="p-6 space-y-4">
            {file && (
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-600">
                {file.type.startsWith('image') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={URL.createObjectURL(file)} 
                    className="w-full h-full object-contain"
                    controls
                  />
                )}
              </div>
            )}
            
            {!isStory && (
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white shadow-input"
                  placeholder="Add a title..."
                />
              </div>
            )}
            
            {!isStory && (
              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white shadow-input"
                  placeholder="Add a caption..."
                  rows={3}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-button"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || (!isStory && !title.trim())}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-green-600/50 disabled:to-green-700/50 disabled:cursor-not-allowed text-black rounded-lg transition-colors flex items-center justify-center shadow-button"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}