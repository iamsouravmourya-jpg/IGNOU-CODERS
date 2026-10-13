'use client'

import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  FolderGit2,
  GraduationCap,
  LogOut,
  MessageCircle,
  Moon,
  Pencil,
  Play,
  Radio,
  Search,
  Sun,
  Trash2,
  UploadCloud,
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
import {
  type ProjectSubmission,
  convertCodeToHtml,
  formatTimeRemaining,
  readProjectsLocally,
  saveProjectsLocally,
} from '@/lib/projects'
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
  const [activeTab, setActiveTab] = useState<'recorded' | 'live' | 'projects'>('recorded')
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([])
  const [storageError, setStorageError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingLive, setIsLoadingLive] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Project submissions states
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [submissionMode, setSubmissionMode] = useState<'file' | 'code'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [rawCode, setRawCode] = useState('')
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [projectSuccess, setProjectSuccess] = useState('')
  const [projectError, setProjectError] = useState('')
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview & Edit states for student projects
  const [previewProject, setPreviewProject] = useState<ProjectSubmission | null>(null)
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview')
  const [copiedCode, setCopiedCode] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectSubmission | null>(null)
  const [editStudentName, setEditStudentName] = useState('')
  const [editProjectTitle, setEditProjectTitle] = useState('')
  const [editRawCode, setEditRawCode] = useState('')
  const [isSavingEditProject, setIsSavingEditProject] = useState(false)
  const [editProjectError, setEditProjectError] = useState('')

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
          if (Array.isArray(result)) {
            const clean = result.filter(
              (item) => item.id !== 'live-1' && !item.title?.includes('MCS-011: Live Logic Building'),
            )
            setLiveSessions(clean)
            saveLiveSessionsLocally(clean)
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

  // Pre-fill student name from profile if available
  useEffect(() => {
    if (profile?.name && !studentName) {
      setStudentName(profile.name)
    }
  }, [profile?.name, studentName])

  // Load project submissions
  useEffect(() => {
    const controller = new AbortController()

    async function loadProjects() {
      try {
        const response = await fetch('/api/projects', {
          signal: controller.signal,
        })
        if (response.ok) {
          const result = (await response.json()) as ProjectSubmission[]
          if (Array.isArray(result)) {
            setProjects(result)
            saveProjectsLocally(result)
            return
          }
        }
      } catch {
        // Fallback
      } finally {
        if (!controller.signal.aborted) setIsLoadingProjects(false)
      }

      const local = readProjectsLocally()
      setProjects(local)
    }

    loadProjects()
    return () => controller.abort()
  }, [])

  function handleProjectFileChosen(file: File) {
    setSelectedFile(file)
    setProjectError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = (e.target?.result as string) || ''
      setFileContent(text)
    }
    reader.readAsText(file)
  }

  async function handleSubmitProject(e: React.FormEvent) {
    e.preventDefault()
    setProjectError('')
    setProjectSuccess('')

    if (!studentName.trim()) {
      setProjectError('Please enter your name.')
      return
    }

    if (submissionMode === 'code' && !rawCode.trim()) {
      setProjectError('Please paste your code lines in the box.')
      return
    }

    if (submissionMode === 'file' && !selectedFile && !fileContent) {
      setProjectError('Please select or drop a file.')
      return
    }

    setIsSubmittingProject(true)
    try {
      let finalFileName = selectedFile?.name || 'project.html'
      let finalContent = fileContent

      if (submissionMode === 'code' || rawCode.trim()) {
        const converted = convertCodeToHtml(rawCode, studentName)
        finalFileName = converted.fileName
        finalContent = converted.htmlContent
      }

      const payload = {
        studentName: studentName.trim(),
        title: projectTitle.trim() || 'HTML Practical Assignment',
        submissionType: submissionMode,
        fileName: finalFileName,
        fileContent: finalContent,
        rawCode: submissionMode === 'code' ? rawCode : '',
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok && data.error) {
        throw new Error(data.error)
      }

      const newProject: ProjectSubmission = {
        id: data.id || `proj_${Date.now()}`,
        studentName: studentName.trim(),
        title: projectTitle.trim() || 'HTML Practical Assignment',
        submissionType: submissionMode,
        fileName: finalFileName,
        fileContent: finalContent,
        createdAt: data.createdAt || new Date().toISOString(),
        expiresAt:
          data.expiresAt ||
          new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }

      const updated = [newProject, ...projects.filter((p) => p.id !== newProject.id)]
      setProjects(updated)
      saveProjectsLocally(updated)

      setProjectSuccess('Project submitted successfully! It is active for 48 hours for teacher review.')
      setRawCode('')
      setSelectedFile(null)
      setFileContent('')
      setProjectTitle('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setProjectError(
        err instanceof Error ? err.message : 'Could not submit project. Please try again.',
      )
    } finally {
      setIsSubmittingProject(false)
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project submission?')) return

    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    } catch {
      // Local fallback
    }

    const updated = projects.filter((p) => p.id !== id)
    setProjects(updated)
    saveProjectsLocally(updated)
  }

  function handleStartEditProject(project: ProjectSubmission) {
    setEditingProject(project)
    setEditStudentName(project.studentName)
    setEditProjectTitle(project.title)
    setEditRawCode(project.fileContent || '')
    setEditProjectError('')
  }

  async function handleSaveEditProject(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProject) return
    if (!editStudentName.trim()) {
      setEditProjectError('Student name is required.')
      return
    }

    setIsSavingEditProject(true)
    setEditProjectError('')

    try {
      const converted = convertCodeToHtml(editRawCode, editStudentName)
      const payload = {
        id: editingProject.id,
        studentName: editStudentName.trim(),
        title: editProjectTitle.trim() || 'HTML Practical Assignment',
        fileName: converted.fileName,
        fileContent: converted.htmlContent,
        rawCode: editRawCode,
      }

      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to update submission.')
      }

      const updated = projects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              studentName: editStudentName.trim(),
              title: editProjectTitle.trim() || 'HTML Practical Assignment',
              fileName: converted.fileName,
              fileContent: converted.htmlContent,
            }
          : p,
      )
      setProjects(updated)
      saveProjectsLocally(updated)
      setEditingProject(null)
    } catch (err) {
      setEditProjectError(err instanceof Error ? err.message : 'Could not update project.')
    } finally {
      setIsSavingEditProject(false)
    }
  }

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50] transition group-hover:scale-105">
              <img src="/logo.jpg" alt="IGNOU Coders logo" className="size-full object-contain" />
            </span>
            <div className="min-w-0">
              <span className="block text-xs sm:text-sm font-bold tracking-wider text-[#172333] dark:text-[#edf3fb] truncate">
                IGNOU CODERS
              </span>
              <span className="block text-[10px] sm:text-xs text-[#647083] dark:text-[#94a3b8] truncate">
                Student Dashboard
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 rounded-2xl border border-[#dce5f1] bg-white p-4 shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] z-50 animate-in fade-in zoom-in-95 duration-150">
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
      <main className="mx-auto max-w-7xl px-3.5 py-4 sm:px-8 sm:py-8">
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

                {/* 3. Project Submission */}
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition cursor-pointer ${
                    activeTab === 'projects'
                      ? 'bg-[#087fce] text-white shadow-md shadow-[#087fce]/20'
                      : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#172333] dark:text-[#cbd5e1] dark:hover:bg-[#192638] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="size-4 shrink-0 text-emerald-500" />
                    <span>Project Submit</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      activeTab === 'projects'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}
                  >
                    {projects.length}
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
            {/* Mobile Tab Navigation (3 tabs) */}
            <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl border border-[#dce5f1] bg-white p-1.5 shadow-xs dark:border-[#2a3b50] dark:bg-[#131e2d] lg:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('recorded')}
                className={`min-w-0 flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition cursor-pointer ${
                  activeTab === 'recorded'
                    ? 'bg-[#087fce] text-white shadow-xs'
                    : 'text-[#647083] dark:text-[#94a3b8]'
                }`}
              >
                <Video className="size-3.5 shrink-0" />
                <span className="truncate">Recorded</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('live')
                  setHasUnread(false)
                }}
                className={`min-w-0 flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-[#087fce] text-white shadow-xs'
                    : 'text-[#647083] dark:text-[#94a3b8]'
                }`}
              >
                <Radio className="size-3.5 shrink-0 text-red-500 animate-pulse" />
                <span className="truncate">Live</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`min-w-0 flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-[#087fce] text-white shadow-xs'
                    : 'text-[#647083] dark:text-[#94a3b8]'
                }`}
              >
                <Code2 className="size-3.5 shrink-0 text-emerald-500" />
                <span className="truncate">Projects</span>
              </button>
            </div>

            {/* TAB 1: RECORDED SESSIONS */}
            {activeTab === 'recorded' && (
              <>
                {/* Hero Card */}
                <div className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#dce5f1] bg-gradient-to-br from-white via-[#eff7ff] to-[#e4f2ff] p-4.5 sm:p-7 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#172c43]">
                  <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-[#70c6ff]/15 blur-3xl" />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                      <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#087fce]/10 bg-white/80 px-3 py-1 text-xs font-semibold text-[#087fce] shadow-xs dark:border-[#61c5ff]/20 dark:bg-[#0d1b2b]/70 dark:text-[#61c5ff]">
                        <Video className="size-3.5" />
                        <span>Recorded Video Lectures & Notes</span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                        {profile?.name
                          ? `Welcome back, ${profile.name}! 👋`
                          : 'Recorded Sessions & Notes'}
                      </h1>
                      <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                        Select any recorded topic to watch the class video on YouTube and download PDF notes.
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087fce] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#087fce]/20 transition hover:bg-[#0665aa] sm:px-5 sm:py-3 sm:text-sm cursor-pointer w-full sm:w-auto"
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
                <div className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#dce5f1] bg-gradient-to-br from-white via-[#fff1f2] to-[#ffe4e6] p-4.5 sm:p-7 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#26161c] dark:to-[#311720]">
                  <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-rose-500/10 blur-3xl" />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                      <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-white/90 px-3 py-1 text-xs font-bold text-red-600 shadow-xs dark:bg-[#1f131a] dark:text-red-400">
                        <span className="size-2 rounded-full bg-red-500 animate-ping" />
                        <span>Google Meet Live Sessions</span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                        Interactive Live Classes
                      </h1>
                      <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                        Join real-time doubt clearing sessions, project reviews, and logic building classes directly via Google Meet.
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#25D366]/20 transition hover:bg-[#1ea952] sm:px-5 sm:py-3 sm:text-sm cursor-pointer w-full sm:w-auto"
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

            {/* TAB 3: PROJECT SUBMISSIONS */}
            {activeTab === 'projects' && (
              <>
                {/* Projects Hero Card */}
                <div className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-white via-[#f0fdf4] to-[#dcfce7] p-4.5 sm:p-7 shadow-sm dark:border-emerald-900/40 dark:from-[#0f1d1a] dark:via-[#132722] dark:to-[#16332c]">
                  <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                      <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs dark:bg-[#122822] dark:text-emerald-400">
                        <Code2 className="size-3.5" />
                        <span>Practical Assignments & Code Check</span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                        Submit Practical Projects
                      </h1>
                      <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5e6f84] dark:text-[#94a3b8]">
                        Drop your HTML file or paste raw code lines. Submissions are saved securely to Supabase and automatically expire after 48 hours (2 days).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Clock className="size-3.5" />
                        <span>48h Auto-Expiry</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Submission Form (5 cols on lg) */}
                  <div className="rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-sm dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6 lg:col-span-5 self-start">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                        Project Submission Form
                      </h2>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        HTML Practice
                      </span>
                    </div>
                    <p className="text-xs text-[#647083] dark:text-[#94a3b8] mb-4">
                      Submit your file or code lines. Date & time are saved automatically.
                    </p>

                    {projectSuccess && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{projectSuccess}</span>
                      </div>
                    )}

                    {projectError && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{projectError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitProject} className="space-y-4">
                      {/* Student Name */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          required
                          className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                        />
                      </div>

                      {/* Project / Topic Title */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                          Project Title / Assignment
                        </label>
                        <input
                          type="text"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="e.g. Practical 1: HTML Personal Portfolio"
                          className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                        />
                      </div>

                      {/* Date & Time info */}
                      <div className="flex items-center gap-2 rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-2.5 text-[11px] text-[#647083] dark:border-[#2a3b50] dark:bg-[#192638]/60 dark:text-[#94a3b8]">
                        <Clock className="size-3.5 shrink-0 text-[#087fce]" />
                        <span>Submission Time: Recorded automatically on submit</span>
                      </div>

                      {/* Mode Selector */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                            Submission Method *
                          </label>
                          <div className="inline-flex rounded-lg border border-[#d8e1ec] bg-[#f1f5f9] p-0.5 text-[11px] font-semibold dark:border-[#34445a] dark:bg-[#192638]">
                            <button
                              type="button"
                              onClick={() => setSubmissionMode('file')}
                              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                                submissionMode === 'file'
                                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-[#0d1421] dark:text-emerald-400'
                                  : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8]'
                              }`}
                            >
                              Drop / Select File
                            </button>
                            <button
                              type="button"
                              onClick={() => setSubmissionMode('code')}
                              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                                submissionMode === 'code'
                                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-[#0d1421] dark:text-emerald-400'
                                  : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8]'
                              }`}
                            >
                              Paste Code Lines
                            </button>
                          </div>
                        </div>

                        {submissionMode === 'file' ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDraggingFile(true)
                            }}
                            onDragLeave={() => setIsDraggingFile(false)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setIsDraggingFile(false)
                              const file = e.dataTransfer.files[0]
                              if (file) handleProjectFileChosen(file)
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                              isDraggingFile
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : selectedFile
                                  ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                                  : 'border-[#d8e1ec] bg-[#f8fafc] hover:border-emerald-400 hover:bg-[#f0fdf4] dark:border-[#34445a] dark:bg-[#192638] dark:hover:border-emerald-500'
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".html,.htm,.txt,.css,.js"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleProjectFileChosen(file)
                              }}
                              className="hidden"
                            />
                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                              <UploadCloud className="size-5.5" />
                            </div>
                            <p className="mt-2.5 text-xs font-semibold text-[#172333] dark:text-[#edf3fb]">
                              {selectedFile ? selectedFile.name : 'Drag & drop file here or click to browse'}
                            </p>
                            <p className="mt-1 text-[11px] text-[#647083] dark:text-[#94a3b8]">
                              {selectedFile
                                ? `${(selectedFile.size / 1024).toFixed(1)} KB — Click to change`
                                : 'Supports .html, .htm, .txt, or web files'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <textarea
                              rows={7}
                              value={rawCode}
                              onChange={(e) => setRawCode(e.target.value)}
                              placeholder={`<!-- Paste your HTML code lines here -->\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello IGNOU Coders!</h1>\n</body>\n</html>`}
                              className="w-full font-mono text-xs rounded-xl border border-[#d8e1ec] bg-[#f8fafc] p-3 text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                            />
                            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <span>⚡ Auto HTML file conversion: We will save your code as a valid .html file automatically.</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expiry Reminder */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                        <span className="font-bold">⏱️ 2-Day Auto-Expiry:</span> Submissions automatically expire and are removed from Supabase and your dashboard after 48 hours.
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingProject}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 cursor-pointer"
                      >
                        <Code2 className="size-4" />
                        <span>{isSubmittingProject ? 'Submitting to Supabase...' : 'Submit Project'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Submissions List (7 cols on lg) */}
                  <div className="lg:col-span-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                          Submitted Projects
                        </h2>
                        <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                          Your recent submissions (active for 48 hours for review)
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {projects.length} Active
                      </span>
                    </div>

                    {isLoadingProjects ? (
                      <div className="rounded-2xl border border-[#dce5f1] bg-white p-8 text-center text-xs text-[#647083] dark:border-[#2a3b50] dark:bg-[#131e2d] dark:text-[#94a3b8]">
                        Loading submitted projects...
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#dce5f1] bg-white p-8 text-center dark:border-[#2a3b50] dark:bg-[#131e2d]">
                        <Code2 className="mx-auto size-10 text-[#94a3b8]" />
                        <h3 className="mt-3 text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                          No projects submitted yet
                        </h3>
                        <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                          Use the form on the left to submit your practical HTML code or file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.map((proj) => {
                          const timeInfo = formatTimeRemaining(proj.expiresAt)
                          const submittedDate = new Date(proj.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })

                          return (
                            <div
                              key={proj.id}
                              className="rounded-2xl border border-[#e1e7ef] bg-white p-4 transition hover:border-[#b7d8f4] dark:border-[#2a3b50] dark:bg-[#131e2d] shadow-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                                      {proj.studentName}
                                    </span>
                                    <span className="rounded-full bg-[#087fce]/10 px-2 py-0.5 text-[10px] font-bold text-[#087fce] dark:bg-[#61c5ff]/20 dark:text-[#61c5ff]">
                                      {proj.fileName}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                      <Clock className="size-3" />
                                      {timeInfo.formatted}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs font-medium text-[#475569] dark:text-[#cbd5e1] truncate">
                                    {proj.title}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#647083] dark:text-[#94a3b8]">
                                    <span>Submitted: {submittedDate}</span>
                                    <span>•</span>
                                    <span className="capitalize">{proj.submissionType === 'code' ? 'Code lines converted' : 'Uploaded file'}</span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Preview Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewProject(proj)
                                      setPreviewTab('preview')
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#087fce]/30 bg-[#087fce]/10 px-2.5 py-1.5 text-xs font-semibold text-[#087fce] hover:bg-[#087fce]/20 transition cursor-pointer dark:text-[#61c5ff]"
                                    title="Live HTML Preview"
                                  >
                                    <Eye className="size-3.5" />
                                    <span>Preview</span>
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditProject(proj)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#d8e1ec] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#314255] hover:border-[#8fb5e5] hover:text-[#087fce] transition cursor-pointer dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]"
                                    title="Edit Submission"
                                  >
                                    <Pencil className="size-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProject(proj.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                                    title="Delete Submission"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* LIVE HTML PREVIEW MODAL */}
            {previewProject && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setPreviewProject(null)
                }}
              >
                <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[#dce5f1] bg-white shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] overflow-hidden">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3 sm:px-6 dark:border-[#2a3b50]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <Eye className="size-4" />
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#172333] dark:text-[#edf3fb] truncate">
                          {previewProject.studentName}&apos;s Project
                        </h3>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          {previewProject.fileName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#647083] dark:text-[#94a3b8] mt-0.5">
                        {previewProject.title} • {formatTimeRemaining(previewProject.expiresAt).formatted}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Tabs switch */}
                      <div className="inline-flex rounded-lg border border-[#d8e1ec] bg-[#f1f5f9] p-0.5 text-xs font-semibold dark:border-[#34445a] dark:bg-[#192638]">
                        <button
                          type="button"
                          onClick={() => setPreviewTab('preview')}
                          className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                            previewTab === 'preview'
                              ? 'bg-white text-emerald-700 shadow-xs dark:bg-[#0d1421] dark:text-emerald-400'
                              : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8]'
                          }`}
                        >
                          Live Webpage
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('code')}
                          className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                            previewTab === 'code'
                              ? 'bg-white text-emerald-700 shadow-xs dark:bg-[#0d1421] dark:text-emerald-400'
                              : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8]'
                          }`}
                        >
                          Source Code
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewProject(null)}
                        className="rounded-full p-1.5 text-[#647083] hover:bg-[#f1f5f9] dark:text-[#94a3b8] dark:hover:bg-[#192638] cursor-pointer"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#f8fafc] dark:bg-[#0d1421]">
                    {previewTab === 'preview' ? (
                      <div className="h-[500px] w-full overflow-hidden rounded-xl border border-[#dce5f1] bg-white shadow-inner dark:border-[#2a3b50]">
                        <iframe
                          title="HTML Project Preview"
                          srcDoc={
                            previewProject.fileContent ||
                            `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;"><h3>No preview content</h3></body></html>`
                          }
                          sandbox="allow-scripts"
                          className="size-full border-0 bg-white"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <pre className="max-h-[500px] overflow-auto rounded-xl border border-[#dce5f1] bg-[#1e293b] p-4 text-xs font-mono text-emerald-400 shadow-inner">
                          {previewProject.fileContent || '<!-- No code content -->'}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between border-t border-[#e2e8f0] px-4 py-3 sm:px-6 dark:border-[#2a3b50] bg-white dark:bg-[#131e2d]">
                    <span className="text-[11px] text-[#647083] dark:text-[#94a3b8]">
                      Expires automatically after 48 hours
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (previewProject.fileContent) {
                            navigator.clipboard.writeText(previewProject.fileContent)
                            setCopiedCode(true)
                            setTimeout(() => setCopiedCode(false), 2000)
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e1ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#314255] hover:bg-[#f8fafc] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] cursor-pointer"
                      >
                        {copiedCode ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>

                      {previewProject.fileContent && (
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([previewProject.fileContent || ''], {
                              type: 'text/html;charset=utf-8',
                            })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = previewProject.fileName || 'project.html'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer shadow-xs"
                        >
                          <Download className="size-3.5" />
                          <span>Download .html</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT PROJECT MODAL */}
            {editingProject && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setEditingProject(null)
                }}
              >
                <div className="relative w-full max-w-xl rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-6">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 dark:border-[#2a3b50]">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <Pencil className="size-4" />
                      </span>
                      <h3 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                        Edit Project Submission
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="rounded-full p-1 text-[#647083] hover:bg-[#f1f5f9] dark:text-[#94a3b8] dark:hover:bg-[#192638] cursor-pointer"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {editProjectError && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{editProjectError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveEditProject} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        value={editStudentName}
                        onChange={(e) => setEditStudentName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                        Project Title / Assignment
                      </label>
                      <input
                        type="text"
                        value={editProjectTitle}
                        onChange={(e) => setEditProjectTitle(e.target.value)}
                        className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                        HTML Code Lines
                      </label>
                      <textarea
                        rows={7}
                        value={editRawCode}
                        onChange={(e) => setEditRawCode(e.target.value)}
                        className="w-full font-mono text-xs rounded-xl border border-[#d8e1ec] bg-[#f8fafc] p-3 text-[#172333] transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#2a3b50]">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        disabled={isSavingEditProject}
                        className="rounded-xl border border-[#d8e1ec] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEditProject}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingEditProject ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
