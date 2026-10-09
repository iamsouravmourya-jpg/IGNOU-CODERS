'use client'

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  LogOut,
  MessageCircle,
  Video,
} from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

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
  return (
    <div
      className={`min-h-screen bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Top Navigation */}
      <header className="border-b border-[#e1e7ef] bg-white/80 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
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
                Student Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] dark:hover:text-[#61c5ff] sm:text-sm"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              title="Logout"
              className="inline-flex size-8 items-center justify-center rounded-full border border-[#e2e8f0] text-[#64748b] transition hover:bg-red-50 hover:text-red-600 dark:border-[#34445a] dark:text-[#94a3b8] dark:hover:bg-red-950/30 dark:hover:text-red-400 sm:size-9"
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
                Logged in successfully
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172333] dark:text-[#edf3fb] sm:text-3xl">
                Welcome back, Sourav Kumar! 👋
              </h1>
              <p className="mt-1 text-sm text-[#5e6f84] dark:text-[#94a3b8]">
                IGNOU BCA · Enrollment No: <span className="font-semibold text-[#172333] dark:text-[#edf3fb]">2350891240</span> · Semester 3
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

        {/* 4 Simple Stats / Details Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-[#2a3b50] dark:bg-[#192638]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#647083] dark:text-[#94a3b8]">
                Enrolled Program
              </span>
              <span className="rounded-lg bg-blue-50 p-2 text-[#087fce] dark:bg-blue-950/40 dark:text-[#61c5ff]">
                <GraduationCap className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
              BCA (IGNOU)
            </p>
            <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
              Batch 2024-2027 · Sem 3
            </p>
          </div>

          <div className="rounded-xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-[#2a3b50] dark:bg-[#192638]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#647083] dark:text-[#94a3b8]">
                Recorded Lessons
              </span>
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Video className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
              18 Videos Available
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              12 Watched · 6 Pending
            </p>
          </div>

          <div className="rounded-xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-[#2a3b50] dark:bg-[#192638]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#647083] dark:text-[#94a3b8]">
                Study Notes & PDF
              </span>
              <span className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <FileText className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
              14 Handcrafted Notes
            </p>
            <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
              C, Python, DSA, Discrete Math
            </p>
          </div>

          <div className="rounded-xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-[#2a3b50] dark:bg-[#192638]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#647083] dark:text-[#94a3b8]">
                Lab & Coding Practice
              </span>
              <span className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <Code2 className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#172333] dark:text-[#edf3fb]">
              MCS-011 & 012
            </p>
            <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
              Lab Assignments Ready
            </p>
          </div>
        </div>

        {/* Subjects & Quick Links */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Active Subjects */}
          <div className="rounded-2xl border border-[#e1e7ef] bg-white p-6 dark:border-[#2a3b50] dark:bg-[#192638] lg:col-span-2">
            <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
              Current Semester Courses
            </h2>
            <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
              Your active subjects for this academic cycle
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  code: 'MCS-011',
                  name: 'Problem Solving and Programming (C & Logic)',
                  status: 'In Progress (80%)',
                },
                {
                  code: 'MCS-012',
                  name: 'Computer Organization and Assembly Language',
                  status: 'In Progress (60%)',
                },
                {
                  code: 'MCS-013',
                  name: 'Discrete Mathematics',
                  status: 'Notes Available',
                },
                {
                  code: 'MCS-014',
                  name: 'Systems Analysis and Design',
                  status: 'Assignment Downloaded',
                },
              ].map((subject) => (
                <div
                  key={subject.code}
                  className="flex flex-col gap-2 rounded-xl border border-[#f0f4f9] bg-[#f9fafc] p-3.5 dark:border-[#2a3b50] dark:bg-[#131e2d] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-[#087fce]/10 px-2 py-1 text-xs font-bold text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
                      {subject.code}
                    </span>
                    <span className="text-sm font-medium text-[#172333] dark:text-[#edf3fb]">
                      {subject.name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    {subject.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help & Next Live Class */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e1e7ef] bg-white p-6 dark:border-[#2a3b50] dark:bg-[#192638]">
            <div>
              <h2 className="text-base font-bold text-[#172333] dark:text-[#edf3fb]">
                Next Live Session
              </h2>
              <p className="mt-0.5 text-xs text-[#647083] dark:text-[#94a3b8]">
                Guided live class & doubt solving
              </p>

              <div className="mt-5 rounded-xl border border-blue-100 bg-[#f0f7ff] p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <span className="text-xs font-semibold text-[#087fce] dark:text-[#61c5ff]">
                  Saturday · 7:30 PM
                </span>
                <p className="mt-1 text-sm font-bold text-[#172333] dark:text-[#edf3fb]">
                  MCS-011: Pointers & Memory in C
                </p>
                <p className="mt-1 text-xs text-[#647083] dark:text-[#94a3b8]">
                  Mentors: Som Singh & Sourav Maurya
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs text-[#647083] dark:text-[#94a3b8]">
                <p>• Need assignment solutions? Ask in the community group.</p>
                <p>• Practical exams guidance available every weekend.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToHome}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8e1ec] bg-white py-2.5 text-xs font-semibold text-[#314255] transition hover:bg-[#f6f8fb] dark:border-[#34445a] dark:bg-[#131e2d] dark:text-[#cbd5e1] dark:hover:bg-[#17263a]"
            >
              <ArrowLeft className="size-3.5" />
              Return to Website
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
