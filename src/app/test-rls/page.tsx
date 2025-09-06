'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestRLS() {
  const [policies, setPolicies] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchRLSPolicies = async () => {
      try {
        setLoading(true)
        console.log('Fetching RLS policies...')
        
        // This would normally require admin privileges, but let's try a different approach
        // Let's check if we can insert a test record
        const testId = `test_${Date.now()}`
        
        console.log('Testing insert permission...')
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: testId,
            username: 'test_user',
            email: `test_${testId}@example.com`
          })
        
        console.log('Insert result:', { insertData, insertError })
        
        // Try to delete the test record
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', testId)
        
        console.log('Delete result:', { deleteError })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          setError(`Insert error: ${insertError.message} (code: ${insertError.code})`)
        } else {
          setPolicies([{ 
            test: 'insert', 
            result: 'success',
            message: 'Able to insert records into users table'
          }])
        }
      } catch (err) {
        console.error('Exception testing RLS:', err)
        setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRLSPolicies()
  }, [])

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">RLS (Row Level Security) Test</h1>
      
      {loading && <p>Testing RLS policies...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        {policies.length > 0 ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <ul className="list-disc pl-5">
              {policies.map((policy, index) => (
                <li key={index}>
                  <strong>{policy.test}:</strong> {policy.result} - {policy.message}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No test results available</p>
        )}
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-bold text-lg mb-2">Note:</h3>
        <p>
          RLS (Row Level Security) policies control access to data in Supabase tables. 
          If you're getting permission errors when fetching user data, it might be due to 
          RLS policies that restrict access to the users table.
        </p>
        <p className="mt-2">
          To properly check RLS policies, you would need to use the Supabase dashboard or 
          connect with admin privileges using the service role key.
        </p>
      </div>
    </div>
  )
}