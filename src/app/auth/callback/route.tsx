import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(
      `/auth/signin?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (code) {
    try {
      // ✅ Korrektur: In Route Handlers ist cookies() async
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set(name, value, options)
              } catch {}
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.delete(name)
              } catch {}
            },
          },
        }
      )

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError

      const user = data?.session?.user
      if (user) {
        const serverSupabase = await createServerSupabaseClient()
        const { data: existingUser } = await serverSupabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // Create user with the actual schema
          const username = user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`
          await serverSupabase.from('users').insert({
            id: user.id,
            email: user.email,
            // Only include fields that actually exist in the table
          })
        }
      }
    } catch {
      return NextResponse.redirect('/auth/signin?error=auth_failed&message=Authentication failed')
    }
  }

  return NextResponse.redirect('/')
}