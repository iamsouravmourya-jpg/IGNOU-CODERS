import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const providerError = requestUrl.searchParams.get('error')

  if (providerError) {
    return NextResponse.redirect(
      new URL('/auth?error=access_denied', requestUrl.origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=oauth', requestUrl.origin))
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(
        new URL('/auth?error=configuration', requestUrl.origin),
      )
    }

    const response = NextResponse.redirect(
      new URL('/dashboard', requestUrl.origin),
    )
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options: CookieOptions
          }[],
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Supabase OAuth code exchange failed:', error.message)
      return NextResponse.redirect(new URL('/auth?error=oauth', requestUrl.origin))
    }

    return response
  } catch (error) {
    console.error('Supabase OAuth callback failed:', error)
    return NextResponse.redirect(
      new URL('/auth?error=configuration', requestUrl.origin),
    )
  }
}
