import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing Supabase storage configuration...')
    
    // Create a service role client (has admin privileges)
    const supabase = createServiceRoleClient()
    
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
    
    // Check specific buckets we're using
    const postMediaBucket = buckets.find(bucket => bucket.name === 'post-media')
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars')
    
    // Get bucket details
    let postMediaDetails = null
    let avatarsDetails = null
    
    if (postMediaBucket) {
      const { data, error } = await supabase.storage.getBucket('post-media')
      if (!error) {
        postMediaDetails = data
      }
    }
    
    if (avatarsBucket) {
      const { data, error } = await supabase.storage.getBucket('avatars')
      if (!error) {
        avatarsDetails = data
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      buckets: buckets,
      postMediaBucket: postMediaBucket ? { ...postMediaBucket, details: postMediaDetails } : null,
      avatarsBucket: avatarsBucket ? { ...avatarsBucket, details: avatarsDetails } : null
    })
  } catch (err: unknown) {
    console.error('Exception in test-storage-config route:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}