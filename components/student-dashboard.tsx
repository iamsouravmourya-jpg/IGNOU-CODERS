'use client'

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  LogOut,
  MessageCircle,
  Play,
  Video,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ClassItem } from '@/app/admin/page'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

const FALLBACK_CLASSES: ClassItem[] = [
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

interface StudentDashboardProps {
  onBackToHome: () => void
  isDark?: boolean
  toggleTheme?: () => void
}

export function StudentDashboard({
  onBackToHome,
  isDark = false,
  toggleTheme,
}: StudentDashboardProps) {
  const [classes, setClasses] = useState<ClassItem[]>(FALLBACK_CLASSES)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('ignou_coders_classes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClasses(parsed)
        }
      } catch {
        // fallback
      }
    }
  }, [])

  return (
    <div
      className={`min-h-screen bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Top Navigation */}
      <header className="border-b border-[#e1e7ef] bg-white/90 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 transition">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50]">
              <img
                src="/logo.jpg"
                alt="IGNOU Coders logo"
                className="size-full object-contain"
              />
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] dark:hover:text-[#61c5ff] sm:text-sm cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              title="Logout"
              className="inline-flex size-8 items-center justify-center rounded-full border border-[#e2e8f0] text-[#64748b] transition hover:bg-red-50 hover:text-red-600 dark:border-[#34445a] dark:text-[#94a3b8] dark:hover:bg-red-950/30 dark:hover:text-red-400 sm:size-9 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl border border-[#dce5f1] bg-gradient-to-r from-white via-[#f0f7ff] to-white p-6 shadow-sm dark:border-[#2a3b50] dark:from-[#131e2d] dark:via-[#16273c] dark:to-[#131e2d] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#087fce]/10 px-3 py-1 text-xs font-semibold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                <GraduationCap className="size-3.5" />
                Student Portal Active
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                Welcome to your Learning Hub! 🚀
              </h1>
              <p className="mt-1 text-sm text-[#5e6f84] dark:text-[#94a3b8]">
                Click on any topic box below to watch the live recorded video class and download notes.
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

        {/* Classes / Topics Grid (Boxes 1, 2, 3...) */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
            Available Classes & Notes ({classes.length})
          </h2>
          <span className="text-xs text-[#647083] dark:text-[#94a3b8]">
            Updated live from Admin Panel
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, idx) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#e1e7ef] bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#087fce] hover:shadow-xl dark:border-[#2a3b50] dark:bg-[#192638] dark:hover:border-[#61c5ff] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#087fce]/10 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                    0{idx + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Video className="size-3" />
                    Video + Notes
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#172333] transition group-hover:text-[#087fce] dark:text-[#edf3fb] dark:group-hover:text-[#61c5ff]">
                  {cls.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#647083] dark:text-[#94a3b8]">
                  {cls.notes}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f9] pt-4 dark:border-[#2a3b50]">
                <span className="text-[11px] text-[#647083] dark:text-[#94a3b8]">
                  Added: {cls.dateAdded}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#087fce] dark:text-[#61c5ff]">
                  <span>Watch & Read</span>
                  <Play className="size-3 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Expanded Class Modal / Video & Notes Viewer */}
      {selectedClass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="relative my-8 w-full max-w-4xl rounded-3xl border border-[#dce5f1] bg-white p-6 shadow-2xl dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              aria-label="Close viewer"
              className="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#647083] transition hover:bg-[#e2e8f0] hover:text-[#172333] dark:bg-[#1e293b] dark:text-[#94a3b8] dark:hover:bg-[#334155] dark:hover:text-[#edf3fb] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Title Header */}
            <div className="mb-6 pr-10">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#087fce]/10 px-3 py-1 text-xs font-semibold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                <Video className="size-3.5" />
                Classroom Session & Notes
              </span>
              <h2 className="text-xl font-bold text-[#172333] dark:text-[#edf3fb] sm:text-2xl">
                {selectedClass.title}
              </h2>
            </div>

            {/* YouTube Embedded Video Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <iframe
                src={selectedClass.youtubeUrl}
                title={selectedClass.title}
                className="size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Scrollable Notes & PDF Download Section */}
            <div className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e1e7ef] pb-4 dark:border-[#2a3b50]">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                      Class Study Notes & PDF
                    </h3>
                    <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                      Scroll down to read summary and download PDF
                    </p>
                  </div>
                </div>

                <a
                  href={selectedClass.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#087fce] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0665aa] cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>Download PDF Notes</span>
                </a>
              </div>

              {/* Scrollable Notes Content Box */}
              <div className="mt-5 max-h-60 overflow-y-auto rounded-2xl border border-[#e1e7ef] bg-[#f8fafc] p-5 text-sm leading-relaxed text-[#475569] dark:border-[#2a3b50] dark:bg-[#192638] dark:text-[#cbd5e1]">
                <p className="whitespace-pre-line">{selectedClass.notes}</p>
                <div className="mt-4 border-t border-[#e1e7ef] pt-4 dark:border-[#2a3b50] text-xs text-[#647083] dark:text-[#94a3b8]">
                  <p>💡 Tip: You can ask questions and discuss this topic in the WhatsApp group with fellow IGNOU learners and mentors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
