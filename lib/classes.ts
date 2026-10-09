export interface ClassItem {
  id: string
  title: string
  youtubeUrl: string
  notes: string
  pdfUrl: string
  dateAdded: string
}

export const CLASS_STORAGE_KEY = 'ignou_coders_classes_v2'

function isClassItem(value: unknown): value is ClassItem {
  if (!value || typeof value !== 'object') return false

  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.youtubeUrl === 'string' &&
    typeof item.notes === 'string' &&
    typeof item.pdfUrl === 'string' &&
    typeof item.dateAdded === 'string'
  )
}

export function readClasses(): ClassItem[] {
  const saved = window.localStorage.getItem(CLASS_STORAGE_KEY)
  if (saved === null) return []

  const parsed: unknown = JSON.parse(saved)
  if (!Array.isArray(parsed) || !parsed.every(isClassItem)) {
    throw new Error('Saved class data has an invalid format.')
  }

  return parsed
}

export function saveClasses(classes: ClassItem[]) {
  window.localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(classes))
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
