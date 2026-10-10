import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from '@/lib/admin-auth'
import { CLASS_ASSETS_BUCKET } from '@/lib/classes'
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/admin'

const ALLOWED_CONTENT_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const

function isAdmin(request: NextRequest) {
  return isValidAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  )
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 })
  }

  const { kind, contentType } = body as Record<string, unknown>
  const isSupportedContentType =
    kind === 'pdf'
      ? contentType === 'application/pdf'
      : kind === 'image' &&
        typeof contentType === 'string' &&
        ALLOWED_CONTENT_TYPES.image.includes(
          contentType as (typeof ALLOWED_CONTENT_TYPES.image)[number],
        )
  if (
    (kind !== 'pdf' && kind !== 'image') ||
    typeof contentType !== 'string' ||
    !isSupportedContentType
  ) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 })
  }

  const extension =
    contentType === 'application/pdf'
      ? 'pdf'
      : contentType === 'image/jpeg'
        ? 'jpg'
        : contentType.split('/')[1]
  const path = `${randomUUID()}.${extension}`

  try {
    const { data, error } = await createSupabaseAdminClient()
      .storage.from(CLASS_ASSETS_BUCKET)
      .createSignedUploadUrl(path)

    if (error) {
      console.error('Could not create signed class upload URL:', error.message)
      return NextResponse.json({ error: 'Could not prepare the file upload.' }, { status: 500 })
    }

    return NextResponse.json({ path, token: data.token })
  } catch (error) {
    console.error('Class upload preparation failed:', error)
    return NextResponse.json({ error: 'Could not prepare the file upload.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid cleanup request.' }, { status: 400 })
  }

  const paths =
    body && typeof body === 'object' && 'paths' in body
      ? body.paths
      : undefined
  if (
    !Array.isArray(paths) ||
    !paths.every(
      (path) =>
        typeof path === 'string' &&
        /^[0-9a-f-]{36}\.(pdf|jpg|png|webp|gif)$/.test(path),
    )
  ) {
    return NextResponse.json({ error: 'Invalid file paths.' }, { status: 400 })
  }
  if (paths.length === 0) return NextResponse.json({ removed: true })

  try {
    const { error } = await createSupabaseAdminClient()
      .storage.from(CLASS_ASSETS_BUCKET)
      .remove(paths)

    if (error) {
      console.error('Could not clean up class uploads:', error.message)
      return NextResponse.json({ error: 'Could not clean up uploaded files.' }, { status: 500 })
    }

    return NextResponse.json({ removed: true })
  } catch (error) {
    console.error('Class upload cleanup request failed:', error)
    return NextResponse.json({ error: 'Could not clean up uploaded files.' }, { status: 500 })
  }
}
