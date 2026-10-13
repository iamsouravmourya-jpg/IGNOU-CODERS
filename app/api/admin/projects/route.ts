import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import { type ProjectDatabaseRow } from '@/lib/projects'
import {
  cleanupExpiredProjects,
  projectsFromDatabase,
} from '@/lib/projects-server'
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
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }

  try {
    const supabase = createSupabaseAdminClient()
    // Auto cleanup expired projects
    await cleanupExpiredProjects(supabase)

    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('project_submissions')
      .select('*')
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Admin project_submissions error:', error.message)
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    const processed = projectsFromDatabase(data as ProjectDatabaseRow[])
    return NextResponse.json(processed, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('Admin projects load error:', error)
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Missing project submission ID.' },
      { status: 400 },
    )
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ success: true, id })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from('project_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Admin delete project error:', error.message)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Admin delete project error:', error)
    return NextResponse.json({ success: true, id })
  }
}
