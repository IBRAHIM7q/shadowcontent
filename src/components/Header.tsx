'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthUser, useAuthLoading, useAuthStore } from '@/lib/store'
import { Menu, X, Home, Search, Plus, Heart, User } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = useAuthUser()
  const loading = useAuthLoading()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear the store
      useAuthStore.getState().setUser(null)
      
      // Redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch user data
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, username, email, avatar_url')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching user data:', error)
          useAuthStore.getState().setUser(null)
        } else {
          useAuthStore.getState().setUser(userData)
        }
      } else {
        useAuthStore.getState().setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      useAuthStore.getState().setUser(null)
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  // Navigation items
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/upload', label: 'Create', icon: Plus },
    { href: '/activity', label: 'Activity', icon: Heart },
    { href: user ? `/profile/${user.id}` : '/profile', label: 'Profile', icon: User },
  ]

  return (
    <header className="fixed top-0 left-0 h-full w-16 md:w-64 bg-gray-900 border-r border-gray-800 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <span className="text-black font-bold text-lg">S</span>
          </div>
          <span className="hidden md:block text-xl font-bold">Shadow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gray-800 text-green-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={24} />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-800">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="hidden md:block h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
          </div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="hidden md:block text-left">
                <p className="font-medium text-sm">{user.username || 'User'}</p>
                <p className="text-xs text-gray-400">View profile</p>
              </span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10">
                <Link
                  href={`/profile/${user.id}`}
                  className="block px-4 py-3 text-sm hover:bg-gray-700 rounded-t-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/profile/edit"
                  className="block px-4 py-3 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 rounded-b-xl"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/signin"
              className="hidden md:block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black py-2 px-4 rounded-xl text-center font-medium transition-all duration-300"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="hidden md:block w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl text-center font-medium transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/signin"
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-black"
            >
              <User size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 rounded-t-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-gray-800 text-green-400' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={24} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}