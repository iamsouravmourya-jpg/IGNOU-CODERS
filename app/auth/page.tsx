'use client'

import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup'

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('ignou.student2026@gmail.com')
  const [password, setPassword] = useState('ignou@2026')
  const [course, setCourse] = useState('BCA - Semester 3')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(window.localStorage.getItem('ignou-coders-theme') === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function toggleTheme() {
    setIsDark((curr) => {
      const next = !curr
      window.localStorage.setItem('ignou-coders-theme', next ? 'dark' : 'light')
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Directly navigate to dashboard URL
    router.push('/dashboard')
  }

  return (
    <div
      className={`site-shell flex min-h-screen flex-col bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'theme-dark dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      {/* Top Header */}
      <header className="border-b border-[#e1e7ef] bg-white/80 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 transition"
          >
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50]">
              <img
                src="/logo.jpg"
                alt="IGNOU Coders logo"
                className="size-full object-contain"
              />
            </span>
            <span className="brand-name text-sm font-bold tracking-[0.1em] text-[#172333] dark:text-[#edf3fb]">
              IGNOU CODERS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] dark:hover:text-[#61c5ff] sm:text-sm"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex size-9 items-center justify-center rounded-full border border-[#d8e1ec] bg-white text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Auth Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-xl dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-8">
          {/* Card Header */}
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#087fce]/10 text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#172333] dark:text-[#edf3fb]">
                {mode === 'signup' ? 'Student Sign Up' : 'Student Sign In'}
              </h1>
              <p className="text-xs text-[#647083] dark:text-[#94a3b8]">
                URL: <code className="font-mono text-[#087fce] dark:text-[#61c5ff]">/auth</code> · Student Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-5 flex rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-1 dark:border-[#2a3b50] dark:bg-[#17263a]">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'signup'
                  ? 'bg-white text-[#087fce] shadow-xs dark:bg-[#1e2f47] dark:text-[#61c5ff]'
                  : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8] dark:hover:text-[#edf3fb]'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'signin'
                  ? 'bg-white text-[#087fce] shadow-xs dark:bg-[#1e2f47] dark:text-[#61c5ff]'
                  : 'text-[#647083] hover:text-[#172333] dark:text-[#94a3b8] dark:hover:text-[#edf3fb]'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Auto-filled Demo Info Notice */}
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-[#eef7ff] p-3 text-xs text-[#185d91] dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-[#93c5fd]">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#087fce] dark:text-[#61c5ff]" />
            <span>
              <strong>Demo credentials pre-filled!</strong> Ek click me direct{' '}
              <code className="font-mono font-semibold">/dashboard</code> par pahunchne ke liye niche button dabayein.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                IGNOU Enrollment / Email ID
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#647083] dark:text-[#94a3b8]">
                  <Mail className="size-4" />
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] py-2.5 pl-9 pr-3 text-sm font-medium text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#647083] dark:text-[#94a3b8]">
                  <Lock className="size-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] py-2.5 pl-9 pr-3 text-sm font-medium text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#314255] dark:text-[#cbd5e1]">
                  Current Program / Batch
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3.5 py-2.5 text-sm font-medium text-[#172333] transition focus:border-[#087fce] focus:bg-white focus:outline-none dark:border-[#34445a] dark:bg-[#192638] dark:text-[#edf3fb]"
                />
              </div>
            )}

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087fce] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0665aa] active:scale-[0.99] cursor-pointer"
            >
              <span>Enter Dashboard ({mode === 'signup' ? 'Sign Up' : 'Sign In'})</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Direct Dashboard Link */}
          <div className="mt-5 border-t border-[#f0f4f9] pt-4 text-center dark:border-[#2a3b50]">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#087fce] hover:underline dark:text-[#61c5ff]"
            >
              Skip directly to /dashboard →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-[#172333]">
          <p className="text-sm font-medium">Loading auth page...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
