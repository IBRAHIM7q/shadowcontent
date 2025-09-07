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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('bucket') || 'post-media'
    const fileName = searchParams.get('file') || 'test.txt'
    
    console.log(`Testing signed URL for ${bucketName}/${fileName}`)
    
    // Only create the Supabase client when we actually need it
    const supabase = getServiceRoleClient()
    
    // Create a test file first
    const testContent = 'This is a test file for signed URL verification'
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      })
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: uploadError.message,
        details: uploadError
      }, { status: 500 })
    }
    
    console.log('Test file uploaded successfully')
    
    // Try to create a signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60) // Valid for 60 seconds
    
    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError)
      return NextResponse.json({ 
        success: false, 
        error: signedUrlError.message,
        details: signedUrlError
      }, { status: 500 })
    }
    
    console.log('Signed URL created successfully:', signedUrlData)
    
    // Also get public URL for comparison
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    console.log('Public URL data:', publicUrlData)
    
    // Clean up - delete the test file
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName])
    
    if (deleteError) {
      console.error('Error deleting test file:', deleteError)
    } else {
      console.log('Test file deleted successfully')
    }
    
    return NextResponse.json({ 
      success: true, 
      signedUrl: signedUrlData.signedUrl,
      publicUrl: publicUrlData.publicUrl
    })
  } catch (err: unknown) {
    console.error('Exception in test-signed-url route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}