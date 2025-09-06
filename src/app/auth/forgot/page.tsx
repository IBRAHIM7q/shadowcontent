'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
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
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {sent ? (
          <div className="bg-green-900/50 border border-green-700 text-green-200 p-3 rounded-lg">
            Check your email for a reset link.
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-black py-3 rounded-lg hover:from-green-500 hover:to-green-600 disabled:opacity-50 shadow-button"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-gray-400">
          <Link href="/auth/signin" className="text-green-400 hover:text-green-300">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}