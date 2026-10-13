import {
  type ProjectDatabaseRow,
  type ProjectSubmission,
  projectFromDatabase,
} from './projects'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function cleanupExpiredProjects(supabase: SupabaseClient) {
  try {
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('project_submissions')
      .delete()
      .lt('expires_at', nowIso)

    if (error && error.code !== '42P01') {
      console.warn('Auto cleanup of expired projects notice:', error.message)
    }
  } catch (err) {
    console.warn('Error during project auto cleanup:', err)
  }
}

export function projectsFromDatabase(
  rows: ProjectDatabaseRow[] | null | undefined,
): ProjectSubmission[] {
  if (!rows || !Array.isArray(rows)) return []
  const now = Date.now()

  return rows
    .map(projectFromDatabase)
    .filter((p) => {
      // Exclude any that have expired past 2 days
      try {
        return new Date(p.expiresAt).getTime() > now
      } catch {
        return true
      }
    })
}
