'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSchema() {
  const [tables, setTables] = useState<any[]>([])
  const [usersTable, setUsersTable] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSchemaInfo = async () => {
      try {
        setLoading(true)
        console.log('Fetching schema information...')
        
        // Get list of tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .eq('table_schema', 'public')
        
        if (tablesError) {
          console.error('Error fetching tables:', tablesError)
          setError(`Tables error: ${tablesError.message}`)
          setLoading(false)
          return
        }
        
        console.log('Tables found:', tablesData)
        setTables(tablesData || [])
        
        // Check users table structure
        const { data: usersColumns, error: usersError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'users')
          .eq('table_schema', 'public')
          .order('ordinal_position')
        
        if (usersError) {
          console.error('Error fetching users table info:', usersError)
          setError(`Users table error: ${usersError.message}`)
        } else {
          console.log('Users table columns:', usersColumns)
          setUsersTable(usersColumns)
        }
        
        // Let's also check what's actually in the users table
        const { data: usersData, error: usersDataError } = await supabase
          .from('users')
          .select('*')
          .limit(5)
        
        if (usersDataError) {
          console.error('Error fetching users data:', usersDataError)
          setError(prev => prev ? `${prev}; Users data error: ${usersDataError.message}` : `Users data error: ${usersDataError.message}`)
        } else {
          console.log('Sample users data:', usersData)
        }
      } catch (err) {
        console.error('Exception fetching schema:', err)
        setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchSchemaInfo()
  }, [])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Schema Test</h1>
      
      {loading && <p>Loading schema information...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tables in Database</h2>
        {tables.length > 0 ? (
          <ul className="list-disc pl-5">
            {tables.map((table, index) => (
              <li key={index}>{table.table_name} ({table.table_schema})</li>
            ))}
          </ul>
        ) : (
          <p>No tables found</p>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Users Table Structure</h2>
        {usersTable ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Column Name</th>
                  <th className="py-2 px-4 border-b">Data Type</th>
                  <th className="py-2 px-4 border-b">Nullable</th>
                </tr>
              </thead>
              <tbody>
                {usersTable.map((column: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 border-b">{column.column_name}</td>
                    <td className="py-2 px-4 border-b">{column.data_type}</td>
                    <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Users table information not available</p>
        )}
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-bold text-lg mb-2">Analysis:</h3>
        <p>
          Based on the error message "column users.username does not exist", it appears that the users table 
          in your database doesn't have the expected schema. The application is trying to query for columns 
          like 'username', 'email', 'avatar_url', etc. but they may not exist in your current database schema.
        </p>
        <p className="mt-2">
          You'll need to either:
          1. Update your database schema to match what the application expects, or
          2. Update the application code to match your actual database schema
        </p>
      </div>
    </div>
  )
}