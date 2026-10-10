'use client'

import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Plus,
  Trash2,
  Unlock,
  Upload,
  Video,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
  const [successMessage, setSuccessMessage] = useState('')

  // PDF handling states
  const [pdfInputMode, setPdfInputMode] = useState<'upload' | 'url'>('upload')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfDataUrl, setPdfDataUrl] = useState('')
  const [isPdfDragging, setIsPdfDragging] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Image handling states
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [isImageDragging, setIsImageDragging] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

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

  // Handle PDF file selection
  function handlePdfFileSelect(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStorageError('Please select a valid PDF file.')
      return
    }
    setStorageError('')
    setPdfFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPdfDataUrl(reader.result as string)
    }
    reader.onerror = () => {
      setStorageError('Failed to read the PDF file.')
    }
    reader.readAsDataURL(file)
  }

  // Handle Image file selection
  function handleImageFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      setStorageError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }
    setStorageError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(reader.result as string)
    }
    reader.onerror = () => {
      setStorageError('Failed to read the image file.')
    }
    reader.readAsDataURL(file)
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

    // Determine final PDF URL (either uploaded data URL or text URL)
    let finalPdfUrl = ''
    let finalPdfName: string | undefined = undefined

    if (pdfInputMode === 'upload' && pdfDataUrl) {
      finalPdfUrl = pdfDataUrl
      finalPdfName = pdfFile?.name
    } else if (pdfInputMode === 'url' && pdfUrl.trim()) {
      try {
        const parsed = new URL(pdfUrl.trim())
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setStorageError('Please use a valid http:// or https:// URL for the PDF.')
          return
        }
        finalPdfUrl = pdfUrl.trim()
      } catch {
        setStorageError('Please enter a valid PDF URL.')
        return
      }
    }

    // Determine final Image URL (either uploaded data URL or text URL)
    let finalImageUrl: string | undefined = undefined
    if (imageInputMode === 'upload' && imageDataUrl) {
      finalImageUrl = imageDataUrl
    } else if (imageInputMode === 'url' && imageUrl.trim()) {
      finalImageUrl = imageUrl.trim()
    }

    const newItem: ClassItem = {
      id: Date.now().toString(),
      title: title.trim(),
      youtubeUrl: embed,
      notes: notes.trim(),
      pdfUrl: finalPdfUrl,
      pdfFileName: finalPdfName,
      imageUrl: finalImageUrl,
      dateAdded: new Date().toISOString().split('T')[0],
    }

    const updated = [newItem, ...classes]
    try {
      saveClasses(updated)
      setClasses(updated)
      setStorageError('')
    } catch {
      setStorageError('Could not save this class in this browser storage. Storage might be full.')
      return
    }

    // Reset form
    setTitle('')
    setYoutubeUrl('')
    setNotes('')
    setPdfUrl('')
    setPdfFile(null)
    setPdfDataUrl('')
    setImageUrl('')
    setImageFile(null)
    setImageDataUrl('')
    setSuccessMessage('Class and notes saved successfully! It is now live on the Student Dashboard.')
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
              <label
                htmlFor="passcode"
                className="mb-1 block text-xs font-semibold text-[#475569] dark:text-[#cbd5e1]"
              >
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 pr-10 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
                <KeyRound className="absolute right-3 top-3 size-4 text-[#94a3b8]" />
              </div>
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087fce] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0665aa] cursor-pointer"
            >
              <Unlock className="size-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 border-t border-[#e2e8f0] pt-4 text-center dark:border-[#2a3b50]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647083] hover:text-[#087fce] dark:text-[#94a3b8]"
            >
              <ArrowLeft className="size-3" />
              Back to main site
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
            Add YouTube classes, upload or drop PDF notes, and attach cover images. Content appears on the Student Dashboard.
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

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Add Class Form (5 cols on large) */}
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] lg:col-span-5">
            <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              Add New Class & Notes
            </h2>
            <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
              Publish video, upload PDF notes, and set cover image
            </p>

            <form onSubmit={handleAddClass} className="mt-5 space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Topic / Class Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BCS-011: Computer Basics Lecture 1"
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              {/* YouTube URL */}
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

              {/* Cover Image / Thumbnail (New) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Class Cover Image / Thumbnail (Optional)
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      Drop File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageFileSelect(file)
                      }}
                    />

                    {imageDataUrl ? (
                      <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageDataUrl}
                            alt="Cover Preview"
                            className="size-12 rounded-lg object-cover border border-emerald-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                              {imageFile?.name || 'Uploaded Image'}
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Image ready to display on dashboard
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null)
                              setImageDataUrl('')
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsImageDragging(true)
                        }}
                        onDragLeave={() => setIsImageDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsImageDragging(false)
                          const file = e.dataTransfer.files?.[0]
                          if (file) handleImageFileSelect(file)
                        }}
                        onClick={() => imageInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-dashed cursor-pointer transition ${
                          isImageDragging
                            ? 'border-[#087fce] bg-sky-50 dark:bg-sky-950/20'
                            : 'border-[#d8e1ec] bg-[#f8fafc] hover:border-[#087fce] dark:border-[#34445a] dark:bg-[#192638]'
                        }`}
                      >
                        <ImageIcon className="size-5 text-[#94a3b8] mb-1" />
                        <span className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                          Drop image here or click to browse
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">
                          PNG, JPG, WebP supported
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                )}
              </div>

              {/* Notes Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Notes Description / Key Points (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Write summary notes or topics covered in this lecture..."
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              {/* PDF Notes (Drop / Select Feature) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    PDF Notes (Drop File or Select)
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPdfInputMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        pdfInputMode === 'upload'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      Drop File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfInputMode('url')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        pdfInputMode === 'url'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {pdfInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePdfFileSelect(file)
                      }}
                    />

                    {pdfDataUrl ? (
                      <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                            <FileText className="size-5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-emerald-900 dark:text-emerald-200">
                              {pdfFile?.name || 'Selected PDF'}
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                              {pdfFile ? `${Math.round(pdfFile.size / 1024)} KB · Ready to save` : 'PDF attached'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPdfFile(null)
                              setPdfDataUrl('')
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsPdfDragging(true)
                        }}
                        onDragLeave={() => setIsPdfDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsPdfDragging(false)
                          const file = e.dataTransfer.files?.[0]
                          if (file) handlePdfFileSelect(file)
                        }}
                        onClick={() => pdfInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${
                          isPdfDragging
                            ? 'border-[#087fce] bg-sky-50 dark:bg-sky-950/20'
                            : 'border-[#d8e1ec] bg-[#f8fafc] hover:border-[#087fce] dark:border-[#34445a] dark:bg-[#192638]'
                        }`}
                      >
                        <Upload className="size-5 text-[#94a3b8] mb-1.5" />
                        <span className="text-xs font-bold text-[#314255] dark:text-[#cbd5e1]">
                          Drop PDF notes here or click to select
                        </span>
                        <span className="text-[10px] text-[#94a3b8] mt-0.5">
                          PDF files stored for student download
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/notes.pdf"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                )}
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

          {/* Manage Existing Classes List (7 cols on large) */}
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] lg:col-span-7">
            <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              Published Classes & Notes ({classes.length})
            </h2>
            <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
              Saved classes appear immediately on the student dashboard
            </p>

            <div className="mt-5 space-y-3">
              {classes.length === 0 ? (
                <div className="py-12 text-center">
                  <Video className="mx-auto size-8 text-[#94a3b8] mb-2" />
                  <p className="text-sm font-semibold text-[#647083] dark:text-[#94a3b8]">
                    No classes published yet.
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Use the form on the left to add your first video and PDF notes!
                  </p>
                </div>
              ) : (
                classes.map((cls, idx) => (
                  <div
                    key={cls.id}
                    className="flex flex-col gap-3 rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-4 dark:border-[#2a3b50] dark:bg-[#192638] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {cls.imageUrl ? (
                        <img
                          src={cls.imageUrl}
                          alt={cls.title}
                          className="size-12 shrink-0 rounded-lg object-cover border border-[#d8e1ec] dark:border-[#34445a]"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#087fce]/10 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#172333] dark:text-[#edf3fb] truncate">
                          {cls.title}
                        </h3>
                        {cls.notes && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                            {cls.notes}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[#647083] dark:text-[#94a3b8]">
                          <span>Added: {cls.dateAdded}</span>
                          {cls.pdfUrl && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              • PDF attached {cls.pdfFileName ? `(${cls.pdfFileName})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {cls.pdfUrl && (
                        <a
                          href={cls.pdfUrl}
                          download={cls.pdfFileName || 'notes.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d8e1ec] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1]"
                        >
                          <FileText className="size-3.5" />
                          <span>PDF</span>
                        </a>
                      )}
                      <Link
                        href={`/dashboard/classes/${encodeURIComponent(cls.id)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#d8e1ec] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1]"
                      >
                        <Video className="size-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls.id)}
                        title="Delete class"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
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
