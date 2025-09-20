'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface TestResult {
  success: boolean
  message: string
  data?: unknown
}

export default function TestSupabase() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      const results: TestResult[] = []
      
      try {
        // Test 1: Check if we can connect to Supabase
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1)
        
        if (error) {
          results.push({
            success: false,
            message: 'Failed to connect to Supabase',
            data: error.message
          })
        } else {
          results.push({
            success: true,
            message: 'Successfully connected to Supabase',
            data: data
          })
        }
      } catch (error) {
        results.push({
          success: false,
          message: 'Exception during Supabase test',
          data: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
        setTestResults(results)
      }
    }

    runTests()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      <div>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            className={`border p-4 mb-4 rounded ${result.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}
          >
            <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
            {result.data !== undefined && result.data !== null && (
              <pre className="mt-2 text-sm overflow-x-auto">
                {String(result.data)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}