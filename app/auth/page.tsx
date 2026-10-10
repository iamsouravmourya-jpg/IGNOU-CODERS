'use client'

import { ArrowLeft, CheckCircle2, FileText, GraduationCap, Moon, Sparkles, Sun, Video } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.1 7.14-10.14 7.14-17.56Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 -4)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.27-8.28 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
    </svg>
  )
}

function AuthForm() {
  const searchParams = useSearchParams()
  const [isDark, setIsDark] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('ignou-coders-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(initialDark)
    document.documentElement.classList.toggle('dark', initialDark)
  }, [])

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'configuration') {
      setErrorMessage(
        'Google sign-in is not configured yet. Check the Supabase URL and anon/publishable key in Vercel.',
      )
    } else if (error === 'oauth') {
      setErrorMessage('Google sign-in could not be completed. Please try again.')
    } else if (error === 'access_denied') {
      setErrorMessage('Google sign-in was cancelled.')
    }
  }, [searchParams])

  function toggleTheme() {
    setIsDark((curr) => {
      const next = !curr
      window.localStorage.setItem('ignou-coders-theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid email',
          queryParams: { prompt: 'select_account' },
        },
      })

      if (error) throw error
    } catch {
      setErrorMessage(
        'Could not start Google sign-in. Check the Supabase URL and anon/publishable key in Vercel, then try again.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'dark bg-[#080d1a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* Left Branding / Value Proposition Column */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1e38] to-[#071328] p-10 text-white lg:col-span-6 lg:flex xl:col-span-7 xl:p-14 border-r border-sky-500/15">
          {/* Ambient decorative glow */}
          <div className="absolute -top-32 -left-32 size-96 rounded-full bg-sky-500/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-sky-500/30 bg-[#07111d] shadow-sm transition group-hover:scale-105">
                <img src="/logo.jpg" alt="IGNOU Coders logo" className="size-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-white">
                  IGNOU <span className="text-sky-400">CODERS</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Student Login
                </span>
              </div>
            </Link>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-auto max-w-lg py-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3.5 py-1 text-xs font-bold text-sky-300">
              <Sparkles className="size-3.5 text-sky-400" />
              <span>Direct Google Access</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white xl:text-4xl leading-tight">
              Learn at Your Own Pace,{' '}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                One Step at a Time.
              </span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 xl:text-base">
              Access your recorded video lessons, concise study PDF notes, and student resources all in one place. No passwords or registration forms—simply connect with your Google account.
            </p>

            {/* Feature Bullets */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Video className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recorded Video Classes</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Rewatch lessons anytime to reinforce core programming logic.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Concise Study Notes</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Direct PDF summaries tailored for straightforward review.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Single-Click Google Login</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Secure, frictionless access with zero password fatigue.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note on left */}
          <div className="relative z-10 text-xs text-slate-400">
            © 2026 IGNOU Coders. Created by Som Singh &amp; Sourav Maurya.
          </div>
        </div>

        {/* Right Sign-in Card Column */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-5">
          {/* Top header navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-sky-400"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
            </button>
          </div>

          {/* Center Card */}
          <div className="mx-auto my-auto w-full max-w-sm py-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              {/* Header */}
              <div className="mb-7 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
                  <GraduationCap className="size-6" />
                </span>
                <div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">
                    Student Sign In
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Continue with your Google account
                  </p>
                </div>
              </div>

              {/* Error Box if needed */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  {errorMessage}
                </div>
              )}

              {/* 1-Click Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-800"
              >
                <GoogleIcon />
                <span>{isSubmitting ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="mt-5 rounded-xl bg-slate-50 p-3.5 text-center text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                Direct single-click authentication. We only use your Google name and email to identify your student account.
              </div>
            </div>
          </div>

          {/* Bottom helper */}
          <div className="text-center text-xs text-slate-400 dark:text-slate-500">
            Questions? Connect with us in our WhatsApp community group.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-white">
          <p className="text-sm font-medium">Loading sign-in...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
