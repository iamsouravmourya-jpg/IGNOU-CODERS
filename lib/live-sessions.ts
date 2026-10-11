export interface LiveSessionItem {
  id: string
  title: string
  meetUrl: string
  scheduledTime: string
  imageUrl?: string
  imageStoragePath?: string
  isActive: boolean
  createdAt: string
}

export const LIVE_SESSIONS_STORAGE_KEY = 'ignou_coders_live_sessions_v1'
export const CLASS_ASSETS_BUCKET = 'class-assets'

export interface LiveSessionDatabaseRow {
  id: string
  title: string
  meet_url: string
  scheduled_time: string
  image_url: string | null
  image_storage_path: string | null
  is_active: boolean
  created_at: string
}

export const DEFAULT_LIVE_SESSIONS: LiveSessionItem[] = [
  {
    id: 'live-1',
    title: 'MCS-011: Live Logic Building & Doubt Clearing Session',
    meetUrl: 'https://meet.google.com/new',
    scheduledTime: 'Saturday · 7:30 PM IST',
    imageUrl: '/images/hero_coding_setup_1791589155768.jpg',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export function liveSessionFromDatabase(row: LiveSessionDatabaseRow): LiveSessionItem {
  return {
    id: row.id,
    title: row.title,
    meetUrl: row.meet_url,
    scheduledTime: row.scheduled_time,
    imageUrl: row.image_url ?? undefined,
    imageStoragePath: row.image_storage_path ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function readLiveSessions(): LiveSessionItem[] {
  if (typeof window === 'undefined') return DEFAULT_LIVE_SESSIONS

  const saved = window.localStorage.getItem(LIVE_SESSIONS_STORAGE_KEY)
  if (!saved) return DEFAULT_LIVE_SESSIONS

  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return DEFAULT_LIVE_SESSIONS
  } catch {
    return DEFAULT_LIVE_SESSIONS
  }
}

export function saveLiveSessionsLocally(items: LiveSessionItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LIVE_SESSIONS_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}
