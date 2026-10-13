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
  Pencil,
  Plus,
  Radio,
  Search,
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
import {
  readLiveSessions,
  saveLiveSessionsLocally,
  type LiveSessionItem,
} from '@/lib/live-sessions'
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
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null)
  const [classSearch, setClassSearch] = useState('')

  // Form states for adding new class
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Live sessions states
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([])
  const [isLoadingLiveSessions, setIsLoadingLiveSessions] = useState(true)
  const [isSavingLiveSession, setIsSavingLiveSession] = useState(false)
  const [deletingLiveSessionId, setDeletingLiveSessionId] = useState<string | null>(null)

  // Live session form states
  const [liveTitle, setLiveTitle] = useState('')
  const [liveMeetUrl, setLiveMeetUrl] = useState('')
  const [liveTime, setLiveTime] = useState('')
  const [liveImageMode, setLiveImageMode] = useState<'upload' | 'url'>('upload')
  const [liveImageUrl, setLiveImageUrl] = useState('')
  const [liveImageFile, setLiveImageFile] = useState<File | null>(null)
  const [liveImageDataUrl, setLiveImageDataUrl] = useState('')
  const [isLiveImageDragging, setIsLiveImageDragging] = useState(false)
  const liveImageInputRef = useRef<HTMLInputElement>(null)

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

  // Edit class state
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editPdfMode, setEditPdfMode] = useState<'keep' | 'upload' | 'url' | 'remove'>('keep')
  const [editPdfUrl, setEditPdfUrl] = useState('')
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null)
  const editPdfInputRef = useRef<HTMLInputElement>(null)
  const [editImageMode, setEditImageMode] = useState<'keep' | 'upload' | 'url' | 'remove'>('keep')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImageDataUrl, setEditImageDataUrl] = useState('')
  const editImageInputRef = useRef<HTMLInputElement>(null)
  const [isSavingEditClass, setIsSavingEditClass] = useState(false)
  const [editClassError, setEditClassError] = useState('')

  // Edit live session state
  const [editingLiveSession, setEditingLiveSession] = useState<LiveSessionItem | null>(null)
  const [editLiveTitle, setEditLiveTitle] = useState('')
  const [editLiveMeetUrl, setEditLiveMeetUrl] = useState('')
  const [editLiveTime, setEditLiveTime] = useState('')
  const [editLiveImageMode, setEditLiveImageMode] = useState<'keep' | 'upload' | 'url' | 'remove'>('keep')
  const [editLiveImageUrl, setEditLiveImageUrl] = useState('')
  const [editLiveImageFile, setEditLiveImageFile] = useState<File | null>(null)
  const [editLiveImageDataUrl, setEditLiveImageDataUrl] = useState('')
  const editLiveImageInputRef = useRef<HTMLInputElement>(null)
  const [isSavingEditLiveSession, setIsSavingEditLiveSession] = useState(false)
  const [editLiveError, setEditLiveError] = useState('')

  const filteredClasses = classes.filter((item) => {
    const query = classSearch.trim().toLowerCase()
    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.notes.toLowerCase().includes(query)
    )
  })
  const classesWithPdf = classes.filter((item) => item.pdfUrl).length
  const classesWithImages = classes.filter((item) => item.imageUrl).length

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
    setIsLoadingClasses(true)

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
      } finally {
        if (isMounted) setIsLoadingClasses(false)
      }
    }

    loadClasses()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    let isMounted = true
    setIsLoadingLiveSessions(true)

    async function loadLiveSessions() {
      try {
        const response = await fetch('/api/admin/live-sessions')
        if (response.ok) {
          const result = await response.json()
          if (Array.isArray(result) && isMounted) {
            const clean = result.filter(
              (item: { id?: string; title?: string }) =>
                item.id !== 'live-1' &&
                !item.title?.includes('MCS-011: Live Logic Building'),
            )
            setLiveSessions(clean)
            saveLiveSessionsLocally(clean)
            return
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoadingLiveSessions(false)
      }
      if (isMounted) {
        setLiveSessions(readLiveSessions())
      }
    }

    loadLiveSessions()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  useEffect(
    () => () => {
      if (imageDataUrl.startsWith('blob:')) URL.revokeObjectURL(imageDataUrl)
      if (liveImageDataUrl.startsWith('blob:')) URL.revokeObjectURL(liveImageDataUrl)
      if (editImageDataUrl.startsWith('blob:')) URL.revokeObjectURL(editImageDataUrl)
      if (editLiveImageDataUrl.startsWith('blob:')) URL.revokeObjectURL(editLiveImageDataUrl)
    },
    [imageDataUrl, liveImageDataUrl, editImageDataUrl, editLiveImageDataUrl],
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

  function handleLiveImageFileSelect(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStorageError('Please select a valid image file (PNG, JPG, WebP) for the live session.')
      return
    }
    setStorageError('')
    setLiveImageFile(file)
    setLiveImageDataUrl(URL.createObjectURL(file))
  }

  async function handleAddLiveSession(e: React.FormEvent) {
    e.preventDefault()
    if (isSavingLiveSession) return

    if (!liveTitle.trim()) {
      setStorageError('Enter a live session topic/title.')
      return
    }

    const meetLink = liveMeetUrl.trim()
    if (!meetLink) {
      setStorageError('Enter a valid Google Meet link.')
      return
    }

    setIsSavingLiveSession(true)
    setStorageError('')
    const uploadedPaths: string[] = []

    try {
      let imageStoragePath: string | undefined
      let finalImageUrl: string | undefined

      if (liveImageMode === 'upload' && liveImageFile) {
        const uploaded = await uploadClassAsset(liveImageFile, 'image')
        uploadedPaths.push(uploaded.path)
        imageStoragePath = uploaded.path
      } else if (liveImageMode === 'url' && liveImageUrl.trim()) {
        try {
          const parsed = new URL(liveImageUrl.trim())
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            finalImageUrl = liveImageUrl.trim()
          }
        } catch {
          setStorageError('Please enter a valid image URL.')
          setIsSavingLiveSession(false)
          return
        }
      }

      const newItem: LiveSessionItem = {
        id: crypto.randomUUID(),
        title: liveTitle.trim(),
        meetUrl: meetLink,
        scheduledTime: liveTime.trim() || 'Today · Live Session',
        imageUrl: finalImageUrl,
        imageStoragePath,
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      const response = await fetch('/api/admin/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      let savedSession = newItem
      if (response.ok) {
        const saved = await response.json()
        if (saved && saved.id) savedSession = saved
      }

      const updated = [savedSession, ...liveSessions]
      setLiveSessions(updated)
      saveLiveSessionsLocally(updated)

      setLiveTitle('')
      setLiveMeetUrl('')
      setLiveTime('')
      setLiveImageUrl('')
      setLiveImageFile(null)
      setLiveImageDataUrl('')
      if (liveImageInputRef.current) liveImageInputRef.current.value = ''

      setSuccessMessage('Live session published! Student dashboard notification has been triggered.')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not publish live session.'
      try {
        await removeUploadedAssets(uploadedPaths)
      } catch {}
      setStorageError(message)
    } finally {
      setIsSavingLiveSession(false)
    }
  }

  async function handleDeleteLiveSession(id: string) {
    if (!window.confirm('Are you sure you want to delete this live session?')) return

    setDeletingLiveSessionId(id)
    setStorageError('')
    try {
      const response = await fetch(`/api/admin/live-sessions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Could not delete live session.')
      }

      const updated = liveSessions.filter((s) => s.id !== id)
      setLiveSessions(updated)
      saveLiveSessionsLocally(updated)
      setSuccessMessage('Live session deleted.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Could not delete live session.')
    } finally {
      setDeletingLiveSessionId(null)
    }
  }

  function handleStartEditClass(cls: ClassItem) {
    setEditingClass(cls)
    setEditTitle(cls.title)
    setEditYoutubeUrl(cls.youtubeUrl)
    setEditNotes(cls.notes || '')
    setEditPdfMode(cls.pdfUrl || cls.pdfStoragePath ? 'keep' : 'upload')
    setEditPdfUrl(cls.pdfUrl && !cls.pdfStoragePath ? cls.pdfUrl : '')
    setEditPdfFile(null)
    setEditImageMode(cls.imageUrl || cls.imageStoragePath ? 'keep' : 'upload')
    setEditImageUrl(cls.imageUrl && !cls.imageStoragePath ? cls.imageUrl : '')
    setEditImageFile(null)
    setEditImageDataUrl('')
    setEditClassError('')
  }

  async function handleSaveEditClass(e: React.FormEvent) {
    e.preventDefault()
    if (!editingClass || isSavingEditClass) return

    if (!editTitle.trim()) {
      setEditClassError('Enter a topic or class title.')
      return
    }

    const embed = toYouTubeEmbedUrl(editYoutubeUrl)
    if (!embed) {
      setEditClassError('Enter a valid YouTube video, Shorts, or embed link.')
      return
    }

    let finalPdfUrl = ''
    let finalPdfName: string | undefined = undefined
    let finalPdfStoragePath: string | undefined = undefined

    if (editPdfMode === 'keep') {
      finalPdfUrl = editingClass.pdfUrl
      finalPdfName = editingClass.pdfFileName
      finalPdfStoragePath = editingClass.pdfStoragePath
    } else if (editPdfMode === 'url' && editPdfUrl.trim()) {
      try {
        const parsed = new URL(editPdfUrl.trim())
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setEditClassError('Please use a valid http:// or https:// URL for the PDF.')
          return
        }
        finalPdfUrl = editPdfUrl.trim()
      } catch {
        setEditClassError('Please enter a valid PDF URL.')
        return
      }
    } else if (editPdfMode === 'remove') {
      finalPdfUrl = ''
      finalPdfName = undefined
      finalPdfStoragePath = undefined
    }

    let finalImageUrl: string | undefined = undefined
    let finalImageStoragePath: string | undefined = undefined

    if (editImageMode === 'keep') {
      finalImageUrl = editingClass.imageUrl
      finalImageStoragePath = editingClass.imageStoragePath
    } else if (editImageMode === 'url' && editImageUrl.trim()) {
      try {
        const parsed = new URL(editImageUrl.trim())
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setEditClassError('Please use a valid http:// or https:// URL for the image.')
          return
        }
        finalImageUrl = editImageUrl.trim()
      } catch {
        setEditClassError('Please enter a valid image URL.')
        return
      }
    } else if (editImageMode === 'remove') {
      finalImageUrl = undefined
      finalImageStoragePath = undefined
    }

    setIsSavingEditClass(true)
    setEditClassError('')
    const uploadedPaths: string[] = []

    try {
      if (editPdfMode === 'upload' && editPdfFile) {
        const uploadedPdf = await uploadClassAsset(editPdfFile, 'pdf')
        uploadedPaths.push(uploadedPdf.path)
        finalPdfUrl = ''
        finalPdfName = editPdfFile.name
        finalPdfStoragePath = uploadedPdf.path
      }

      if (editImageMode === 'upload' && editImageFile) {
        const uploadedImage = await uploadClassAsset(editImageFile, 'image')
        uploadedPaths.push(uploadedImage.path)
        finalImageUrl = undefined
        finalImageStoragePath = uploadedImage.path
      }

      const updatedItem: ClassItem = {
        ...editingClass,
        title: editTitle.trim(),
        youtubeUrl: embed,
        notes: editNotes.trim(),
        pdfUrl: finalPdfUrl,
        pdfFileName: finalPdfName,
        pdfStoragePath: finalPdfStoragePath,
        imageUrl: finalImageUrl,
        imageStoragePath: finalImageStoragePath,
      }

      const response = await fetch('/api/admin/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      })

      const result = (await response.json()) as ClassItem | { error?: string }
      if (!response.ok || !('id' in result)) {
        throw new Error(
          'error' in result ? result.error ?? 'Could not update class.' : 'Could not update class.',
        )
      }

      setClasses((current) => current.map((item) => (item.id === result.id ? result : item)))
      setEditingClass(null)
      setSuccessMessage(`"${result.title}" updated successfully!`)
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update class.'
      try {
        await removeUploadedAssets(uploadedPaths)
      } catch {}
      setEditClassError(message)
    } finally {
      setIsSavingEditClass(false)
    }
  }

  function handleStartEditLiveSession(session: LiveSessionItem) {
    setEditingLiveSession(session)
    setEditLiveTitle(session.title)
    setEditLiveMeetUrl(session.meetUrl)
    setEditLiveTime(session.scheduledTime || '')
    setEditLiveImageMode(session.imageUrl || session.imageStoragePath ? 'keep' : 'upload')
    setEditLiveImageUrl(session.imageUrl && !session.imageStoragePath ? session.imageUrl : '')
    setEditLiveImageFile(null)
    setEditLiveImageDataUrl('')
    setEditLiveError('')
  }

  async function handleSaveEditLiveSession(e: React.FormEvent) {
    e.preventDefault()
    if (!editingLiveSession || isSavingEditLiveSession) return

    if (!editLiveTitle.trim()) {
      setEditLiveError('Enter a live session topic/title.')
      return
    }

    const meetLink = editLiveMeetUrl.trim()
    if (!meetLink) {
      setEditLiveError('Enter a valid Google Meet link.')
      return
    }

    let finalImageUrl: string | undefined = undefined
    let finalImageStoragePath: string | undefined = undefined

    if (editLiveImageMode === 'keep') {
      finalImageUrl = editingLiveSession.imageUrl
      finalImageStoragePath = editingLiveSession.imageStoragePath
    } else if (editLiveImageMode === 'url' && editLiveImageUrl.trim()) {
      try {
        const parsed = new URL(editLiveImageUrl.trim())
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          finalImageUrl = editLiveImageUrl.trim()
        }
      } catch {
        setEditLiveError('Please enter a valid image URL.')
        return
      }
    } else if (editLiveImageMode === 'remove') {
      finalImageUrl = undefined
      finalImageStoragePath = undefined
    }

    setIsSavingEditLiveSession(true)
    setEditLiveError('')
    const uploadedPaths: string[] = []

    try {
      if (editLiveImageMode === 'upload' && editLiveImageFile) {
        const uploaded = await uploadClassAsset(editLiveImageFile, 'image')
        uploadedPaths.push(uploaded.path)
        finalImageUrl = undefined
        finalImageStoragePath = uploaded.path
      }

      const updatedItem: LiveSessionItem = {
        ...editingLiveSession,
        title: editLiveTitle.trim(),
        meetUrl: meetLink,
        scheduledTime: editLiveTime.trim() || 'Today · Live Session',
        imageUrl: finalImageUrl,
        imageStoragePath: finalImageStoragePath,
      }

      const response = await fetch('/api/admin/live-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      })

      let savedSession = updatedItem
      if (response.ok) {
        const saved = await response.json()
        if (saved && saved.id) savedSession = saved
      } else {
        const err = await response.json()
        throw new Error(err.error || 'Could not update live session.')
      }

      const updatedList = liveSessions.map((s) => (s.id === savedSession.id ? savedSession : s))
      setLiveSessions(updatedList)
      saveLiveSessionsLocally(updatedList)

      setEditingLiveSession(null)
      setSuccessMessage(`Live session "${savedSession.title}" updated successfully!`)
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update live session.'
      try {
        await removeUploadedAssets(uploadedPaths)
      } catch {}
      setEditLiveError(message)
    } finally {
      setIsSavingEditLiveSession(false)
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#087fce] text-white">
              <GraduationCap className="size-4.5 sm:size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-wider text-[#172333] dark:text-[#edf3fb] truncate">
                IGNOU CODERS ADMIN
              </h1>
              <span className="block text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                ● Live on pyeater.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/dashboard"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-2.5 py-1.5 sm:px-3.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]"
            >
              <ExternalLink className="size-3 sm:size-3.5" />
              <span className="hidden sm:inline">View Student Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 sm:px-3.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
            >
              <span className="hidden sm:inline">Logout Admin</span>
              <span className="sm:hidden">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-6xl px-3.5 py-5 sm:px-8 sm:py-10">
        <div className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#d9e7f5] bg-gradient-to-br from-white via-[#f0f7ff] to-[#e5f2ff] p-4.5 sm:p-8 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#172c43]">
          <div className="pointer-events-none absolute -right-12 -top-24 size-56 rounded-full bg-[#70c6ff]/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#087fce]/10 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#087fce] shadow-xs dark:border-[#61c5ff]/20 dark:bg-[#0d1b2b]/70 dark:text-[#61c5ff]">
                <GraduationCap className="size-3.5" />
                Learning hub
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                Content studio
              </h1>
              <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                Publish a class once. Students can access the video and notes from their dashboard.
              </p>
            </div>
            <span className="relative inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-xs dark:border-emerald-900/50 dark:bg-[#10231f]/70 dark:text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Changes sync to Supabase
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#dce5f1] bg-white p-2.5 sm:p-4 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d]">
            <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#087fce]/10 text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
              <Video className="size-4 sm:size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base sm:text-xl font-bold text-[#172333] dark:text-[#edf3fb] leading-tight">{classes.length}</p>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#647083] dark:text-[#94a3b8] leading-tight truncate">Classes</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#dce5f1] bg-white p-2.5 sm:p-4 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d]">
            <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400">
              <FileText className="size-4 sm:size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base sm:text-xl font-bold text-[#172333] dark:text-[#edf3fb] leading-tight">{classesWithPdf}</p>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#647083] dark:text-[#94a3b8] leading-tight truncate">PDF notes</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#dce5f1] bg-white p-2.5 sm:p-4 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d]">
            <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
              <ImageIcon className="size-4 sm:size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base sm:text-xl font-bold text-[#172333] dark:text-[#edf3fb] leading-tight">{classesWithImages}</p>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#647083] dark:text-[#94a3b8] leading-tight truncate">Covers</p>
            </div>
          </div>
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
          <div className="self-start rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6 lg:sticky lg:top-6 lg:col-span-5">
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
          <div className="rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6 lg:col-span-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                  Published content
                </h2>
                <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                  {classes.length} {classes.length === 1 ? 'class' : 'classes'} live on the student dashboard
                </p>
              </div>
              {classes.length > 0 && (
                <label className="relative block w-full sm:max-w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    type="search"
                    value={classSearch}
                    onChange={(event) => setClassSearch(event.target.value)}
                    placeholder="Search published..."
                    aria-label="Search published classes"
                    className="w-full rounded-lg border border-[#d8e1ec] bg-[#f8fafc] py-2 pl-9 pr-3 text-xs text-[#172333] outline-none transition placeholder:text-[#94a3b8] focus:border-[#087fce] focus:ring-4 focus:ring-[#087fce]/10 dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb] dark:focus:border-[#61c5ff]"
                  />
                </label>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {isLoadingClasses ? (
                <div className="space-y-3" aria-label="Loading published classes">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-xl bg-[#f1f5f9] dark:bg-[#192638]" />
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <div className="py-12 text-center">
                  <Video className="mx-auto size-8 text-[#94a3b8] mb-2" />
                  <p className="text-sm font-semibold text-[#647083] dark:text-[#94a3b8]">
                    No classes published yet.
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Use the form on the left to add your first video and PDF notes!
                  </p>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="mx-auto size-7 text-[#94a3b8]" />
                  <p className="mt-2 text-sm font-semibold text-[#647083] dark:text-[#94a3b8]">
                    No classes match that search.
                  </p>
                </div>
              ) : (
                filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="group flex flex-col gap-3 rounded-xl border border-[#e1e7ef] bg-[#fbfdff] p-3 transition hover:border-[#b7d8f4] hover:bg-white hover:shadow-sm dark:border-[#2a3b50] dark:bg-[#192638]/70 dark:hover:border-[#61c5ff]/40 dark:hover:bg-[#192638] sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {cls.imageUrl ? (
                        <img
                          src={cls.imageUrl}
                          alt={cls.title}
                          className="size-11 sm:size-12 shrink-0 rounded-xl object-cover border border-[#d8e1ec] dark:border-[#34445a]"
                        />
                      ) : (
                        <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#087fce]/15 to-[#61c5ff]/10 text-[#087fce] dark:from-[#61c5ff]/20 dark:to-[#087fce]/10 dark:text-[#61c5ff]">
                          <Video className="size-5" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#172333] dark:text-[#edf3fb] break-words line-clamp-2 sm:line-clamp-1">
                          {cls.title}
                        </h3>
                        {cls.notes && (
                          <p className="mt-0.5 line-clamp-2 sm:line-clamp-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                            {cls.notes}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[#647083] dark:text-[#94a3b8]">
                          <span>{cls.dateAdded}</span>
                          {cls.pdfUrl && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[200px]">
                              • PDF {cls.pdfFileName ? `(${cls.pdfFileName})` : 'attached'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#f0f4f9] sm:border-0 dark:border-[#2a3b50]/60 shrink-0">
                      <div className="flex items-center gap-1.5">
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
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditClass(cls)}
                          title="Edit class & notes"
                          className="inline-flex items-center justify-center rounded-lg border border-[#d8e1ec] bg-white p-1.5 text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1] dark:hover:text-[#61c5ff] cursor-pointer"
                        >
                          <Pencil className="size-4" />
                        </button>
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LIVE SESSIONS SECTION (GOOGLE MEET) */}
        <div className="mt-14 border-t border-[#dce5f1] pt-10 dark:border-[#2a3b50]">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                  <Radio className="size-4 animate-pulse" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb]">
                  Live Sessions Studio (Google Meet)
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                Add Google Meet link, session name, and photo. Students get an instant notification alert on their dashboard.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <span className="size-2 rounded-full bg-red-500 animate-ping" />
              {liveSessions.length} {liveSessions.length === 1 ? 'Live Session' : 'Live Sessions'}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Live Session Form (5 cols on lg) */}
            <div className="self-start rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6 lg:sticky lg:top-6 lg:col-span-5">
              <h3 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                Schedule New Live Session
              </h3>
              <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
                Provide session name, Google Meet URL, and thumbnail photo
              </p>

              <form onSubmit={handleAddLiveSession} className="mt-5 space-y-4">
                {/* 1. Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Session Name / Topic *
                  </label>
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="e.g. MCS-011: Live Logic Building & Doubt Session"
                    required
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                </div>

                {/* 2. Link (Google Meet) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Google Meet Link *
                  </label>
                  <input
                    type="url"
                    value={liveMeetUrl}
                    onChange={(e) => setLiveMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    required
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                </div>

                {/* 3. Photo (Image) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                      Session Photo / Thumbnail (Optional)
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setLiveImageMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          liveImageMode === 'upload'
                            ? 'bg-red-600 text-white'
                            : 'text-[#647083] hover:text-red-600'
                        }`}
                      >
                        Drop File
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiveImageMode('url')}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          liveImageMode === 'url'
                            ? 'bg-red-600 text-white'
                            : 'text-[#647083] hover:text-red-600'
                        }`}
                      >
                        URL Link
                      </button>
                    </div>
                  </div>

                  {liveImageMode === 'upload' ? (
                    <div>
                      <input
                        ref={liveImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLiveImageFileSelect(file)
                        }}
                      />

                      {liveImageFile ? (
                        <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                          <div className="flex items-center gap-3">
                            {liveImageDataUrl && (
                              <img
                                src={liveImageDataUrl}
                                alt="Preview"
                                className="size-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                {liveImageFile.name}
                              </p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                {Math.round(liveImageFile.size / 1024)} KB · Photo ready
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLiveImageFile(null)
                                setLiveImageDataUrl('')
                                if (liveImageInputRef.current) liveImageInputRef.current.value = ''
                              }}
                              className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsLiveImageDragging(true)
                          }}
                          onDragLeave={() => setIsLiveImageDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsLiveImageDragging(false)
                            const file = e.dataTransfer.files?.[0]
                            if (file) handleLiveImageFileSelect(file)
                          }}
                          onClick={() => liveImageInputRef.current?.click()}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${
                            isLiveImageDragging
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                              : 'border-[#d8e1ec] bg-[#f8fafc] hover:border-red-400 dark:border-[#34445a] dark:bg-[#192638]'
                          }`}
                        >
                          <Upload className="size-5 text-[#94a3b8] mb-1.5" />
                          <span className="text-xs font-bold text-[#314255] dark:text-[#cbd5e1]">
                            Drop session photo here or click
                          </span>
                          <span className="text-[10px] text-[#94a3b8] mt-0.5">
                            PNG, JPG or WebP
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={liveImageUrl}
                      onChange={(e) => setLiveImageUrl(e.target.value)}
                      placeholder="https://example.com/live-poster.jpg"
                      className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                    />
                  )}
                </div>

                {/* 4. Scheduled Time / Date */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Scheduled Time / Timing (Optional)
                  </label>
                  <input
                    type="text"
                    value={liveTime}
                    onChange={(e) => setLiveTime(e.target.value)}
                    placeholder="e.g. Saturday · 7:30 PM IST or Today 8 PM"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingLiveSession}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:from-red-500 hover:to-rose-500 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  {isSavingLiveSession ? (
                    <Upload className="size-4 animate-pulse" />
                  ) : (
                    <Radio className="size-4" />
                  )}
                  <span>{isSavingLiveSession ? 'Saving Live Session...' : 'Publish Live Session & Notify'}</span>
                </button>
              </form>
            </div>

            {/* Published Live Sessions Table / List (7 cols on lg) */}
            <div className="rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6 lg:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                    Active Live Sessions
                  </h3>
                  <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
                    Visible on student dashboard with instant Google Meet link
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {isLoadingLiveSessions ? (
                  <div className="space-y-3">
                    {[0, 1].map((item) => (
                      <div key={item} className="h-20 animate-pulse rounded-xl bg-[#f1f5f9] dark:bg-[#192638]" />
                    ))}
                  </div>
                ) : liveSessions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Radio className="mx-auto size-8 text-[#94a3b8] mb-2" />
                    <p className="text-sm font-semibold text-[#647083] dark:text-[#94a3b8]">
                      No live sessions published yet.
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Use the form on the left to add a Google Meet link and session name!
                    </p>
                  </div>
                ) : (
                  liveSessions.map((session) => (
                    <div
                      key={session.id}
                      className="group flex flex-col gap-3 rounded-xl border border-[#e1e7ef] bg-[#fbfdff] p-3 transition hover:border-red-300 hover:bg-white hover:shadow-sm dark:border-[#2a3b50] dark:bg-[#192638]/70 dark:hover:border-red-500/40 dark:hover:bg-[#192638] sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {session.imageUrl ? (
                          <img
                            src={session.imageUrl}
                            alt={session.title}
                            className="size-11 sm:size-12 shrink-0 rounded-xl object-cover border border-[#d8e1ec] dark:border-[#34445a]"
                          />
                        ) : (
                          <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                            <Radio className="size-5" />
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#172333] dark:text-[#edf3fb] break-words line-clamp-2 sm:line-clamp-1">
                            {session.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#647083] dark:text-[#94a3b8]">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <Video className="size-3" />
                              Google Meet
                            </span>
                            {session.scheduledTime && (
                              <span className="truncate max-w-[180px]">• {session.scheduledTime}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#f0f4f9] sm:border-0 dark:border-[#2a3b50]/60 shrink-0">
                        <a
                          href={session.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 cursor-pointer shadow-xs"
                        >
                          <span>Test Meet</span>
                          <ExternalLink className="size-3" />
                        </a>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditLiveSession(session)}
                            title="Edit live session"
                            className="inline-flex items-center justify-center rounded-lg border border-[#d8e1ec] bg-white p-1.5 text-[#314255] transition hover:border-red-300 hover:text-red-600 dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1] dark:hover:text-red-400 cursor-pointer"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLiveSession(session.id)}
                            disabled={deletingLiveSessionId === session.id}
                            title="Delete live session"
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
                          >
                            {deletingLiveSessionId === session.id ? (
                              <Upload className="size-4 animate-pulse" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EDIT RECORDED CLASS MODAL */}
      {editingClass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingEditClass) setEditingClass(null)
          }}
        >
          <div className="relative my-3 sm:my-8 w-full max-w-xl rounded-2xl border border-[#dce5f1] bg-white p-4 sm:p-6 shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-4 dark:border-[#2a3b50]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#087fce]/10 text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                  <Pencil className="size-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                    Edit Recorded Class
                  </h3>
                  <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                    Update lecture title, video URL, notes, or attachments
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSavingEditClass && setEditingClass(null)}
                className="rounded-lg p-1 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#172333] dark:hover:bg-[#192638] dark:hover:text-[#edf3fb] cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {editClassError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {editClassError}
              </div>
            )}

            <form onSubmit={handleSaveEditClass} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Topic / Class Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  value={editYoutubeUrl}
                  onChange={(e) => setEditYoutubeUrl(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              {/* Cover Image */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Cover Image / Thumbnail
                  </label>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {(editingClass.imageUrl || editingClass.imageStoragePath) && (
                      <button
                        type="button"
                        onClick={() => setEditImageMode('keep')}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          editImageMode === 'keep'
                            ? 'bg-[#087fce] text-white'
                            : 'text-[#647083] hover:text-[#087fce]'
                        }`}
                      >
                        Keep Current
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditImageMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editImageMode === 'upload'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageMode('url')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editImageMode === 'url'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageMode('remove')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editImageMode === 'remove'
                          ? 'bg-red-600 text-white'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {editImageMode === 'keep' && editingClass.imageUrl && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#d8e1ec] bg-[#f8fafc] p-2.5 dark:border-[#34445a] dark:bg-[#192638]">
                    <img
                      src={editingClass.imageUrl}
                      alt="Current cover"
                      className="size-12 rounded-lg object-cover"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#172333] dark:text-[#edf3fb]">Current Cover Active</span>
                      <p className="text-[10px] text-[#647083] dark:text-[#94a3b8]">Will be preserved</p>
                    </div>
                  </div>
                )}

                {editImageMode === 'upload' && (
                  <div>
                    <input
                      ref={editImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditImageFile(file)
                          setEditImageDataUrl(URL.createObjectURL(file))
                        }
                      }}
                    />
                    {editImageDataUrl ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                        <img
                          src={editImageDataUrl}
                          alt="New preview"
                          className="size-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            {editImageFile?.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Ready to upload on save</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditImageFile(null)
                            setEditImageDataUrl('')
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editImageInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#d8e1ec] bg-[#f8fafc] hover:border-[#087fce] dark:border-[#34445a] dark:bg-[#192638] cursor-pointer"
                      >
                        <ImageIcon className="size-5 text-[#94a3b8] mb-1" />
                        <span className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">Click to select new image</span>
                      </div>
                    )}
                  </div>
                )}

                {editImageMode === 'url' && (
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                )}

                {editImageMode === 'remove' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Cover image will be removed upon saving.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Notes Description / Key Points
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Lecture notes or topics covered..."
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              {/* PDF Notes */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    PDF Notes
                  </label>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {(editingClass.pdfUrl || editingClass.pdfStoragePath) && (
                      <button
                        type="button"
                        onClick={() => setEditPdfMode('keep')}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          editPdfMode === 'keep'
                            ? 'bg-[#087fce] text-white'
                            : 'text-[#647083] hover:text-[#087fce]'
                        }`}
                      >
                        Keep Current
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditPdfMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editPdfMode === 'upload'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPdfMode('url')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editPdfMode === 'url'
                          ? 'bg-[#087fce] text-white'
                          : 'text-[#647083] hover:text-[#087fce]'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPdfMode('remove')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editPdfMode === 'remove'
                          ? 'bg-red-600 text-white'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {editPdfMode === 'keep' && (editingClass.pdfUrl || editingClass.pdfStoragePath) && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#d8e1ec] bg-[#f8fafc] p-2.5 dark:border-[#34445a] dark:bg-[#192638]">
                    <FileText className="size-5 text-[#087fce]" />
                    <div className="text-xs truncate flex-1 min-w-0">
                      <span className="font-semibold text-[#172333] dark:text-[#edf3fb] block truncate">
                        {editingClass.pdfFileName || 'Attached PDF Notes'}
                      </span>
                      <p className="text-[10px] text-[#647083] dark:text-[#94a3b8]">Current file will be preserved</p>
                    </div>
                  </div>
                )}

                {editPdfMode === 'upload' && (
                  <div>
                    <input
                      ref={editPdfInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setEditPdfFile(file)
                      }}
                    />
                    {editPdfFile ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                        <FileText className="size-5 text-emerald-600" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            {editPdfFile.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {Math.round(editPdfFile.size / 1024)} KB · Ready to upload
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditPdfFile(null)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editPdfInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#d8e1ec] bg-[#f8fafc] hover:border-[#087fce] dark:border-[#34445a] dark:bg-[#192638] cursor-pointer"
                      >
                        <Upload className="size-5 text-[#94a3b8] mb-1" />
                        <span className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">Click to select new PDF</span>
                      </div>
                    )}
                  </div>
                )}

                {editPdfMode === 'url' && (
                  <input
                    type="url"
                    value={editPdfUrl}
                    onChange={(e) => setEditPdfUrl(e.target.value)}
                    placeholder="https://example.com/notes.pdf"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                )}

                {editPdfMode === 'remove' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    PDF notes attachment will be removed upon saving.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#2a3b50]">
                <button
                  type="button"
                  disabled={isSavingEditClass}
                  onClick={() => setEditingClass(null)}
                  className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-[#d8e1ec] px-4 py-2.5 text-xs font-semibold text-[#647083] hover:bg-[#f1f5f9] dark:border-[#34445a] dark:text-[#94a3b8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditClass}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#087fce] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0665aa] disabled:opacity-60 cursor-pointer"
                >
                  {isSavingEditClass ? <Upload className="size-3.5 animate-pulse" /> : <Pencil className="size-3.5" />}
                  <span>{isSavingEditClass ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LIVE SESSION MODAL */}
      {editingLiveSession && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingEditLiveSession) setEditingLiveSession(null)
          }}
        >
          <div className="relative my-3 sm:my-8 w-full max-w-xl rounded-2xl border border-[#dce5f1] bg-white p-4 sm:p-6 shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-4 dark:border-[#2a3b50]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                  <Pencil className="size-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                    Edit Live Session
                  </h3>
                  <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                    Update session topic, Google Meet link, timing, or photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSavingEditLiveSession && setEditingLiveSession(null)}
                className="rounded-lg p-1 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#172333] dark:hover:bg-[#192638] dark:hover:text-[#edf3fb] cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {editLiveError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {editLiveError}
              </div>
            )}

            <form onSubmit={handleSaveEditLiveSession} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Session Name / Topic *
                </label>
                <input
                  type="text"
                  value={editLiveTitle}
                  onChange={(e) => setEditLiveTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Google Meet Link *
                </label>
                <input
                  type="url"
                  value={editLiveMeetUrl}
                  onChange={(e) => setEditLiveMeetUrl(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              {/* Photo */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                    Session Photo / Thumbnail
                  </label>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {(editingLiveSession.imageUrl || editingLiveSession.imageStoragePath) && (
                      <button
                        type="button"
                        onClick={() => setEditLiveImageMode('keep')}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          editLiveImageMode === 'keep'
                            ? 'bg-red-600 text-white'
                            : 'text-[#647083] hover:text-red-600'
                        }`}
                      >
                        Keep Current
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditLiveImageMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editLiveImageMode === 'upload'
                          ? 'bg-red-600 text-white'
                          : 'text-[#647083] hover:text-red-600'
                      }`}
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLiveImageMode('url')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editLiveImageMode === 'url'
                          ? 'bg-red-600 text-white'
                          : 'text-[#647083] hover:text-red-600'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLiveImageMode('remove')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        editLiveImageMode === 'remove'
                          ? 'bg-red-600 text-white'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {editLiveImageMode === 'keep' && editingLiveSession.imageUrl && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#d8e1ec] bg-[#f8fafc] p-2.5 dark:border-[#34445a] dark:bg-[#192638]">
                    <img
                      src={editingLiveSession.imageUrl}
                      alt="Current photo"
                      className="size-12 rounded-lg object-cover"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#172333] dark:text-[#edf3fb]">Current Photo Active</span>
                      <p className="text-[10px] text-[#647083] dark:text-[#94a3b8]">Will be preserved</p>
                    </div>
                  </div>
                )}

                {editLiveImageMode === 'upload' && (
                  <div>
                    <input
                      ref={editLiveImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditLiveImageFile(file)
                          setEditLiveImageDataUrl(URL.createObjectURL(file))
                        }
                      }}
                    />
                    {editLiveImageDataUrl ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                        <img
                          src={editLiveImageDataUrl}
                          alt="New photo preview"
                          className="size-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            {editLiveImageFile?.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Ready to upload on save</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditLiveImageFile(null)
                            setEditLiveImageDataUrl('')
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editLiveImageInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#d8e1ec] bg-[#f8fafc] hover:border-red-400 dark:border-[#34445a] dark:bg-[#192638] cursor-pointer"
                      >
                        <Upload className="size-5 text-[#94a3b8] mb-1" />
                        <span className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">Click to select new photo</span>
                      </div>
                    )}
                  </div>
                )}

                {editLiveImageMode === 'url' && (
                  <input
                    type="url"
                    value={editLiveImageUrl}
                    onChange={(e) => setEditLiveImageUrl(e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                  />
                )}

                {editLiveImageMode === 'remove' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Session photo will be removed upon saving.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Scheduled Time / Timing
                </label>
                <input
                  type="text"
                  value={editLiveTime}
                  onChange={(e) => setEditLiveTime(e.target.value)}
                  placeholder="e.g. Saturday · 7:30 PM IST or Today 8 PM"
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#2a3b50]">
                <button
                  type="button"
                  disabled={isSavingEditLiveSession}
                  onClick={() => setEditingLiveSession(null)}
                  className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-[#d8e1ec] px-4 py-2.5 text-xs font-semibold text-[#647083] hover:bg-[#f1f5f9] dark:border-[#34445a] dark:text-[#94a3b8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditLiveSession}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingEditLiveSession ? <Upload className="size-3.5 animate-pulse" /> : <Pencil className="size-3.5" />}
                  <span>{isSavingEditLiveSession ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
