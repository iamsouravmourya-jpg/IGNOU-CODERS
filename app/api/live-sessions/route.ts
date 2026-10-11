import { NextResponse } from 'next/server'
import {
  DEFAULT_LIVE_SESSIONS,
  type LiveSessionDatabaseRow,
} from '@/lib/live-sessions'
import { liveSessionsFromDatabase } from '@/lib/live-sessions-server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to view live sessions.' },
        { status: 401 },
      )
    }

    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table does not exist yet (pending migration), return fallback
      console.warn('Could not query live_sessions table:', error.message)
      return NextResponse.json(DEFAULT_LIVE_SESSIONS, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    const processed = await liveSessionsFromDatabase(
      data as LiveSessionDatabaseRow[],
    )
    return NextResponse.json(processed, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.warn('Live sessions endpoint fallback:', error)
    return NextResponse.json(DEFAULT_LIVE_SESSIONS, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }
}
