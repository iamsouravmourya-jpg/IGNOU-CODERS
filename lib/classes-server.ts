import 'server-only'

import {
  CLASS_ASSETS_BUCKET,
  classFromDatabase,
  type ClassDatabaseRow,
} from '@/lib/classes'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const SIGNED_ASSET_URL_LIFETIME_SECONDS = 60 * 60 * 24

export async function classesFromDatabase(rows: ClassDatabaseRow[]) {
  const storage = createSupabaseAdminClient().storage.from(CLASS_ASSETS_BUCKET)

  return Promise.all(
    rows.map(async (row) => {
      const item = classFromDatabase(row)
      const [pdfResult, imageResult] = await Promise.all([
        item.pdfStoragePath
          ? storage.createSignedUrl(
              item.pdfStoragePath,
              SIGNED_ASSET_URL_LIFETIME_SECONDS,
            )
          : null,
        item.imageStoragePath
          ? storage.createSignedUrl(
              item.imageStoragePath,
              SIGNED_ASSET_URL_LIFETIME_SECONDS,
            )
          : null,
      ])

      if (pdfResult?.error) {
        throw new Error(`Could not create signed PDF link: ${pdfResult.error.message}`)
      }
      if (imageResult?.error) {
        throw new Error(`Could not create signed image link: ${imageResult.error.message}`)
      }

      return {
        ...item,
        pdfUrl: pdfResult?.data.signedUrl ?? item.pdfUrl,
        imageUrl: imageResult?.data.signedUrl ?? item.imageUrl,
      }
    }),
  )
}
