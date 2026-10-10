'use client'

import { ArrowLeft, Download, FileText, Video } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ClassItem } from '@/lib/classes'

export default function ClassDetailsPage() {
  const params = useParams<{ id: string }>()
  const [classItem, setClassItem] = useState<ClassItem | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadClass() {
      try {
        const response = await fetch('/api/classes', { signal: controller.signal })
        const result = (await response.json()) as ClassItem[] | { error?: string }
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !Array.isArray(result) ? result.error : 'Could not load classes.',
          )
        }
        setClassItem(result.find((item) => item.id === params.id) ?? null)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load this class from the server.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoaded(true)
      }
    }

    loadClass()
    return () => controller.abort()
  }, [params.id])

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#172333] dark:bg-[#0d1421] dark:text-[#edf3fb] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#087fce] hover:underline dark:text-[#61c5ff]"
        >
          <ArrowLeft className="size-4" />
          All classes
        </Link>

        {!isLoaded ? (
          <p className="py-20 text-center text-sm text-[#647083]">Loading class...</p>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : !classItem ? (
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-8 text-center dark:border-[#2a3b50] dark:bg-[#131e2d]">
            <h1 className="text-xl font-bold">Class not found</h1>
            <p className="mt-2 text-sm text-[#647083] dark:text-[#94a3b8]">
              This class could not be found on the server.
            </p>
          </div>
        ) : (
          <article className="rounded-3xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-8">
            <div className="mb-6">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#087fce]/10 px-3 py-1 text-xs font-semibold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                <Video className="size-3.5" />
                Class video
              </span>
              <h1 className="text-xl font-bold sm:text-2xl">{classItem.title}</h1>
              <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                Added: {classItem.dateAdded}
              </p>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <iframe
                src={classItem.youtubeUrl}
                title={classItem.title}
                className="size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <section className="mt-8">
              <div className="flex flex-col gap-4 border-b border-[#e1e7ef] pb-4 dark:border-[#2a3b50] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">Class study notes</h2>
                    <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                      {classItem.pdfUrl
                        ? classItem.pdfFileName
                          ? `PDF: ${classItem.pdfFileName}`
                          : 'Downloadable PDF Notes'
                        : 'No PDF attached for this topic'}
                    </p>
                  </div>
                </div>

                {classItem.pdfUrl && (
                  <a
                    href={classItem.pdfUrl}
                    download={classItem.pdfFileName || `${classItem.title.replace(/\s+/g, '_')}_Notes.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087fce] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0665aa] active:scale-95"
                  >
                    <Download className="size-4" />
                    Download PDF Notes
                  </a>
                )}
              </div>

              {classItem.notes && (
                <div className="mt-5 rounded-2xl border border-[#e1e7ef] bg-[#f8fafc] p-5 text-sm leading-relaxed text-[#475569] dark:border-[#2a3b50] dark:bg-[#192638] dark:text-[#cbd5e1]">
                  <p className="whitespace-pre-line">{classItem.notes}</p>
                </div>
              )}
            </section>
          </article>
        )}
      </div>
    </main>
  )
}
