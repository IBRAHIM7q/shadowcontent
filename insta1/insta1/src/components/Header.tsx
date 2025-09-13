'use client'

import { useState, useEffect } from 'react'
import { useAuthUser, useAuthLoading } from '@/lib/store'
import Link from 'next/link'
import UploadModal from './UploadModal'
import { supabase } from '@/lib/supabase'

// Define types for our data
interface User {
  id: string
  username: string
  email: string
  avatar_url: string
}

export default function Header() {
  const user = useAuthUser() as User
  const loading = useAuthLoading()
  const [showModal, setShowModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add debugging to see what's happening with auth state
  useEffect(() => {
    console.log('Header auth state:', { user, loading })
  }, [user, loading])

  return (
    <>
      {/* Desktop sidebar */}
      <header className="hidden md:block md:fixed md:left-0 md:top-0 md:h-full md:w-64 bg-gray-900/80 backdrop-blur-md border-r border-gray-800 z-30">
        <div className="flex flex-col h-full p-4">
          <Link href="/" className="flex items-center gap-2 group mb-8 mt-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img 
                src="/images/shadow-logo.png" 
                alt="Shadow Logo" 
                className="w-full h-full rounded-full object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-green-500 transition-all">
              Shadow
            </span>
          </Link>

          {/* Navigation links */}
          <div className="flex flex-col space-y-4 flex-grow">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Post
                </button>
                <Link 
                  href="/profile" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-600 text-black px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-button"
                >
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  Profile
                </Link>
                <div className="mt-auto">
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase.getInstance().auth.signOut()
                        if (error) {
                          console.error('Error signing out:', error)
                        } else {
                          window.location.href = '/'
                        }
                      } catch (error) {
                        console.error('Exception signing out:', error)
                      }
                    }}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-button w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3 mt-auto">
                <Link 
                  href="/auth/signin" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-button text-center"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-button text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 z-30">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-300 hover:text-green-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          {user && (
            <>
              <button 
                onClick={() => setShowModal(true)}
                className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-300 hover:text-green-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs mt-1">Create</span>
              </button>
              
              <Link href="/profile" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-300 hover:text-green-400 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-xs text-black font-bold">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </>
          )}
          
          {!user ? (
            <Link href="/auth/signin" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-300 hover:text-green-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">Sign In</span>
            </Link>
          ) : (
            <button 
              onClick={async () => {
                try {
                  const { error } = await supabase.getInstance().auth.signOut()
                  if (error) {
                    console.error('Error signing out:', error)
                  } else {
                    window.location.href = '/'
                  }
                } catch (error) {
                  console.error('Exception signing out:', error)
                }
              }}
              className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-300 hover:text-green-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
    </>
  )
}
