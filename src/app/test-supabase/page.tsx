'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

// Define proper types for our data
interface TestResultData {
  session?: string;
  usersSample?: Array<{ id: string }>;
}

interface TestResult {
  success: boolean;
  data?: TestResultData;
  error?: string;
}

export default function TestSupabase() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Get Supabase client instance
        const supabase = getSupabaseClient()
        
        // Test authentication status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setResult({ success: false, error: `Session error: ${sessionError.message}` })
          return
        }
        
        // Test basic connection with a simple query
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1)
        
        if (error) {
          setResult({ success: false, error: `Query error: ${error.message}` })
          return
        }
        
        setResult({ 
          success: true, 
          data: {
            session: session ? 'authenticated' : 'not authenticated',
            usersSample: data
          }
        })
      } catch (error) {
        setResult({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    testSupabase()
  }, [])

  if (loading) return <div className="p-4">Testing Supabase connection...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <h2 className="font-bold mb-2">{result.success ? 'Success' : 'Error'}</h2>
          {result.data && (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          {result.error && <p>{result.error}</p>}
        </div>
      )}
    </div>
  )
}