export interface ClassItem {
  id: string
  title: string
  youtubeUrl: string
  notes: string
  pdfUrl: string
  dateAdded: string
  imageUrl?: string
  pdfFileName?: string
  imageStoragePath?: string
  pdfStoragePath?: string
}

export const CLASS_STORAGE_KEY = 'ignou_coders_classes_v2'
export const CLASS_ASSETS_BUCKET = 'class-assets'

export interface ClassDatabaseRow {
  id: string
  title: string
  youtube_url: string
  notes: string
  pdf_url: string
  pdf_file_name: string | null
  pdf_storage_path: string | null
  image_url: string | null
  image_storage_path: string | null
  date_added: string
}

function isClassItem(value: unknown): value is ClassItem {
  if (!value || typeof value !== 'object') return false

  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.youtubeUrl === 'string' &&
    typeof item.notes === 'string' &&
    typeof item.pdfUrl === 'string' &&
    typeof item.dateAdded === 'string' &&
    (item.imageUrl === undefined || typeof item.imageUrl === 'string') &&
    (item.pdfFileName === undefined || typeof item.pdfFileName === 'string') &&
    (item.imageStoragePath === undefined ||
      typeof item.imageStoragePath === 'string') &&
    (item.pdfStoragePath === undefined ||
      typeof item.pdfStoragePath === 'string')
  )
}

export function readClasses(): ClassItem[] {
  const saved = window.localStorage.getItem(CLASS_STORAGE_KEY)
  if (saved === null) return []

  try {
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every(isClassItem)) {
      return []
    }
    return parsed
  } catch {
    return []
  }
}

export function classFromDatabase(row: ClassDatabaseRow): ClassItem {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    notes: row.notes,
    pdfUrl: row.pdf_url,
    pdfFileName: row.pdf_file_name ?? undefined,
    pdfStoragePath: row.pdf_storage_path ?? undefined,
    imageUrl: row.image_url ?? undefined,
    imageStoragePath: row.image_storage_path ?? undefined,
    dateAdded: row.date_added,
  }
}

export function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input.trim())
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    let videoId: string | null = null

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      const parts = url.pathname.split('/').filter(Boolean)
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v')
      } else if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) {
        videoId = parts[1] ?? null
      }
    }

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null
  } catch {
    return null
  }
}

/**
 * Extracts class sequence number from titles like:
 * "Class 1: HTML Basics", "Day 2 - Tags", "03 Introduction", "Lecture 1", etc.
 */
export function extractClassSequenceNumber(title: string): number | null {
  if (!title) return null

  // 1. Explicit keyword followed by number: "Class 1", "Session #2", "Day 3", "Lec 4", etc.
  const keywordMatch = title.match(
    /\b(?:class|day|session|part|lecture|chapter|ep|episode|lec|module|unit)\s*(?:#|no\.?|num\.?)?\s*(\d+)/i,
  )
  if (keywordMatch && keywordMatch[1]) {
    return parseInt(keywordMatch[1], 10)
  }

  // 2. Leading number: "1. ", "01 - ", "1: ", "#1 "
  const leadingMatch = title.match(/^\s*(?:#)?\s*(\d+)\s*[-.:)]/i)
  if (leadingMatch && leadingMatch[1]) {
    return parseInt(leadingMatch[1], 10)
  }

  // 3. Standalone number anywhere in title: "HTML 1", "HTML - 2"
  const standaloneMatch = title.match(/\b(\d+)\b/)
  if (standaloneMatch && standaloneMatch[1]) {
    return parseInt(standaloneMatch[1], 10)
  }

  return null
}

/**
 * Sorts classes sequentially (1 -> 2 -> 3...) with natural fallback
 */
export function sortClassesSequentially(
  items: ClassItem[],
  direction: 'asc' | 'desc' = 'asc',
): ClassItem[] {
  return [...items].sort((a, b) => {
    const numA = extractClassSequenceNumber(a.title)
    const numB = extractClassSequenceNumber(b.title)

    if (numA !== null && numB !== null && numA !== numB) {
      return direction === 'asc' ? numA - numB : numB - numA
    }

    if (numA !== null && numB === null) return direction === 'asc' ? -1 : 1
    if (numA === null && numB !== null) return direction === 'asc' ? 1 : -1

    // Natural alphanumeric fallback ("Class 1" < "Class 2" < "Class 3")
    const cmp = a.title.localeCompare(b.title, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
    return direction === 'asc' ? cmp : -cmp
  })
}
