'use client'

import { ArrowLeft, GraduationCap, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
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
    setIsDark(window.localStorage.getItem('ignou-coders-theme') === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

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
      className={`flex min-h-screen flex-col bg-[#f6f8fb] text-[#172333] transition-colors duration-200 ${
        isDark ? 'dark bg-[#0d1421] text-[#edf3fb]' : ''
      }`}
    >
      <header className="border-b border-[#e1e7ef] bg-white/80 backdrop-blur-md dark:border-[#2a3b50] dark:bg-[#131e2d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
          <Link href="/" className="group inline-flex items-center gap-3 transition">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce5f1] bg-[#07111d] dark:border-[#2a3b50]">
              <img src="/logo.jpg" alt="IGNOU Coders logo" className="size-full object-contain" />
            </span>
            <span className="text-xs font-bold tracking-[0.08em] text-[#172333] dark:text-[#edf3fb] sm:text-sm sm:tracking-[0.1em]">
              IGNOU CODERS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#d8e1ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1] dark:hover:text-[#61c5ff] sm:text-sm"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#d8e1ec] bg-white text-[#314255] transition hover:border-[#8fb5e5] hover:text-[#087fce] dark:border-[#34445a] dark:bg-[#192638] dark:text-[#cbd5e1]"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <section className="w-full max-w-md rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-xl dark:border-[#2a3b50] dark:bg-[#131e2d] sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#087fce]/10 text-[#087fce] dark:bg-[#61c5ff]/15 dark:text-[#61c5ff]">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#172333] dark:text-[#edf3fb]">
                Welcome to IGNOU Coders
              </h1>
              <p className="mt-1 text-sm text-[#647083] dark:text-[#94a3b8]">
                Sign in or create an account to continue.
              </p>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#d8e1ec] bg-white px-4 py-3 text-sm font-semibold !text-[#172333] shadow-sm transition hover:bg-[#f8fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fce] disabled:cursor-wait disabled:opacity-70 dark:border-[#34445a] dark:bg-[#192638] dark:!text-[#edf3fb] dark:hover:bg-[#203149]"
          >
            <GoogleIcon />
            <span>{isSubmitting ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#647083] dark:text-[#94a3b8]">
            We use your Google account ID and email to create your account.
          </p>
        </section>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-[#172333]">
          <p className="text-sm font-medium">Loading sign-in...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
