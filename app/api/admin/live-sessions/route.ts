import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import {
  CLASS_ASSETS_BUCKET,
  type LiveSessionDatabaseRow,
} from '@/lib/live-sessions'
import { liveSessionsFromDatabase } from '@/lib/live-sessions-server'
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/admin'

function isAdmin(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('live_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load admin live sessions:', error.message)
      return NextResponse.json(
        { error: 'Could not load live sessions.' },
        { status: 500 },
      )
    }

    const processed = await liveSessionsFromDatabase(
      data as LiveSessionDatabaseRow[],
    )
    return NextResponse.json(processed, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('Admin live sessions error:', error)
    return NextResponse.json(
      { error: 'Could not load live sessions.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid live session request.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid live session request.' }, { status: 400 })
  }

  const item = body as Record<string, unknown>
  if (
    typeof item.id !== 'string' ||
    typeof item.title !== 'string' ||
    !item.title.trim() ||
    typeof item.meetUrl !== 'string' ||
    !item.meetUrl.trim()
  ) {
    return NextResponse.json(
      { error: 'Please provide valid session title and Google Meet URL.' },
      { status: 400 },
    )
  }

  const row = {
    id: item.id,
    title: item.title.trim(),
    meet_url: item.meetUrl.trim(),
    scheduled_time:
      typeof item.scheduledTime === 'string' ? item.scheduledTime.trim() : '',
    image_url:
      typeof item.imageStoragePath === 'string'
        ? null
        : typeof item.imageUrl === 'string'
          ? item.imageUrl.trim()
          : null,
    image_storage_path:
      typeof item.imageStoragePath === 'string' ? item.imageStoragePath : null,
    is_active: item.isActive !== false,
  }

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('live_sessions')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to save live session:', error.message)
      return NextResponse.json(
        { error: 'Could not publish live session.' },
        { status: 500 },
      )
    }

    const [saved] = await liveSessionsFromDatabase([
      data as LiveSessionDatabaseRow,
    ])
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    console.error('Live session save error:', error)
    return NextResponse.json(
      { error: 'Could not publish live session.' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'A live session ID is required.' }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { data: item, error: findError } = await supabase
      .from('live_sessions')
      .select('image_storage_path')
      .eq('id', id)
      .maybeSingle()

    if (findError) {
      console.error('Failed to find live session for deletion:', findError.message)
      return NextResponse.json(
        { error: 'Could not delete live session.' },
        { status: 500 },
      )
    }

    const { error: deleteError } = await supabase
      .from('live_sessions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete live session:', deleteError.message)
      return NextResponse.json(
        { error: 'Could not delete live session.' },
        { status: 500 },
      )
    }

    if (item?.image_storage_path) {
      await supabase.storage
        .from(CLASS_ASSETS_BUCKET)
        .remove([item.image_storage_path])
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Live session deletion error:', error)
    return NextResponse.json(
      { error: 'Could not delete live session.' },
      { status: 500 },
    )
  }
}
