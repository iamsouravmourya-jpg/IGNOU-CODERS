import { NextRequest, NextResponse } from 'next/server'
import {
  type ProjectDatabaseRow,
  type ProjectSubmission,
  convertCodeToHtml,
  PROJECT_EXPIRY_HOURS,
} from '@/lib/projects'
import {
  cleanupExpiredProjects,
  projectsFromDatabase,
} from '@/lib/projects-server'
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')?.trim()
    const studentEmail = searchParams.get('email')?.trim()

    // PRIVACY: If no student identifier is provided, do NOT leak other students' submissions!
    if (!userId && !studentEmail) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    let supabase
    if (isSupabaseAdminConfigured()) {
      supabase = createSupabaseAdminClient()
    } else {
      supabase = await createSupabaseServerClient()
    }

    // Auto cleanup expired projects
    await cleanupExpiredProjects(supabase)

    const nowIso = new Date().toISOString()
    let query = supabase
      .from('project_submissions')
      .select('*')
      .gt('expires_at', nowIso)

    if (userId && studentEmail) {
      query = query.or(`user_id.eq."${userId}",user_id.eq."${studentEmail}"`)
    } else if (userId) {
      query = query.eq('user_id', userId)
    } else if (studentEmail) {
      query = query.eq('user_id', studentEmail)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.warn('Could not query project_submissions:', error.message)
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    const processed = projectsFromDatabase(data as ProjectDatabaseRow[])
    return NextResponse.json(processed, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.warn('Projects GET error:', error)
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid submission data.' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Invalid submission data.' },
      { status: 400 },
    )
  }

  const payload = body as Record<string, unknown>
  const studentName = typeof payload.studentName === 'string' ? payload.studentName.trim() : ''
  if (!studentName) {
    return NextResponse.json(
      { error: 'Please enter your name.' },
      { status: 400 },
    )
  }

  const userId =
    typeof payload.userId === 'string' && payload.userId.trim()
      ? payload.userId.trim()
      : undefined

  const submissionType = payload.submissionType === 'code' ? 'code' : 'file'
  let fileName = typeof payload.fileName === 'string' ? payload.fileName.trim() : 'project.html'
  let fileContent = typeof payload.fileContent === 'string' ? payload.fileContent : ''
  const rawCode = typeof payload.rawCode === 'string' ? payload.rawCode : ''

  // If user submitted code or chose code mode, auto-detect & convert to HTML file
  if (submissionType === 'code' || rawCode.trim()) {
    const converted = convertCodeToHtml(rawCode || fileContent, studentName)
    fileName = converted.fileName
    fileContent = converted.htmlContent
  }

  if (!fileContent.trim()) {
    return NextResponse.json(
      { error: 'Please provide either a file or your project code.' },
      { status: 400 },
    )
  }

  const title =
    typeof payload.title === 'string' && payload.title.trim()
      ? payload.title.trim()
      : 'HTML Practical Project'

  const id =
    typeof payload.id === 'string' && payload.id.trim()
      ? payload.id.trim()
      : `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  const now = new Date()
  const createdAt = now.toISOString()
  // 48 hours (2 days) expiry
  const expiresAt = new Date(now.getTime() + PROJECT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

  const submission: ProjectSubmission = {
    id,
    studentName,
    title,
    submissionType,
    fileName,
    fileContent,
    fileUrl: typeof payload.fileUrl === 'string' ? payload.fileUrl : undefined,
    fileStoragePath: typeof payload.fileStoragePath === 'string' ? payload.fileStoragePath : undefined,
    userId,
    createdAt,
    expiresAt,
  }

  try {
    let supabase
    if (isSupabaseAdminConfigured()) {
      supabase = createSupabaseAdminClient()
    } else {
      supabase = await createSupabaseServerClient()
    }

    const { error } = await supabase.from('project_submissions').upsert({
      id: submission.id,
      student_name: submission.studentName,
      title: submission.title,
      submission_type: submission.submissionType,
      file_name: submission.fileName,
      file_content: submission.fileContent ?? null,
      file_url: submission.fileUrl ?? null,
      file_storage_path: submission.fileStoragePath ?? null,
      user_id: submission.userId ?? null,
      created_at: submission.createdAt,
      expires_at: submission.expiresAt,
    })

    if (error) {
      console.warn('Supabase insert notice (project will be saved locally):', error.message)
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.warn('Project submission fallback:', error)
    return NextResponse.json(submission)
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid submission data.' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Invalid submission data.' },
      { status: 400 },
    )
  }

  const payload = body as Record<string, unknown>
  const id = typeof payload.id === 'string' ? payload.id.trim() : ''
  if (!id) {
    return NextResponse.json(
      { error: 'Missing project submission ID.' },
      { status: 400 },
    )
  }

  const studentName = typeof payload.studentName === 'string' ? payload.studentName.trim() : ''
  const title = typeof payload.title === 'string' ? payload.title.trim() : 'HTML Practical Project'
  let fileName = typeof payload.fileName === 'string' ? payload.fileName.trim() : 'project.html'
  let fileContent = typeof payload.fileContent === 'string' ? payload.fileContent : ''
  const rawCode = typeof payload.rawCode === 'string' ? payload.rawCode : ''

  if (rawCode.trim()) {
    const converted = convertCodeToHtml(rawCode, studentName)
    fileName = converted.fileName
    fileContent = converted.htmlContent
  }

  try {
    let supabase
    if (isSupabaseAdminConfigured()) {
      supabase = createSupabaseAdminClient()
    } else {
      supabase = await createSupabaseServerClient()
    }

    const updates: Record<string, unknown> = {}
    if (studentName) updates.student_name = studentName
    if (title) updates.title = title
    if (fileName) updates.file_name = fileName
    if (fileContent) updates.file_content = fileContent

    const { error } = await supabase
      .from('project_submissions')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.warn('Supabase update notice:', error.message)
    }

    return NextResponse.json({ success: true, id, ...updates })
  } catch (error) {
    console.warn('Project update fallback:', error)
    return NextResponse.json({ success: true, id })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Missing project submission ID.' },
      { status: 400 },
    )
  }

  try {
    let supabase
    if (isSupabaseAdminConfigured()) {
      supabase = createSupabaseAdminClient()
    } else {
      supabase = await createSupabaseServerClient()
    }

    const { error } = await supabase
      .from('project_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Supabase delete notice:', error.message)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.warn('Project delete fallback:', error)
    return NextResponse.json({ success: true, id })
  }
}
