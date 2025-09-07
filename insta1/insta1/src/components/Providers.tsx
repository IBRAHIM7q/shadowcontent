'use client'

// No unused imports in this file

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // The auth listener is now handled in the store
  // This component is kept for potential future use but doesn't need to do anything
  
  return <>{children}</>
}