// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Erstellt einen Supabase-Client, der im Server-Kontext läuft
 * und automatisch die Cookies (Session) verwaltet.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string) {
          try {
            cookieStore.set({ name, value })
          } catch {
            // Ignorieren: set() wird im Server Component Kontext geblockt
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete({ name })
          } catch {
            // Ignorieren: delete() wird im Server Component Kontext geblockt
          }
        },
      },
    }
  )
}

/**
 * Supabase-Client mit Service Role Key.
 * ⚠️ Nur für Server-Only Code verwenden (z. B. in API-Routen oder Server Actions).
 * Niemals im Client einsetzen!
 */
export function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
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
    }
  )
}