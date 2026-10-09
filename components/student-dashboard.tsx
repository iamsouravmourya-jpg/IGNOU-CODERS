'use client'

import {
  BookOpen,
  GraduationCap,
  LogOut,
  MessageCircle,
  Play,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { readClasses, type ClassItem } from '@/lib/classes'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

interface StudentDashboardProps {
  onLogout: () => Promise<void>
  isDark?: boolean
  toggleTheme?: () => void
}

export function StudentDashboard({
  onLogout,
  isDark = false,
}: StudentDashboardProps) {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [storageError, setStorageError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    function loadClasses() {
      try {
        setClasses(readClasses())
        setStorageError('')
      } catch {
        setStorageError('Could not load saved classes from this browser.')
      }
    }

    loadClasses()
    window.addEventListener('storage', loadClasses)
    return () => window.removeEventListener('storage', loadClasses)
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
      <header className="border-b border-[#e1e7ef] bg-white/90 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50]">
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
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-70 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70 sm:text-sm"
            >
              <LogOut className="size-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 rounded-2xl border border-[#dce5f1] bg-gradient-to-r from-white via-[#f0f7ff] to-white p-6 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#131e2d] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#087fce]/10 px-3 py-1 text-xs font-semibold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                <GraduationCap className="size-3.5" />
                Student Learning Hub
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                Classes & Study Notes
              </h1>
              <p className="mt-1 text-sm text-[#5e6f84] dark:text-[#94a3b8]">
                Open a topic to watch its class video and download the notes.
              </p>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#087fce] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0665aa] sm:text-sm"
            >
              <MessageCircle className="size-4" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
            Available Topics ({classes.length})
          </h2>
          <span className="text-xs text-[#647083] dark:text-[#94a3b8]">
            Learning Dashboard
          </span>
        </div>

        {storageError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {storageError}
          </p>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-14 text-center dark:border-[#34445a] dark:bg-[#131e2d]">
            <BookOpen className="mx-auto size-10 text-[#94a3b8]" />
            <h3 className="mt-4 text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              No classes yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#647083] dark:text-[#94a3b8]">
              Class topics, videos and notes saved in this browser will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls, idx) => (
              <Link
                key={cls.id}
                href={`/dashboard/classes/${encodeURIComponent(cls.id)}`}
                className="group relative flex min-h-52 flex-col justify-between rounded-2xl border border-[#e1e7ef] bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#087fce] hover:shadow-xl dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-[#61c5ff]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#087fce]/10 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Video className="size-3" />
                      Video + Notes
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#172333] transition group-hover:text-[#087fce] dark:text-[#edf3fb] dark:group-hover:text-[#61c5ff]">
                    {cls.title}
                  </h3>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f9] pt-4 dark:border-[#2a3b50]">
                  <span className="text-[11px] text-[#647083] dark:text-[#94a3b8]">
                    Added: {cls.dateAdded}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#087fce] dark:text-[#61c5ff]">
                    Watch & Read
                    <Play className="size-3 fill-current" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
