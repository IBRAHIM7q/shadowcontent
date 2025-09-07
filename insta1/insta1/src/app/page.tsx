'use client'

import { useEffect } from 'react'
import { useAuthUser, useAuthLoading } from '@/lib/store'
import Header from '@/components/Header'
import Stories from '@/components/Stories'
import Feed from '@/components/Feed'
import Link from 'next/link'

export default function Home() {
  const user = useAuthUser()
  const loading = useAuthLoading()

  // Add debugging to see what's happening with auth state
  useEffect(() => {
    console.log('Home page auth state:', { user, loading })
  }, [user, loading])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
        <Header />
        <div className="flex items-center justify-center min-h-screen flex-grow">
          <div className="text-center md:ml-64">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <Header />
      <div className="flex-grow md:ml-64 pb-16 md:pb-0">
        {user ? (
          <div className="max-w-6xl mx-auto">
            <Stories />
            <Feed />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-700 shadow-card text-center md:ml-64">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <img 
                  src="/images/shadow-logo.png" 
                  alt="Shadow Logo" 
                  className="w-full h-full rounded-full object-contain"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Welcome to Shadow
              </h1>
              
              <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                Share your moments, connect with friends, and discover amazing content from our creative community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/auth/signin" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-button"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 border border-gray-700 shadow-button"
                >
                  Create Account
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-card">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Connect</h3>
                  <p className="text-gray-400">Follow friends and discover new creators</p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-card">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v10m0 0l3-3m-3 3l-3-3" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Share</h3>
                  <p className="text-gray-400">Post photos and videos with creative effects</p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-card">
                  <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Explore</h3>
                  <p className="text-gray-400">Discover trending content and challenges</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}