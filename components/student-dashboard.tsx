'use client'

import {
  Bell,
  BookOpen,
  Calendar,
  CheckCheck,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  LogOut,
  MessageCircle,
  Moon,
  Play,
  Radio,
  Search,
  Sun,
  Video,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ClassItem } from '@/lib/classes'
import {
  DEFAULT_LIVE_SESSIONS,
  readLiveSessions,
  saveLiveSessionsLocally,
  type LiveSessionItem,
} from '@/lib/live-sessions'
import { useSession } from '@/lib/session-store'

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
  const { profile } = useSession()
  const [activeTab, setActiveTab] = useState<'recorded' | 'live'>('recorded')
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([])
  const [storageError, setStorageError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingLive, setIsLoadingLive] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Notifications
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const notificationRef = useRef<HTMLDivElement>(null)

  const filteredClasses = classes.filter((item) => {
    const query = searchQuery.trim().toLowerCase()
    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.notes.toLowerCase().includes(query)
    )
  })

  // Load recorded classes
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

  // Load live sessions
  useEffect(() => {
    const controller = new AbortController()

    async function loadLiveSessions() {
      try {
        const response = await fetch('/api/live-sessions', {
          signal: controller.signal,
        })
        if (response.ok) {
          const result = (await response.json()) as LiveSessionItem[]
          if (Array.isArray(result) && result.length > 0) {
            setLiveSessions(result)
            saveLiveSessionsLocally(result)
            return
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (!controller.signal.aborted) setIsLoadingLive(false)
      }

      const local = readLiveSessions()
      setLiveSessions(local)
    }

    loadLiveSessions()
    return () => controller.abort()
  }, [])

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationsOpen])

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

  const activeLiveCount = liveSessions.filter((s) => s.isActive).length

  return (
    <div
      className={`min-h-screen bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e1e7ef] bg-white/95 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
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

          <div className="flex items-center gap-2 sm:gap-2.5">
            {profile?.email && (
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] shadow-xs dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[150px] truncate">{profile.name || profile.email}</span>
              </span>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev)
                  if (!notificationsOpen) setHasUnread(false)
                }}
                title="Live Session Notifications"
                className="relative inline-flex size-9 items-center justify-center rounded-full border border-[#d8e1ec] bg-white text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] cursor-pointer"
              >
                <Bell className="size-4" />
                {hasUnread && liveSessions.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#dce5f1] bg-white p-4 shadow-xl dark:border-[#2a3b50] dark:bg-[#131e2d] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#eef2f6] pb-3 dark:border-[#2a3b50]">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                        <Bell className="size-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#172333] dark:text-[#edf3fb]">
                          Live Class Alerts
                        </h4>
                        <p className="text-[10px] text-[#647083] dark:text-[#94a3b8]">
                          Instant live class updates
                        </p>
                      </div>
                    </div>
                    {liveSessions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setHasUnread(false)
                          setNotificationsOpen(false)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087fce] hover:underline dark:text-[#61c5ff] cursor-pointer"
                      >
                        <CheckCheck className="size-3" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                    {liveSessions.length === 0 ? (
                      <p className="py-6 text-center text-xs text-[#647083] dark:text-[#94a3b8]">
                        No new notifications right now.
                      </p>
                    ) : (
                      liveSessions.map((session) => (
                        <div
                          key={session.id}
                          className="group rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 transition hover:border-[#8dc9f5] hover:bg-white dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-[#61c5ff]/50"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="relative mt-0.5 flex size-2 shrink-0">
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#172333] dark:text-[#edf3fb] line-clamp-2">
                                🔴 Live Class: {session.title}
                              </p>
                              {session.scheduledTime && (
                                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  <Clock className="size-3" />
                                  <span>Time: {session.scheduledTime}</span>
                                </p>
                              )}
                              <div className="mt-2.5 flex items-center gap-2">
                                <a
                                  href={session.meetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#087fce] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#0665aa] cursor-pointer"
                                >
                                  <span>Join Google Meet</span>
                                  <ExternalLink className="size-3" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('live')
                                    setNotificationsOpen(false)
                                  }}
                                  className="text-[11px] font-semibold text-[#647083] hover:text-[#087fce] dark:text-[#94a3b8] dark:hover:text-[#61c5ff] cursor-pointer"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-70 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 cursor-pointer sm:text-sm"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Desktop Left Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <div className="sticky top-20 rounded-2xl border border-[#dce5f1] bg-white p-4 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d]">
              <div className="mb-3 px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#647083] dark:text-[#94a3b8]">
                  Learning Portal
                </span>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1.5">
                {/* 1. Recorded Sessions */}
                <button
                  type="button"
                  onClick={() => setActiveTab('recorded')}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition cursor-pointer ${
                    activeTab === 'recorded'
                      ? 'bg-[#087fce] text-white shadow-md shadow-[#087fce]/20'
                      : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#172333] dark:text-[#cbd5e1] dark:hover:bg-[#192638] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Video className="size-4 shrink-0" />
                    <span>Recorded Sessions</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      activeTab === 'recorded'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#087fce]/10 text-[#087fce] dark:bg-[#61c5ff]/20 dark:text-[#61c5ff]'
                    }`}
                  >
                    {classes.length}
                  </span>
                </button>

                {/* 2. Live Sessions */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('live')
                    setHasUnread(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-[#087fce] text-white shadow-md shadow-[#087fce]/20'
                      : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#172333] dark:text-[#cbd5e1] dark:hover:bg-[#192638] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="size-4 shrink-0 text-red-500 animate-pulse" />
                    <span>Live Sessions</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE
                  </span>
                </button>
              </nav>

              {/* Sidebar Community Card */}
              <div className="mt-6 border-t border-[#edf2f7] pt-4 dark:border-[#2a3b50]">
                <div className="rounded-xl border border-[#dce5f1] bg-[#f8fafc] p-3 text-xs dark:border-[#2a3b50] dark:bg-[#192638]/70">
                  <div className="flex items-center gap-2 text-[#087fce] dark:text-[#61c5ff] font-bold">
                    <GraduationCap className="size-4" />
                    <span>BCA / MCA Coders</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#647083] dark:text-[#94a3b8] leading-relaxed">
                    Join live Google Meet sessions or revise using recorded topic videos.
                  </p>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/10 py-1.5 text-[11px] font-bold text-[#128C7E] hover:bg-[#25D366]/20 transition cursor-pointer dark:bg-[#25D366]/20 dark:text-[#25D366]"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>WhatsApp Doubt Group</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tab Navigation */}
            <div className="mb-5 flex rounded-2xl border border-[#dce5f1] bg-white p-1.5 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d] lg:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('recorded')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'recorded'
                    ? 'bg-[#087fce] text-white shadow-xs'
                    : 'text-[#647083] dark:text-[#94a3b8]'
                }`}
              >
                <Video className="size-3.5" />
                <span>Recorded Sessions ({classes.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('live')
                  setHasUnread(false)
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-[#087fce] text-white shadow-xs'
                    : 'text-[#647083] dark:text-[#94a3b8]'
                }`}
              >
                <Radio className="size-3.5 text-red-500 animate-pulse" />
                <span>Live Sessions</span>
                <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
              </button>
            </div>

            {/* TAB 1: RECORDED SESSIONS */}
            {activeTab === 'recorded' && (
              <>
                {/* Hero Card */}
                <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#dce5f1] bg-gradient-to-br from-white via-[#eff7ff] to-[#e4f2ff] p-6 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#172c43] sm:p-7">
                  <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-[#70c6ff]/15 blur-3xl" />
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#087fce]/10 bg-white/80 px-3 py-1 text-xs font-semibold text-[#087fce] shadow-xs dark:border-[#61c5ff]/20 dark:bg-[#0d1b2b]/70 dark:text-[#61c5ff]">
                        <Video className="size-3.5" />
                        <span>Recorded Video Lectures & Notes</span>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                        {profile?.name
                          ? `Welcome back, ${profile.name}! 👋`
                          : 'Recorded Sessions & Notes'}
                      </h1>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                        Select any recorded topic to watch the class video on YouTube and download PDF notes.
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087fce] px-5 py-3 text-xs font-semibold text-white shadow-md shadow-[#087fce]/20 transition hover:-translate-y-0.5 hover:bg-[#0665aa] hover:shadow-lg sm:text-sm cursor-pointer"
                    >
                      <MessageCircle className="size-4" />
                      <span>Join WhatsApp Group</span>
                    </a>
                  </div>
                </div>

                {/* Header row with Search */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
                        Recorded topics
                      </h2>
                      <span className="rounded-full bg-[#087fce]/10 px-2.5 py-1 text-[11px] font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                        {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                      Search by topic title or subject code
                    </p>
                  </div>
                  {!isLoadingClasses && classes.length > 0 && (
                    <label className="relative block w-full sm:max-w-xs">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Find a class..."
                        aria-label="Search classes"
                        className="w-full rounded-xl border border-[#d8e1ec] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#172333] shadow-xs outline-none transition placeholder:text-[#94a3b8] focus:border-[#087fce] focus:ring-4 focus:ring-[#087fce]/10 dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb] dark:focus:border-[#61c5ff] dark:focus:ring-[#61c5ff]/10"
                      />
                    </label>
                  )}
                </div>

                {/* Error / Loading / Content */}
                {storageError ? (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {storageError}
                  </p>
                ) : isLoadingClasses ? (
                  <p className="rounded-xl border border-[#dce5f1] bg-white p-8 text-center text-sm text-[#647083] dark:border-[#2a3b50] dark:bg-[#131e2d] dark:text-[#94a3b8]">
                    Loading recorded sessions...
                  </p>
                ) : classes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center dark:border-[#34445a] dark:bg-[#131e2d]">
                    <BookOpen className="mx-auto size-10 text-[#94a3b8]" />
                    <h3 className="mt-4 text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                      No recorded sessions yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#647083] dark:text-[#94a3b8]">
                      Class topics, videos, and notes published from the admin panel will appear here.
                    </p>
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-12 text-center dark:border-[#34445a] dark:bg-[#131e2d]">
                    <Search className="mx-auto size-8 text-[#94a3b8]" />
                    <h3 className="mt-3 text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                      No matching classes
                    </h3>
                    <p className="mt-1 text-sm text-[#647083] dark:text-[#94a3b8]">
                      Try another title or topic.
                    </p>
                  </div>
                ) : (
                  /* Topics Grid */
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredClasses.map((cls) => (
                      <Link
                        key={cls.id}
                        href={`/dashboard/classes/${encodeURIComponent(cls.id)}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#8dc9f5] hover:shadow-xl dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-[#61c5ff]/60"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[#e1e7ef] bg-[#eaf3fb] dark:border-[#2a3b50] dark:bg-[#101b2a]">
                          {cls.imageUrl ? (
                            <img
                              src={cls.imageUrl}
                              alt=""
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#dff2ff] via-[#edf6ff] to-[#d9e9fa] dark:from-[#1a3149] dark:via-[#17283c] dark:to-[#203953]">
                              <span className="flex size-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-[#087fce] shadow-sm dark:border-white/10 dark:bg-[#0d1b2b]/70 dark:text-[#61c5ff]">
                                <Video className="size-6" />
                              </span>
                            </div>
                          )}
                          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#07111d]/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                            <Video className="size-3" />
                            Video lesson
                          </span>
                          {cls.pdfUrl && (
                            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#475569] shadow-sm dark:bg-[#111c2a]/95 dark:text-[#d8e4f0]">
                              <FileText className="size-3" />
                              Notes
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                          <div>
                            <h3 className="text-base font-bold leading-snug text-[#172333] transition group-hover:text-[#087fce] dark:text-[#edf3fb] dark:group-hover:text-[#61c5ff] line-clamp-2">
                              {cls.title}
                            </h3>

                            {cls.notes && (
                              <p className="mt-2.5 text-xs text-[#647083] dark:text-[#94a3b8] line-clamp-2 leading-relaxed">
                                {cls.notes}
                              </p>
                            )}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-[#f0f4f9] pt-4 dark:border-[#2a3b50]">
                            <span className="text-[11px] text-[#647083] dark:text-[#94a3b8]">
                              Added: {cls.dateAdded}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087fce] dark:text-[#61c5ff] group-hover:translate-x-0.5 transition-transform">
                              Open class
                              <Play className="size-3 fill-current" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: LIVE SESSIONS (GOOGLE MEET) */}
            {activeTab === 'live' && (
              <>
                {/* Live Hero Card */}
                <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#dce5f1] bg-gradient-to-br from-white via-[#fff1f2] to-[#ffe4e6] p-6 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#26161c] dark:to-[#311720] sm:p-7">
                  <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-rose-500/10 blur-3xl" />
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-white/90 px-3 py-1 text-xs font-bold text-red-600 shadow-xs dark:bg-[#1f131a] dark:text-red-400">
                        <span className="size-2 rounded-full bg-red-500 animate-ping" />
                        <span>Google Meet Live Sessions</span>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                        Interactive Live Classes
                      </h1>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                        Join real-time doubt clearing sessions, project reviews, and logic building classes directly via Google Meet.
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-semibold text-white shadow-md shadow-[#25D366]/20 transition hover:bg-[#1ea952] sm:text-sm cursor-pointer"
                    >
                      <MessageCircle className="size-4" />
                      <span>WhatsApp Doubt Group</span>
                    </a>
                  </div>
                </div>

                {/* Live Sessions Heading */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
                      Upcoming & Active Sessions
                    </h2>
                    <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
                      {liveSessions.length} {liveSessions.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                </div>

                {/* Live Sessions Grid */}
                {isLoadingLive ? (
                  <p className="rounded-xl border border-[#dce5f1] bg-white p-8 text-center text-sm text-[#647083] dark:border-[#2a3b50] dark:bg-[#131e2d] dark:text-[#94a3b8]">
                    Loading live sessions...
                  </p>
                ) : liveSessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center dark:border-[#34445a] dark:bg-[#131e2d]">
                    <Radio className="mx-auto size-10 text-[#94a3b8]" />
                    <h3 className="mt-4 text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                      No live sessions scheduled right now
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#647083] dark:text-[#94a3b8]">
                      When the instructor adds a new Google Meet session, it will show up right here and send you a notification bell alert!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {liveSessions.map((session) => (
                      <div
                        key={session.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-red-500/40"
                      >
                        {/* Session Photo / Visual */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[#e1e7ef] bg-[#eaf3fb] dark:border-[#2a3b50] dark:bg-[#101b2a]">
                          {session.imageUrl ? (
                            <img
                              src={session.imageUrl}
                              alt={session.title}
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 dark:from-[#2a131b] dark:via-[#1e1c2a] dark:to-[#122233]">
                              <span className="flex size-14 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-red-500 shadow-sm dark:border-white/10 dark:bg-[#191524] dark:text-red-400">
                                <Radio className="size-7 animate-pulse" />
                              </span>
                            </div>
                          )}

                          {/* Live Badge */}
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm shadow-sm">
                            <span className="size-2 rounded-full bg-white animate-ping" />
                            <span>LIVE SESSION</span>
                          </span>

                          {/* Google Meet Pill */}
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#1f2937] shadow-sm dark:bg-[#111c2a]/95 dark:text-[#edf3fb]">
                            <Video className="size-3 text-emerald-600" />
                            <span>Google Meet</span>
                          </span>
                        </div>

                        {/* Session Details */}
                        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                          <div>
                            <h3 className="text-base font-bold leading-snug text-[#172333] transition group-hover:text-[#087fce] dark:text-[#edf3fb] dark:group-hover:text-[#61c5ff]">
                              {session.title}
                            </h3>

                            {session.scheduledTime && (
                              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#475569] dark:bg-[#131e2d] dark:text-[#94a3b8]">
                                <Clock className="size-3.5 text-[#087fce] dark:text-[#61c5ff]" />
                                <span>{session.scheduledTime}</span>
                              </div>
                            )}

                            <p className="mt-3 text-xs leading-relaxed text-[#647083] dark:text-[#94a3b8]">
                              Camera & mic discussion session. Join directly with your Google account.
                            </p>
                          </div>

                          <div className="mt-5 border-t border-[#f0f4f9] pt-4 dark:border-[#2a3b50]">
                            <a
                              href={session.meetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md shadow-red-500/20 transition hover:from-red-500 hover:to-rose-500 cursor-pointer sm:text-sm"
                            >
                              <span>Join Google Meet</span>
                              <ExternalLink className="size-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
