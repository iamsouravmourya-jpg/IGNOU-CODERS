import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/auth?error=oauth', requestUrl.origin))
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch {
    return NextResponse.redirect(
      new URL('/auth?error=configuration', requestUrl.origin),
    )
  }
}
