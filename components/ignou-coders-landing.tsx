'use client'

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  GraduationCap,
  HelpCircle,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  Users,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/JsS2aKiVHXhKCzJ1B5a7rB'

const faqs = [
  {
    q: 'Are the video classes and study notes completely free?',
    a: 'Yes, 100% free. All recorded classes on our YouTube channel and downloadable PDF study notes are openly accessible to all students at no cost.',
  },
  {
    q: 'I have no prior programming background. Can I still join?',
    a: 'Absolutely. We begin every topic from absolute fundamentals, assuming zero prior coding experience, and build up step-by-step.',
  },
  {
    q: 'How are the classes delivered?',
    a: 'Classes are primarily provided in recorded video format so you can learn on your own schedule. Live discussion sessions are scheduled periodically.',
  },
  {
    q: 'Where can I download the study notes?',
    a: 'Notes are shared directly inside the student portal and distributed in our WhatsApp community group as organized PDF downloads.',
  },
  {
    q: 'What happens inside the WhatsApp community group?',
    a: 'The group serves as a collaborative hub to ask programming doubts, receive lecture updates, and connect with peers and mentors.',
  },
]

function Brand() {
  return (
    <a
      href="#top"
      aria-label="IGNOU Coders home"
      className="group inline-flex items-center gap-3 transition"
    >
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-500/30 bg-[#07111d] shadow-sm shadow-sky-500/10 transition-transform group-hover:scale-105">
        <img
          src="/logo.jpg"
          alt="IGNOU Coders logo"
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black tracking-widest text-slate-900 dark:text-white">
          IGNOU <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">CODERS</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Student Community
        </span>
      </div>
    </a>
  )
}

function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm backdrop-blur transition hover:border-sky-400 hover:text-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-400 sm:size-10 cursor-pointer"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-4.5 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon aria-hidden="true" className="size-4.5 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  )
}

