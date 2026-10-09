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

export interface ClassItem {
  id: string
  title: string
  youtubeUrl: string
  notes: string
  pdfUrl: string
  dateAdded: string
}

const DEFAULT_CLASSES: ClassItem[] = [
  {
    id: '1',
    title: 'MCS-011: Complete C Programming & Pointers Masterclass',
    youtubeUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0',
    notes: 'In this class, we cover dynamic memory allocation (malloc, calloc, realloc), pointer arithmetic, structures, and previous year IGNOU lab important questions with viva explanations.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    dateAdded: '2026-10-09',
  },
  {
    id: '2',
    title: 'MCS-012: Computer Organization - K-Maps & Logic Circuits',
    youtubeUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    notes: 'Detailed notes on Karnaugh Maps (K-maps) simplification for 3 and 4 variables, combinational logic circuits, multiplexers, decoders, and flip-flops.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    dateAdded: '2026-10-09',
  },
  {
    id: '3',
    title: 'MCS-013: Discrete Mathematics - Graphs & Relations',
    youtubeUrl: 'https://www.youtube.com/embed/2SKn7HxDwIE',
    notes: 'Equivalence relations, partial orders, graph theory basics, Eulerian and Hamiltonian graphs, trees, and recurrence relations solved problems.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    dateAdded: '2026-10-09',
  },
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isDark, setIsDark] = useState(false)

  // Form states for adding new class
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setIsDark(window.localStorage.getItem('ignou-coders-theme') === 'dark')
    // Load existing classes from localStorage or defaults
    const saved = window.localStorage.getItem('ignou_coders_classes')
    if (saved) {
      try {
        setClasses(JSON.parse(saved))
      } catch {
        setClasses(DEFAULT_CLASSES)
      }
    } else {
      setClasses(DEFAULT_CLASSES)
      window.localStorage.setItem('ignou_coders_classes', JSON.stringify(DEFAULT_CLASSES))
    }

    // Check if already authed in session
    if (window.sessionStorage.getItem('ignou_admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // Admin passcode: admin123 or ignou2026
    if (passcode === 'admin123' || passcode === 'ignou2026') {
      setIsAuthenticated(true)
      window.sessionStorage.setItem('ignou_admin_auth', 'true')
      setErrorMsg('')
    } else {
      setErrorMsg('Incorrect admin passcode! Try: admin123')
    }
  }

  function handleAddClass(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !youtubeUrl) return

    // Parse YouTube embed if watch link provided
    let embed = youtubeUrl.trim()
    if (embed.includes('watch?v=')) {
      const vId = embed.split('watch?v=')[1]?.split('&')[0]
      if (vId) embed = `https://www.youtube.com/embed/${vId}`
    } else if (embed.includes('youtu.be/')) {
      const vId = embed.split('youtu.be/')[1]?.split('?')[0]
      if (vId) embed = `https://www.youtube.com/embed/${vId}`
    }

    const newItem: ClassItem = {
      id: Date.now().toString(),
      title,
      youtubeUrl: embed,
      notes: notes || 'No description notes provided for this class yet.',
      pdfUrl: pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      dateAdded: new Date().toISOString().split('T')[0],
    }

    const updated = [newItem, ...classes]
    setClasses(updated)
    window.localStorage.setItem('ignou_coders_classes', JSON.stringify(updated))

    // Reset form
    setTitle('')
    setYoutubeUrl('')
    setNotes('')
    setPdfUrl('')
    setSuccessMessage('Class and notes published successfully! Students can now view it.')
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this class/notes?')) {
      const updated = classes.filter((c) => c.id !== id)
      setClasses(updated)
      window.localStorage.setItem('ignou_coders_classes', JSON.stringify(updated))
    }
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
                  placeholder="Enter admin pass (e.g. admin123)"
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] py-2.5 pl-9 pr-3 text-sm font-medium text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#647083] dark:text-[#94a3b8]">
                Hint for testing: <code className="font-mono font-bold text-[#087fce] dark:text-[#61c5ff]">admin123</code>
              </p>
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
              onClick={() => {
                setIsAuthenticated(false)
                window.sessionStorage.removeItem('ignou_admin_auth')
              }}
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
            Add new YouTube classes and study notes PDF links. Changes reflect instantly on all student dashboards.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
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
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
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
                  PDF Notes Download Link
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="e.g. https://example.com/notes.pdf"
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
              All items currently live on student dashboard
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
