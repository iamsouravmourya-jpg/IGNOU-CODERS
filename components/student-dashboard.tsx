'use client'

import {
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  MessageCircle,
  Moon,
  Play,
  Sun,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ClassItem } from '@/lib/classes'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

interface StudentDashboardProps {
  onLogout: () => Promise<void>
  isDark?: boolean
  toggleTheme?: () => void
}

export function StudentDashboard({
  onLogout,
  isDark = false,
  toggleTheme,
}: StudentDashboardProps) {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [storageError, setStorageError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadClasses() {
      try {
        const response = await fetch('/api/classes', { signal: controller.signal })
        const result = (await response.json()) as ClassItem[] | { error?: string }
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !Array.isArray(result) ? result.error : 'Could not load classes.',
          )
        }
        setClasses(result)
        setStorageError('')
      } catch (error) {
        if (controller.signal.aborted) return
        setStorageError(
          error instanceof Error
            ? error.message
            : 'Could not load classes from the server.',
        )
      } finally {
        if (!controller.signal.aborted) setIsLoadingClasses(false)
      }
    }

    loadClasses()
    return () => controller.abort()
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    setStorageError('')
    try {
      await onLogout()
    } catch {
      setStorageError('Could not log out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div
      className={`min-h-screen bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e1e7ef] bg-white/95 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50] transition group-hover:scale-105">
              <img src="/logo.jpg" alt="IGNOU Coders logo" className="size-full object-contain" />
            </span>
            <div>
              <span className="block text-sm font-bold tracking-wider text-[#172333] dark:text-[#edf3fb]">
                IGNOU CODERS
              </span>
              <span className="text-xs text-[#647083] dark:text-[#94a3b8]">
                Student Dashboard · pyeater.in
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="inline-flex size-9 items-center justify-center rounded-full border border-[#d8e1ec] bg-white text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] cursor-pointer"
              >
                {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-70 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 cursor-pointer sm:text-sm"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Hero Card */}
        <div className="mb-8 rounded-2xl border border-[#dce5f1] bg-gradient-to-r from-white via-[#f0f7ff] to-white p-6 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#131e2d] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-[#087fce]/10 px-3 py-1 text-xs font-semibold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                <GraduationCap className="size-3.5" />
                <span>Student Learning Hub</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                Classes &amp; Study Notes
              </h1>
              <p className="mt-1.5 text-sm text-[#5e6f84] dark:text-[#94a3b8]">
                Open a topic to watch its class video and download the notes.
              </p>
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#087fce] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0665aa] active:scale-98 sm:text-sm cursor-pointer"
            >
              <MessageCircle className="size-4" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>

        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
            Available Topics ({classes.length})
          </h2>
          <span className="text-xs font-medium text-[#647083] dark:text-[#94a3b8]">
            Learning Dashboard
          </span>
        </div>

        {/* Error state */}
        {storageError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {storageError}
          </p>
        ) : isLoadingClasses ? (
          <p className="rounded-xl border border-[#dce5f1] bg-white p-8 text-center text-sm text-[#647083] dark:border-[#2a3b50] dark:bg-[#131e2d] dark:text-[#94a3b8]">
            Loading classes...
          </p>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center dark:border-[#34445a] dark:bg-[#131e2d]">
            <BookOpen className="mx-auto size-10 text-[#94a3b8]" />
            <h3 className="mt-4 text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              No classes yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#647083] dark:text-[#94a3b8]">
              Class topics, videos, and notes published from the admin panel will appear here.
            </p>
          </div>
        ) : (
          /* Topics Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls, idx) => (
              <Link
                key={cls.id}
                href={`/dashboard/classes/${encodeURIComponent(cls.id)}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#087fce] hover:shadow-xl dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-[#61c5ff]"
              >
                {/* Optional Cover Image */}
                {cls.imageUrl && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-[#e1e7ef] dark:border-[#2a3b50]">
                    <img
                      src={cls.imageUrl}
                      alt={cls.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-8 items-center justify-center rounded-xl bg-[#087fce]/10 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Video className="size-3" />
                        {cls.pdfUrl ? 'Video + Notes' : 'Video Lesson'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3.5 text-base font-bold text-[#172333] transition group-hover:text-[#087fce] dark:text-[#edf3fb] dark:group-hover:text-[#61c5ff] line-clamp-2">
                      {cls.title}
                    </h3>

                    {/* Notes preview */}
                    {cls.notes && (
                      <p className="mt-2 text-xs text-[#647083] dark:text-[#94a3b8] line-clamp-2 leading-relaxed">
                        {cls.notes}
                      </p>
                    )}
                  </div>

                  {/* Card bottom metadata & action */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f9] pt-4 dark:border-[#2a3b50]">
                    <span className="text-[11px] text-[#647083] dark:text-[#94a3b8]">
                      Added: {cls.dateAdded}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#087fce] dark:text-[#61c5ff] group-hover:translate-x-0.5 transition-transform">
                      Watch &amp; Read
                      <Play className="size-3 fill-current" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
