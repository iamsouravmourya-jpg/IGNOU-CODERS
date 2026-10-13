import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from '@/lib/admin-auth'
import {
  CLASS_ASSETS_BUCKET,
  toYouTubeEmbedUrl,
  type ClassDatabaseRow,
} from '@/lib/classes'
import { classesFromDatabase } from '@/lib/classes-server'
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/admin'

function isAdmin(request: NextRequest) {
  return isValidAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  )
}

function getUnavailableResponse() {
  return NextResponse.json(
    { error: 'Class storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
    { status: 503 },
  )
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) return getUnavailableResponse()

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('classes')
      .select('*')
      .order('date_added', { ascending: false })

    if (error) {
      console.error('Failed to load admin classes:', error.message)
      return NextResponse.json({ error: 'Could not load published classes.' }, { status: 500 })
    }

    return NextResponse.json(
      await classesFromDatabase(data as ClassDatabaseRow[]),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Admin class loading request failed:', error)
    return NextResponse.json({ error: 'Could not load published classes.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) return getUnavailableResponse()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid class request.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid class request.' }, { status: 400 })
  }

  const item = body as Record<string, unknown>
  const embedUrl =
    typeof item.youtubeUrl === 'string'
      ? toYouTubeEmbedUrl(item.youtubeUrl)
      : null
  if (
    typeof item.id !== 'string' ||
    item.id.length < 1 ||
    item.id.length > 100 ||
    typeof item.title !== 'string' ||
    !item.title.trim() ||
    typeof item.notes !== 'string' ||
    !embedUrl ||
    typeof item.pdfUrl !== 'string' ||
    typeof item.dateAdded !== 'string'
  ) {
    return NextResponse.json({ error: 'Please provide valid class details.' }, { status: 400 })
  }

  const pdfUrl = item.pdfUrl.trim()
  const imageUrl =
    typeof item.imageUrl === 'string' && item.imageUrl.trim()
      ? item.imageUrl.trim()
      : null
  for (const url of [pdfUrl, imageUrl]) {
    if (!url) continue
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Unsupported URL protocol')
      }
    } catch {
      return NextResponse.json({ error: 'Please provide valid PDF and image URLs.' }, { status: 400 })
    }
  }

  const dateAdded = new Date(item.dateAdded)
  if (Number.isNaN(dateAdded.getTime())) {
    return NextResponse.json({ error: 'Please provide a valid class date.' }, { status: 400 })
  }

  const row = {
    id: item.id,
    title: item.title.trim(),
    youtube_url: embedUrl,
    notes: item.notes,
    pdf_url: typeof item.pdfStoragePath === 'string' ? '' : pdfUrl,
    pdf_file_name:
      typeof item.pdfFileName === 'string' ? item.pdfFileName : null,
    pdf_storage_path:
      typeof item.pdfStoragePath === 'string' ? item.pdfStoragePath : null,
    image_url:
      typeof item.imageStoragePath === 'string' ? null : imageUrl,
    image_storage_path:
      typeof item.imageStoragePath === 'string' ? item.imageStoragePath : null,
    date_added: dateAdded.toISOString().slice(0, 10),
  }

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('classes')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to save class:', error.message)
      return NextResponse.json({ error: 'Could not publish this class.' }, { status: 500 })
    }

    const [savedClass] = await classesFromDatabase([data as ClassDatabaseRow])
    return NextResponse.json(savedClass, { status: 201 })
  } catch (error) {
    console.error('Class save request failed:', error)
    return NextResponse.json({ error: 'Could not publish this class.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) return getUnavailableResponse()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid class update request.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid class update request.' }, { status: 400 })
  }

  const item = body as Record<string, unknown>
  if (typeof item.id !== 'string' || !item.id.trim()) {
    return NextResponse.json({ error: 'A valid class ID is required.' }, { status: 400 })
  }

  const embedUrl =
    typeof item.youtubeUrl === 'string'
      ? toYouTubeEmbedUrl(item.youtubeUrl)
      : null

  if (
    typeof item.title !== 'string' ||
    !item.title.trim() ||
    typeof item.notes !== 'string' ||
    !embedUrl
  ) {
    return NextResponse.json({ error: 'Please provide valid class details.' }, { status: 400 })
  }

  const pdfUrl = typeof item.pdfUrl === 'string' ? item.pdfUrl.trim() : ''
  const imageUrl =
    typeof item.imageUrl === 'string' && item.imageUrl.trim()
      ? item.imageUrl.trim()
      : null

  for (const url of [pdfUrl, imageUrl]) {
    if (!url) continue
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Unsupported URL protocol')
      }
    } catch {
      return NextResponse.json({ error: 'Please provide valid PDF and image URLs.' }, { status: 400 })
    }
  }

  const supabase = createSupabaseAdminClient()

  // Fetch current class to handle orphaned files cleanup if replaced
  const { data: existing, error: findError } = await supabase
    .from('classes')
    .select('pdf_storage_path, image_storage_path')
    .eq('id', item.id)
    .maybeSingle()

  if (findError) {
    console.error('Failed to find class for update:', findError.message)
    return NextResponse.json({ error: 'Could not update this class.' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
  }

  const newPdfStoragePath =
    typeof item.pdfStoragePath === 'string' ? item.pdfStoragePath : null
  const newImageStoragePath =
    typeof item.imageStoragePath === 'string' ? item.imageStoragePath : null

  const row: Record<string, unknown> = {
    title: item.title.trim(),
    youtube_url: embedUrl,
    notes: item.notes,
    pdf_url: newPdfStoragePath ? '' : pdfUrl,
    pdf_file_name:
      typeof item.pdfFileName === 'string' ? item.pdfFileName : null,
    pdf_storage_path: newPdfStoragePath,
    image_url: newImageStoragePath ? null : imageUrl,
    image_storage_path: newImageStoragePath,
  }

  if (typeof item.dateAdded === 'string' && item.dateAdded.trim()) {
    const dateAdded = new Date(item.dateAdded)
    if (!Number.isNaN(dateAdded.getTime())) {
      row.date_added = dateAdded.toISOString().slice(0, 10)
    }
  }

  try {
    const { data, error } = await supabase
      .from('classes')
      .update(row)
      .eq('id', item.id)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to update class:', error.message)
      return NextResponse.json({ error: 'Could not update this class.' }, { status: 500 })
    }

    // Clean up replaced storage assets if needed
    const pathsToRemove: string[] = []
    if (existing.pdf_storage_path && existing.pdf_storage_path !== newPdfStoragePath) {
      pathsToRemove.push(existing.pdf_storage_path)
    }
    if (existing.image_storage_path && existing.image_storage_path !== newImageStoragePath) {
      pathsToRemove.push(existing.image_storage_path)
    }
    if (pathsToRemove.length > 0) {
      await supabase.storage.from(CLASS_ASSETS_BUCKET).remove(pathsToRemove).catch(() => {})
    }

    const [savedClass] = await classesFromDatabase([data as ClassDatabaseRow])
    return NextResponse.json(savedClass)
  } catch (error) {
    console.error('Class update request failed:', error)
    return NextResponse.json({ error: 'Could not update this class.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }
  if (!isSupabaseAdminConfigured()) return getUnavailableResponse()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'A class ID is required.' }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { data: item, error: findError } = await supabase
      .from('classes')
      .select('pdf_storage_path, image_storage_path')
      .eq('id', id)
      .maybeSingle()

    if (findError) {
      console.error('Failed to find class for deletion:', findError.message)
      return NextResponse.json({ error: 'Could not delete this class.' }, { status: 500 })
    }
    if (!item) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete class:', deleteError.message)
      return NextResponse.json({ error: 'Could not delete this class.' }, { status: 500 })
    }

    const paths = [item.pdf_storage_path, item.image_storage_path].filter(
      (path): path is string => Boolean(path),
    )
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(CLASS_ASSETS_BUCKET)
        .remove(paths)
      if (storageError) {
        console.error('Class deleted, but attachment cleanup failed:', storageError.message)
        return NextResponse.json({
          warning: 'Class deleted, but its uploaded attachments could not be removed.',
        })
      }
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Class deletion request failed:', error)
    return NextResponse.json({ error: 'Could not delete this class.' }, { status: 500 })
  }
}
