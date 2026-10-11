import 'server-only'

import {
  CLASS_ASSETS_BUCKET,
  liveSessionFromDatabase,
  type LiveSessionDatabaseRow,
} from '@/lib/live-sessions'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const SIGNED_ASSET_URL_LIFETIME_SECONDS = 60 * 60 * 24

export async function liveSessionsFromDatabase(rows: LiveSessionDatabaseRow[]) {
  const storage = createSupabaseAdminClient().storage.from(CLASS_ASSETS_BUCKET)

  return Promise.all(
    rows.map(async (row) => {
      const item = liveSessionFromDatabase(row)
      const imageResult = item.imageStoragePath
        ? await storage.createSignedUrl(
            item.imageStoragePath,
            SIGNED_ASSET_URL_LIFETIME_SECONDS,
          )
        : null

      return {
        ...item,
        imageUrl: imageResult?.data?.signedUrl ?? item.imageUrl,
      }
    }),
  )
}
