import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { authenticated: false, user: null, session: null },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { authenticated: false, user: null, session: null },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const metadata = user.user_metadata || {}

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name:
            metadata.full_name ||
            metadata.name ||
            (user.email ? user.email.split('@')[0] : 'Student'),
          avatarUrl: metadata.avatar_url || metadata.picture || null,
        },
        session: {
          expiresAt: session.expires_at,
          tokenType: session.token_type,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        session: null,
        configured: false,
        error:
          error instanceof Error
            ? error.message
            : 'Session service is not configured.',
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
