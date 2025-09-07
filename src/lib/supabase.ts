// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Create a function that initializes the Supabase client only when called
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Only throw errors in browser environment, not during build
  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For backward compatibility, we can still export a client instance
// but only initialize it when accessed in the browser
let client: ReturnType<typeof createBrowserClient> | null = null

// Define types for our mock client
interface MockAuth {
  getSession: () => Promise<{ data: { session: null }; error: null }>;
  signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ data: { user: null; session: null }; error: null }>;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: null; session: null }; error: null }>;
  signOut: () => Promise<{ error: null }>;
  updateUser: (attributes: any) => Promise<{ data: { user: null }; error: null }>;
  resend: (params: { type: string; email: string }) => Promise<{ error: null }>;
}

interface MockStorage {
  from: (bucket: string) => {
    upload: (path: string, file: any, options?: any) => Promise<{ data: { path: string }; error: null }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
    remove: (paths: string[]) => Promise<{ data: null; error: null }>;
    listBuckets: () => Promise<{ data: any[]; error: null }>;
  };
}

interface MockDatabase {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => { 
        single: () => Promise<{ data: null; error: null }>;
        limit: () => Promise<{ data: null; error: null }>;
      };
      order: (column: string, options: { ascending: boolean }) => {
        eq: (column: string, value: any) => Promise<{ data: null; error: null }>;
      };
      limit: (count: number) => Promise<{ data: null; error: null }>;
      single: () => Promise<{ data: null; error: null }>;
    };
    insert: (data: any) => Promise<{ data: null; error: null }>;
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<{ data: null; error: null }>;
    };
    delete: () => {
      eq: (column: string, value: any) => Promise<{ data: null; error: null }>;
    };
  };
}

interface MockClient {
  auth: MockAuth;
  from: MockDatabase['from'];
  storage: MockStorage;
}

// Mock client for build time
const mockClient: MockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
    resend: () => Promise.resolve({ error: null }),
  },
  from: (() => ({
    select: () => ({ 
      eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), limit: () => Promise.resolve({ data: null, error: null }) }),
      order: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      limit: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  })) as MockDatabase['from'],
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: '' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => Promise.resolve({ data: null, error: null }),
      listBuckets: () => Promise.resolve({ data: [], error: null }),
    })
  }
}

interface SupabaseInstance {
  getInstance: () => MockClient | ReturnType<typeof createBrowserClient>;
}

export const supabase: SupabaseInstance = {
  getInstance: () => {
    if (typeof window === 'undefined') {
      // Return a mock client during build time
      return mockClient
    }
    
    if (!client) {
      client = createSupabaseClient()
    }
    return client
  }
}

// For direct access in client components (only in browser)
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Return a mock client during build time instead of throwing an error
    return mockClient
  }
  return createSupabaseClient()
}