export function IgnouCodersLanding() {
  const [isDark, setIsDark] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('ignou-coders-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(initialDark)
    document.documentElement.classList.toggle('dark', initialDark)
  }, [])

  function toggleTheme() {
    setIsDark((current) => {
      const next = !current
      window.localStorage.setItem('ignou-coders-theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#080d1a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] rounded-full bg-gradient-to-tr from-sky-500/15 via-blue-500/10 to-indigo-500/10 blur-[130px] dark:from-sky-500/10 dark:via-blue-600/10 dark:to-purple-900/15" />
        <div className="absolute top-[50%] -right-40 w-[450px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-[120px] dark:from-sky-600/10" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#080d1a]/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Brand />

          {/* Nav links */}
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <a
              href="#about"
              className="text-sm font-semibold text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              About
            </a>
            <a
              href="#resources"
              className="text-sm font-semibold text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              Classes &amp; Notes
            </a>
            <a
              href="#mentors"
              className="text-sm font-semibold text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              Mentors
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth"
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-slate-50 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-sky-400 sm:min-h-10 sm:px-4 sm:text-sm cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="inline-flex min-h-9 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105 active:scale-95 sm:min-h-10 sm:px-4 sm:text-sm cursor-pointer"
            >
              Sign Up
            </Link>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section
          id="top"
          className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20"
        >
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-700 backdrop-blur-md dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                <Sparkles className="size-3.5 text-sky-500" />
                <span>Student Coding Community</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white leading-[1.15]">
                Learn Programming,{' '}
                <span className="block mt-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-400 dark:to-indigo-300">
                  Step-by-Step from the Basics.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                An open learning initiative built for IGNOU students. We break down core programming concepts through recorded video lessons and clear study notes, helping you learn comfortably at your own pace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:brightness-105 active:scale-95 cursor-pointer"
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  <span>Join WhatsApp Community</span>
                  <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                <Link
                  href="/auth"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-sky-400 hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-400 cursor-pointer"
                >
                  <GraduationCap className="size-4.5 text-sky-500" />
                  <span>Sign In</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" />
                  100% Free Open Access
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" />
                  Recorded Video Classes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" />
                  Downloadable PDF Notes
                </span>
              </div>
            </div>

            {/* Right Media Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl transition dark:border-slate-800 dark:bg-slate-900">
                  <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-slate-950">
                    <img
                      src="/images/hero_coding_setup_1791589155768.jpg"
                      alt="Coding study workspace"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-slate-900/80 p-2.5 backdrop-blur-md border border-white/10">
                      <div className="text-xs font-bold text-white">IGNOU Coders Study Space</div>
                      <div className="text-[11px] text-slate-300">Foundation-first practical learning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION / WHAT WE DO */}
        <section id="about" className="relative border-y border-slate-200/80 bg-white/60 py-16 backdrop-blur-sm sm:py-20 dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                <BookOpen className="size-3.5" />
                <span>Our Purpose</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Supporting Distance Learners in Tech
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                Distance learning can often feel challenging without structured classroom lectures. We provide clear, self-paced guidance so every student can build real programming confidence.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {/* Point 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
                  <Video className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  Recorded Video Classes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Carefully recorded sessions breaking down programming fundamentals, syntax, and logic so you can watch whenever time permits.
                </p>
              </div>

              {/* Point 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400">
                  <FileText className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  Concise Study Notes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Straightforward PDF notes summarizing class topics and code snippets, making review straightforward and stress-free.
                </p>
              </div>

              {/* Point 3 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
                  <Users className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  WhatsApp Peer Community
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  A welcoming group to ask programming doubts, share resources, and stay connected with fellow students and mentors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RESOURCES PREVIEW */}
        <section id="resources" className="relative py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <img
                    src="/images/study_notes_preview_1791589169425.jpg"
                    alt="Study notes example"
                    className="w-full aspect-[4/3] rounded-xl object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <FileText className="size-3.5" />
                  <span>Learning Resources</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Direct Access to Class Notes &amp; Recordings
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Every recorded session is accompanied by clear, readable PDF notes so you spend less time struggling with complex theory and more time writing practical code.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                    </span>
                    <span>Beginner-friendly conceptual explanations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                    </span>
                    <span>Clean PDF downloads for offline revision</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                    </span>
                    <span>Direct peer and mentor discussion support</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-700 active:scale-95 cursor-pointer"
                  >
                    Sign In to Access <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Join WhatsApp Community →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MENTORS & FOUNDERS */}
        <section id="mentors" className="relative border-y border-slate-200/80 bg-white/60 py-16 backdrop-blur-sm sm:py-20 dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Users className="size-3.5" />
                <span>Founders &amp; Mentors</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Who Is Behind IGNOU Coders?
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Built by passionate developers dedicated to helping distance students learn programming.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
              {/* Som Singh */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-lg font-bold text-white shadow-md">
                    SS
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Som Singh</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      Founder · Lead Instructor
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Focuses on breaking down programming concepts into simple, intuitive steps so beginners can grasp core logic without confusion.
                </p>
                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Connect in Group <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>

              {/* Sourav Maurya */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-lg font-bold text-white shadow-md">
                    SM
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sourav Maurya</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Co-Founder · Lead Developer
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Builds and maintains the student portal and organizes study materials to ensure every learner has immediate access to resources.
                </p>
                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Connect in Group <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="relative py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                <HelpCircle className="size-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Everything You Need to Know
              </h2>
            </div>

            <div className="mt-10 space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white sm:text-base cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`size-4.5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-sky-500' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CLOSING BANNER */}
        <section className="px-4 pb-16 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-[#0a1e38] to-[#071328] px-6 py-12 text-white shadow-xl sm:px-10 sm:py-14 border border-sky-500/20">
            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
                  Start Learning with Us Today
                </h2>
                <p className="mt-3 text-sm text-slate-300 sm:text-base">
                  Join our WhatsApp community group to receive direct notifications for upcoming classes, notes, and discussion sessions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="size-4.5" />
                  <span>Join WhatsApp Community</span>
                </a>

                <Link
                  href="/auth"
                  className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 cursor-pointer"
                >
                  Sign In / Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CLEAN FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-10 transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <Brand />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                An open learning initiative and peer community for IGNOU students.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a href="#about" className="hover:text-sky-600 dark:hover:text-sky-400">About</a>
              <a href="#resources" className="hover:text-sky-600 dark:hover:text-sky-400">Classes &amp; Notes</a>
              <a href="#mentors" className="hover:text-sky-600 dark:hover:text-sky-400">Mentors</a>
              <a href="#faq" className="hover:text-sky-600 dark:hover:text-sky-400">FAQ</a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                WhatsApp Group
              </a>
              <Link href="/auth" className="hover:text-sky-600 dark:hover:text-sky-400">
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-slate-900 dark:text-slate-500">
            © 2026 IGNOU Coders. Created by Som Singh &amp; Sourav Maurya. Independent student initiative, not officially affiliated with IGNOU administration.
          </div>
        </div>
      </footer>
    </div>
  )
}
