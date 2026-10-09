'use client'

import {
  ArrowLeft,
  BookOpen,
  FileText,
  GraduationCap,
  Plus,
  Trash2,
  Video,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  readClasses,
  saveClasses,
  toYouTubeEmbedUrl,
  type ClassItem,
} from '@/lib/classes'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [storageError, setStorageError] = useState('')

  // Form states for adding new class
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setIsDark(window.localStorage.getItem('ignou-coders-theme') === 'dark')
    fetch('/api/admin/session')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not verify admin session.')
        return (await response.json()) as {
          configured: boolean
          authenticated: boolean
        }
      })
      .then(({ configured, authenticated }) => {
        setIsAuthenticated(authenticated)
        if (!configured) {
          setErrorMsg(
            'Admin login is not configured. Set ADMIN_PASSCODE and ADMIN_SESSION_SECRET in Vercel.',
          )
        }
      })
      .catch(() => setErrorMsg('Could not verify admin session. Please reload the page.'))
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    try {
      setClasses(readClasses())
      setStorageError('')
    } catch {
      setStorageError('Could not read saved classes from this browser.')
    }
  }, [isAuthenticated])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setErrorMsg(result.error ?? 'Admin login failed.')
        return
      }
      setIsAuthenticated(true)
      setPasscode('')
    } catch {
      setErrorMsg('Could not reach the admin login service. Please try again.')
    }
  }

  function handleAddClass(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setStorageError('Enter a topic or class title.')
      return
    }

    const embed = toYouTubeEmbedUrl(youtubeUrl)
    if (!embed) {
      setStorageError('Enter a valid YouTube video, Shorts, or embed link.')
      return
    }
    try {
      const parsedPdfUrl = new URL(pdfUrl)
      if (parsedPdfUrl.protocol !== 'https:') {
        setStorageError('Use a secure https:// link for the PDF notes.')
        return
      }
    } catch {
      setStorageError('Enter a valid PDF notes URL.')
      return
    }

    const newItem: ClassItem = {
      id: Date.now().toString(),
      title: title.trim(),
      youtubeUrl: embed,
      notes: notes.trim(),
      pdfUrl: pdfUrl.trim(),
      dateAdded: new Date().toISOString().split('T')[0],
    }

    const updated = [newItem, ...classes]
    try {
      saveClasses(updated)
      setClasses(updated)
      setStorageError('')
    } catch {
      setStorageError('Could not save this class in this browser.')
      return
    }

    // Reset form
    setTitle('')
    setYoutubeUrl('')
    setNotes('')
    setPdfUrl('')
    setSuccessMessage('Class saved in this browser. It will appear on its dashboard.')
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this class/notes?')) {
      const updated = classes.filter((c) => c.id !== id)
      try {
        saveClasses(updated)
        setClasses(updated)
        setStorageError('')
      } catch {
        setStorageError('Could not update saved classes in this browser.')
      }
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Admin logout failed.')
      setIsAuthenticated(false)
    } catch {
      setErrorMsg('Could not log out. Please try again.')
    }
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-sm text-[#647083]">
        Checking admin access...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center bg-[#f6f8fb] p-4 text-[#172333] ${
          isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
        }`}
      >
        <div className="w-full max-w-md rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-xl dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
              <Lock className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#172333] dark:text-[#edf3fb]">
                Secret Admin Gateway
              </h1>
              <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                Authorized personnel only · pyeater.in
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                Admin Secret Passcode
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#647083] dark:text-[#94a3b8]">
                  <KeyRound className="size-4" />
                </span>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter the admin passcode"
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] py-2.5 pl-9 pr-3 text-sm font-medium text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087fce] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0665aa] cursor-pointer"
            >
              <Unlock className="size-4" />
              <span>Access Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 border-t border-[#f0f4f9] pt-4 text-center dark:border-[#2a3b50]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647083] hover:text-[#087fce] dark:text-[#94a3b8] dark:hover:text-[#61c5ff]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Admin Navbar */}
      <header className="border-b border-[#e1e7ef] bg-white/90 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-[#087fce] text-white">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-[#172333] dark:text-[#edf3fb]">
                IGNOU CODERS ADMIN
              </h1>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ● Live on pyeater.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]"
            >
              <ExternalLink className="size-3.5" />
              <span>View Student Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
            >
              Logout Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
            Admin Management Panel ⚡
          </h1>
          <p className="mt-1 text-sm text-[#647083] dark:text-[#94a3b8]">
            Add YouTube classes and PDF notes. Content is stored in this browser for demo use.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {storageError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {storageError}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Class Form */}
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] lg:col-span-1">
            <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              Add New Class & Notes
            </h2>
            <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
              Publish video and downloadable PDF
            </p>

            <form onSubmit={handleAddClass} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Topic / Class Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MCS-014: System Analysis & Design"
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  YouTube Video Link / Embed URL *
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Notes Description (Markdown / Text)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Write summary notes for students..."
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  PDF Notes Download Link *
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/notes.pdf"
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087fce] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0665aa] cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Publish Class & Notes</span>
              </button>
            </form>
          </div>

          {/* Manage Existing Classes List */}
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] lg:col-span-2">
            <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              Published Classes & Notes ({classes.length})
            </h2>
            <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
              These classes are saved only in this browser
            </p>

            <div className="mt-5 space-y-3">
              {classes.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#647083] dark:text-[#94a3b8]">
                  No classes published yet. Use the form on the left to add one!
                </p>
              ) : (
                classes.map((cls, idx) => (
                  <div
                    key={cls.id}
                    className="flex flex-col gap-3 rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-4 dark:border-[#2a3b50] dark:bg-[#192638] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#087fce]/10 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                          {cls.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                          {cls.notes}
                        </p>
                        <span className="mt-2 inline-block text-[10px] text-[#647083] dark:text-[#94a3b8]">
                          Added on: {cls.dateAdded}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={cls.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#d8e1ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1]"
                      >
                        <FileText className="size-3.5" />
                        <span>PDF</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls.id)}
                        title="Delete class"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
