//signup//
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [requiresConfirmation, setRequiresConfirmation] = useState(false)
  const router = useRouter()

const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    setRequiresConfirmation(false)

    try {
      // First, try to sign up the user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      // Check if email confirmation is required
      if (data.user && !data.user.identities) {
        // This means the user already exists and needs to confirm their email
        setRequiresConfirmation(true)
        setSuccess(true)
      } else if (data.user) {
        // Try to sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          // Email confirmation is required
          setRequiresConfirmation(true)
          setSuccess(true)
        } else {
          // Successfully signed in
          router.push('/')
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      // Type guard to check if error has a message property
      if (error instanceof Error) {
        if (error.message.includes('already been registered')) {
          setError('This email address is already registered. Please sign in instead.')
        } else {
          setError(error.message || 'An error occurred during signup. Please try again.')
        }
      } else {
        setError('An error occurred during signup. Please try again.')
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
              <img 
                src="/images/shadow-logo.png" 
                alt="Shadow Logo" 
                className="w-full h-full rounded-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Create an account</h2>
          <p className="mt-2 text-gray-400">
            Join Shadow today
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg">{error}</div>
        )}

        {success && !requiresConfirmation && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 p-3 rounded-lg">
            Account created successfully! Redirecting...
          </div>
        )}

        {requiresConfirmation && (
          <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-3 rounded-lg">
            <p className="font-medium">Account created successfully!</p>
            <p className="mt-1">Please check your email ({email}) for a confirmation link.</p>
            <p className="mt-2 text-sm">After confirming your email, you can <Link href="/auth/signin" className="underline hover:text-blue-300">sign in here</Link>.</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-input"
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
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 shadow-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-green-400 text-sm hover:text-green-300">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-green-400 hover:text-green-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
