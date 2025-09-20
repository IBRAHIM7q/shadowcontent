// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Define proper types for our mock client
interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  };
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface ResendParams {
  type: string;
  email: string;
}

interface UpdateUserAttributes {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
}

interface UploadOptions {
  cacheControl?: string;
  upsert?: boolean;
  contentType?: string;
}

interface MockAuth {
  getSession: () => Promise<{ data: { session: null }; error: null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ data: { user: null; session: null }; error: null }>;
  signInWithPassword: (credentials: SignInCredentials) => Promise<{ data: { user: null; session: null }; error: null }>;
  signOut: () => Promise<{ error: null }>;
  updateUser: (attributes: UpdateUserAttributes) => Promise<{ data: { user: null }; error: null }>;
  resend: (params: ResendParams) => Promise<{ error: null }>;
}

interface MockStorageFile {
  path: string;
}

interface MockPublicUrlData {
  publicUrl: string;
}

interface MockStorage {
  from: (bucket: string) => {
    upload: (path: string, file: File | string, options?: UploadOptions) => Promise<{ data: MockStorageFile; error: null }>;
    getPublicUrl: (path: string) => { data: MockPublicUrlData };
    remove: (paths: string[]) => Promise<{ data: null; error: null }>;
    listBuckets: () => Promise<{ data: Array<{name: string}>; error: null }>;
  };
}

interface MockDatabaseQuery {
  single: () => Promise<{ data: null; error: null }>;
  limit: (count: number) => Promise<{ data: null; error: null }>;
}

interface MockDatabase {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string | number) => MockDatabaseQuery;
      order: (column: string, options: { ascending: boolean }) => {
        eq: (column: string, value: string | number) => Promise<{ data: null; error: null }>;
      };
      limit: (count: number) => Promise<{ data: null; error: null }>;
      single: () => Promise<{ data: null; error: null }>;
    };
    insert: (data: Record<string, unknown>) => Promise<{ data: null; error: null }>;
    update: (data: Record<string, unknown>) => {
      eq: (column: string, value: string | number) => Promise<{ data: null; error: null }>;
    };
    delete: () => {
      eq: (column: string, value: string | number) => Promise<{ data: null; error: null }>;
    };
  };
}

interface MockClient {
  auth: MockAuth;
  from: (table: string) => MockDatabase['from'];
  storage: MockStorage;
}

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
  from: (table: string) => {
    // Implement the MockDatabase['from'] interface
    return {
      select: (columns?: string) => {
        return {
          eq: (column: string, value: string | number) => {
            // Return MockDatabaseQuery
            return {
              single: () => Promise.resolve({ data: null, error: null }),
              limit: (count: number) => Promise.resolve({ data: null, error: null })
            };
          },
          order: (column: string, options: { ascending: boolean }) => {
            return {
              eq: (column: string, value: string | number) => Promise.resolve({ data: null, error: null })
            };
          },
          limit: (count: number) => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null })
        };
      },
      insert: (data: Record<string, unknown>) => Promise.resolve({ data: null, error: null }),
      update: (data: Record<string, unknown>) => {
        return {
          eq: (column: string, value: string | number) => Promise.resolve({ data: null, error: null })
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: string | number) => Promise.resolve({ data: null, error: null })
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File | string, options?: UploadOptions) => Promise.resolve({ data: { path: '' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
      remove: (paths: string[]) => Promise.resolve({ data: null, error: null }),
      listBuckets: () => Promise.resolve({ data: [], error: null }),
    })
  }
}

// Cache for the client instance
let client: ReturnType<typeof createBrowserClient> | null = null

// Export the supabase client directly
export const supabase = typeof window === 'undefined' 
  ? mockClient 
  : (client || (client = createSupabaseClient()))

// For server-side usage
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return mockClient
  }
  return createSupabaseClient()
}