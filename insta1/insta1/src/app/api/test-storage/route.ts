import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Function to create service role client only when needed
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // Create a minimal client for service role operations
  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      get() {
        return null
      },
      set() {
        // no-op
      },
      remove() {
        // no-op
      },
    },
  })
}

export async function GET() {
  try {
    console.log('Testing Supabase storage...')
    
    // Only create the Supabase client when we actually need it
    const supabase = getServiceRoleClient()
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json({ 
        success: false, 
        error: bucketsError.message,
        details: bucketsError
      }, { status: 500 })
    }
    
    console.log('Buckets found:', buckets)
    
    // Check if the 'post-media' bucket exists (updated from 'media')
    const mediaBucket = buckets.find(bucket => bucket.name === 'post-media')
    
    if (!mediaBucket) {
      return NextResponse.json({ 
        success: false, 
        error: "Bucket 'post-media' not found",
        buckets: buckets
      }, { status: 404 })
    }
    
    console.log('Post-media bucket found:', mediaBucket)
    
    // Test creating a simple file in the post-media bucket
    const testFileName = `test_${Date.now()}.txt`
    const testFileContent = 'This is a test file for storage verification'
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('post-media')
      .upload(testFileName, testFileContent, {
        contentType: 'text/plain'
      })
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: uploadError.message,
        details: uploadError
      }, { status: 500 })
    }
    
    console.log('Test file uploaded successfully:', uploadData)
    
    // Try to get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('post-media')
      .getPublicUrl(testFileName)
    
    console.log('Public URL data:', publicUrlData)
    
    // Clean up - delete the test file
    const { error: deleteError } = await supabase
      .storage
      .from('post-media')
      .remove([testFileName])
    
    if (deleteError) {
      console.error('Error deleting test file:', deleteError)
    } else {
      console.log('Test file deleted successfully')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage test passed',
      buckets: buckets,
      uploadData: uploadData,
      publicUrl: publicUrlData.publicUrl
    })
  } catch (err: unknown) {
    console.error('Exception in test-storage route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}