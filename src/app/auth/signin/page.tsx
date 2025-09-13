///signin//
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checkingConfirmation, setCheckingConfirmation] = useState(false)
  const router = useRouter()

const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault()
    setLoading(true)
    setError('')
    setCheckingConfirmation(false)

    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      console.log('Attempting to sign in with email:', email)
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      console.log('Sign in response:', { error, data })
      
      if (error) {
        console.error('Sign in error:', error)
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in. Check your inbox for the confirmation email.')
          setCheckingConfirmation(true)
        } else {
          setError(error.message)
        }
        return
      }
      
      // Successfully signed in
      console.log('Sign in successful, redirecting to home')
      router.push('/')
    } catch (error: unknown) {
      console.error('Unexpected sign in error:', error)
      // Type guard to check if error has a message property
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to resend confirmation email
  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }

    setLoading(true)
    try {
      // Get Supabase client instance
      const supabase = getSupabaseClient()
      
      console.log('Resending confirmation email to:', email)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        console.error('Error resending confirmation email:', error)
        setError(error.message)
      } else {
        setError('')
        alert('Confirmation email resent! Please check your inbox.')
      }
    } catch (error: unknown) {
      console.error('Unexpected error resending confirmation email:', error)
      // Type guard to check if error has a message property
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to resend confirmation email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 pb-16 md:pb-0">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/shadow-logo.png" 
                alt="Shadow Logo" 
                className="w-full h-full rounded-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Sign in</h2>
          <p className="mt-2 text-gray-400">
            to continue to Shadow
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg">
            {error}
            {checkingConfirmation && (
              <div className="mt-2">
                <button
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-purple-400 underline text-sm hover:text-purple-300"
                >
                  {loading ? 'Resending...' : 'Resend confirmation email'}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-input"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 shadow-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-black py-3 rounded-lg hover:from-green-500 hover:to-green-600 disabled:opacity-50 shadow-button"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-green-400 text-sm hover:text-green-300">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-green-400 hover:text-green-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}