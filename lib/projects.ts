export interface ProjectSubmission {
  id: string
  studentName: string
  title: string
  submissionType: 'file' | 'code'
  fileName: string
  fileContent?: string
  fileUrl?: string
  fileStoragePath?: string
  userId?: string
  createdAt: string
  expiresAt: string
}

export const PROJECT_STORAGE_KEY = 'ignou_coders_projects_v1'
export const PROJECT_EXPIRY_HOURS = 48 // 2 days

export interface ProjectDatabaseRow {
  id: string
  student_name: string
  title: string
  submission_type: string
  file_name: string
  file_content: string | null
  file_url: string | null
  file_storage_path: string | null
  user_id: string | null
  created_at: string
  expires_at: string
}

export function isProjectExpired(expiresAt: string): boolean {
  try {
    const expiryTime = new Date(expiresAt).getTime()
    return Date.now() >= expiryTime
  } catch {
    return false
  }
}

export function formatTimeRemaining(expiresAt: string): {
  isExpired: boolean
  formatted: string
  hoursRemaining: number
} {
  try {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) {
      return { isExpired: true, formatted: 'Expired', hoursRemaining: 0 }
    }

    const totalMinutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      const remHours = hours % 24
      return {
        isExpired: false,
        formatted: `${days}d ${remHours}h left`,
        hoursRemaining: hours,
      }
    }

    if (hours > 0) {
      return {
        isExpired: false,
        formatted: `${hours}h ${minutes}m left`,
        hoursRemaining: hours,
      }
    }

    return {
      isExpired: false,
      formatted: `${minutes}m left`,
      hoursRemaining: 0,
    }
  } catch {
    return { isExpired: false, formatted: '2 days left', hoursRemaining: 48 }
  }
}

export function projectFromDatabase(row: ProjectDatabaseRow): ProjectSubmission {
  return {
    id: row.id,
    studentName: row.student_name,
    title: row.title || 'HTML Practical Assignment',
    submissionType: (row.submission_type as 'file' | 'code') || 'file',
    fileName: row.file_name,
    fileContent: row.file_content ?? undefined,
    fileUrl: row.file_url ?? undefined,
    fileStoragePath: row.file_storage_path ?? undefined,
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

const CLIENT_STUDENT_ID_KEY = 'ignou_coders_student_device_id'

export function getOrCreateClientStudentId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(CLIENT_STUDENT_ID_KEY)
    if (!id) {
      id = `std_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      window.localStorage.setItem(CLIENT_STUDENT_ID_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export function readProjectsLocally(userId?: string): ProjectSubmission[] {
  if (typeof window === 'undefined') return []

  const saved = window.localStorage.getItem(PROJECT_STORAGE_KEY)
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      // Filter out expired items (older than 2 days)
      const now = Date.now()
      const valid = parsed.filter((item: ProjectSubmission) => {
        if (!item || !item.expiresAt) return false
        if (new Date(item.expiresAt).getTime() <= now) return false
        // If a userId is given, only show this student's own submissions!
        if (userId && item.userId && item.userId !== userId) return false
        return true
      })
      return valid
    }
    return []
  } catch {
    return []
  }
}

export function saveProjectsLocally(items: ProjectSubmission[], userId?: string) {
  if (typeof window === 'undefined') return
  try {
    const existingRaw = window.localStorage.getItem(PROJECT_STORAGE_KEY)
    let all: ProjectSubmission[] = []
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw)
        if (Array.isArray(parsed)) all = parsed
      } catch {
        all = []
      }
    }

    if (userId) {
      // Keep other users' items intact, but update current user's items
      const others = all.filter((p) => p.userId && p.userId !== userId)
      const merged = [...items, ...others]
      window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(merged))
    } else {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(items))
    }
  } catch {
    // ignore
  }
}

/**
 * Automatically converts raw code lines into a structured HTML document if needed
 */
export function convertCodeToHtml(
  rawCode: string,
  studentName: string,
): { fileName: string; htmlContent: string } {
  const trimmed = rawCode.trim()
  const safeName = (studentName || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 20)

  const isFullHtml =
    trimmed.toLowerCase().includes('<!doctype html') ||
    trimmed.toLowerCase().includes('<html')

  let htmlContent = trimmed
  if (!isFullHtml) {
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${studentName ? `${studentName}'s HTML Project` : 'Student Project'}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      margin: 20px;
      color: #1e293b;
    }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`
  }

  return {
    fileName: `${safeName}_project.html`,
    htmlContent,
  }
}
