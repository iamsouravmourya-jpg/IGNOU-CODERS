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
  CLASS_ASSETS_BUCKET,
  CLASS_STORAGE_KEY,
  readClasses,
  toYouTubeEmbedUrl,
  type ClassItem,
} from '@/lib/classes'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type UploadKind = 'pdf' | 'image'

async function uploadClassAsset(file: File, kind: UploadKind) {
  const contentType = kind === 'pdf' ? 'application/pdf' : file.type
  const response = await fetch('/api/admin/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, contentType }),
  })
  const upload = (await response.json()) as {
    error?: string
    path?: string
    token?: string
  }

  if (!response.ok || !upload.path || !upload.token) {
    throw new Error(upload.error ?? 'Could not prepare the file upload.')
  }

  const storage = createSupabaseBrowserClient().storage.from(CLASS_ASSETS_BUCKET)
  const { error } = await storage.uploadToSignedUrl(upload.path, upload.token, file, {
    contentType,
    upsert: false,
  })
  if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`)

  return { path: upload.path }
}

async function removeUploadedAssets(paths: string[]) {
  if (paths.length === 0) return

  const response = await fetch('/api/admin/uploads', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  })
  if (!response.ok) {
    const result = (await response.json()) as { error?: string }
    throw new Error(result.error ?? 'Could not clean up uploaded files.')
  }
}

async function migrateLegacyAsset(url: string, fileName: string, kind: UploadKind) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not read the saved file ${fileName}.`)

  const blob = await response.blob()
  const file = new File(
    [blob],
    fileName,
    { type: blob.type || (kind === 'pdf' ? 'application/pdf' : '') },
  )
  return uploadClassAsset(file, kind)
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null)

  // Form states for adding new class
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // PDF handling states
  const [pdfInputMode, setPdfInputMode] = useState<'upload' | 'url'>('upload')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
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
    let isMounted = true

    async function loadClasses() {
      try {
        const response = await fetch('/api/admin/classes')
        const result = (await response.json()) as ClassItem[] | { error?: string }
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !Array.isArray(result) ? result.error : 'Could not load published classes.',
          )
        }

        const savedClasses = [...result]
        if (isMounted) setClasses(savedClasses)
        const savedIds = new Set(savedClasses.map((item) => item.id))
        const legacyClasses = readClasses()

        for (const legacyClass of legacyClasses) {
          if (savedIds.has(legacyClass.id)) continue

          const uploadedPaths: string[] = []
          try {
            let pdfUrl = legacyClass.pdfUrl
            let pdfStoragePath = legacyClass.pdfStoragePath
            if (pdfUrl.startsWith('data:')) {
              const uploaded = await migrateLegacyAsset(
                pdfUrl,
                legacyClass.pdfFileName || 'notes.pdf',
                'pdf',
              )
              uploadedPaths.push(uploaded.path)
              pdfUrl = ''
              pdfStoragePath = uploaded.path
            }

            let imageUrl = legacyClass.imageUrl
            let imageStoragePath = legacyClass.imageStoragePath
            if (imageUrl?.startsWith('data:')) {
              const uploaded = await migrateLegacyAsset(
                imageUrl,
                'cover-image',
                'image',
              )
              uploadedPaths.push(uploaded.path)
              imageUrl = undefined
              imageStoragePath = uploaded.path
            }

            const saveResponse = await fetch('/api/admin/classes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...legacyClass,
                pdfUrl,
                pdfStoragePath,
                imageUrl,
                imageStoragePath,
              }),
            })
            const savedResult = (await saveResponse.json()) as
              | ClassItem
              | { error?: string }
            if (!saveResponse.ok || !('id' in savedResult)) {
              throw new Error(
                'error' in savedResult
                  ? savedResult.error ?? `Could not migrate "${legacyClass.title}".`
                  : `Could not migrate "${legacyClass.title}".`,
              )
            }

            savedIds.add(savedResult.id)
            savedClasses.unshift(savedResult)
            if (isMounted) setClasses([...savedClasses])
          } catch (error) {
            let migrationError =
              error instanceof Error
                ? error.message
                : `Could not migrate "${legacyClass.title}".`
            try {
              await removeUploadedAssets(uploadedPaths)
            } catch (cleanupError) {
              const cleanupMessage =
                cleanupError instanceof Error
                  ? cleanupError.message
                  : 'Partially uploaded files could not be cleaned up.'
              migrationError = `${migrationError} ${cleanupMessage}`
            }
            throw new Error(migrationError)
          }
        }

        if (legacyClasses.length > 0) {
          window.localStorage.removeItem(CLASS_STORAGE_KEY)
        }
        if (isMounted) setStorageError('')
      } catch (error) {
        if (!isMounted) return
        setStorageError(
          error instanceof Error
            ? error.message
            : 'Could not load or migrate saved classes.',
        )
      }
    }

    loadClasses()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  useEffect(
    () => () => {
      if (imageDataUrl.startsWith('blob:')) URL.revokeObjectURL(imageDataUrl)
    },
    [imageDataUrl],
  )

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
  }

  // Handle Image file selection
  function handleImageFileSelect(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStorageError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }
    setStorageError('')
    setImageFile(file)
    setImageDataUrl(URL.createObjectURL(file))
  }

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault()
    if (isSaving) return
    if (!title.trim()) {
      setStorageError('Enter a topic or class title.')
      return
    }

    const embed = toYouTubeEmbedUrl(youtubeUrl)
    if (!embed) {
      setStorageError('Enter a valid YouTube video, Shorts, or embed link.')
      return
    }

    let finalPdfUrl = ''
    let finalPdfName: string | undefined = undefined

    if (pdfInputMode === 'url' && pdfUrl.trim()) {
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

    let finalImageUrl: string | undefined
    if (imageInputMode === 'url' && imageUrl.trim()) {
      try {
        const parsed = new URL(imageUrl.trim())
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setStorageError('Please use a valid http:// or https:// URL for the image.')
          return
        }
        finalImageUrl = imageUrl.trim()
      } catch {
        setStorageError('Please enter a valid image URL.')
        return
      }
    }

    setIsSaving(true)
    setStorageError('')
    const uploadedPaths: string[] = []
    try {
      let pdfStoragePath: string | undefined
      if (pdfInputMode === 'upload' && pdfFile) {
        const uploadedPdf = await uploadClassAsset(pdfFile, 'pdf')
        uploadedPaths.push(uploadedPdf.path)
        finalPdfUrl = ''
        finalPdfName = pdfFile.name
        pdfStoragePath = uploadedPdf.path
      }

      let imageStoragePath: string | undefined
      if (imageInputMode === 'upload' && imageFile) {
        const uploadedImage = await uploadClassAsset(imageFile, 'image')
        uploadedPaths.push(uploadedImage.path)
        finalImageUrl = undefined
        imageStoragePath = uploadedImage.path
      }

      const newItem: ClassItem = {
        id: crypto.randomUUID(),
        title: title.trim(),
        youtubeUrl: embed,
        notes: notes.trim(),
        pdfUrl: finalPdfUrl,
        pdfFileName: finalPdfName,
        pdfStoragePath,
        imageUrl: finalImageUrl,
        imageStoragePath,
        dateAdded: new Date().toISOString().split('T')[0],
      }
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      const result = (await response.json()) as ClassItem | { error?: string }
      if (!response.ok || !('id' in result)) {
        throw new Error(
          'error' in result
            ? result.error ?? 'Could not publish this class.'
            : 'Could not publish this class.',
        )
      }

      setClasses((current) => [result, ...current])
      setTitle('')
      setYoutubeUrl('')
      setNotes('')
      setPdfUrl('')
      setPdfFile(null)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
      setImageUrl('')
      setImageFile(null)
      setImageDataUrl('')
      if (imageInputRef.current) imageInputRef.current.value = ''
      setSuccessMessage('Class and notes saved to the server. They are live on the Student Dashboard.')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not publish this class.'
      try {
        await removeUploadedAssets(uploadedPaths)
      } catch (cleanupError) {
        const cleanupMessage =
          cleanupError instanceof Error
            ? cleanupError.message
            : 'Uploaded files could not be cleaned up.'
        setStorageError(`${message} ${cleanupMessage}`)
        return
      }
      setStorageError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this class/notes?')) return

    setDeletingClassId(id)
    setStorageError('')
    try {
      const response = await fetch(`/api/admin/classes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const result = (await response.json()) as { error?: string; warning?: string }
      if (!response.ok) {
        throw new Error(result.error ?? 'Could not delete this class.')
      }
      setClasses((current) => current.filter((item) => item.id !== id))
      if (result.warning) setStorageError(result.warning)
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : 'Could not delete this class.',
      )
    } finally {
      setDeletingClassId(null)
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
                      accept="image/jpeg,image/png,image/webp"
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
                              if (imageInputRef.current) imageInputRef.current.value = ''
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

                    {pdfFile ? (
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
                              if (pdfInputRef.current) pdfInputRef.current.value = ''
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
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087fce] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0665aa] disabled:cursor-wait disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? <Upload className="size-4 animate-pulse" /> : <Plus className="size-4" />}
                <span>{isSaving ? 'Saving to Supabase...' : 'Publish Class & Notes'}</span>
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
                        disabled={deletingClassId === cls.id}
                        title="Delete class"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
                      >
                        {deletingClassId === cls.id ? (
                          <Upload className="size-4 animate-pulse" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
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
