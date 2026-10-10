'use client'

import { StudentDashboard } from '@/components/student-dashboard'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const dark = window.localStorage.getItem('ignou-coders-theme') === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  async function handleLogout() {
    const { error } = await createSupabaseBrowserClient().auth.signOut()
    if (error) throw error
    router.replace('/auth')
  }

  return (
    <StudentDashboard
      onLogout={handleLogout}
      isDark={isDark}
      toggleTheme={() => {
        setIsDark((curr) => {
          const next = !curr
          window.localStorage.setItem('ignou-coders-theme', next ? 'dark' : 'light')
          return next
        })
      }}
    />
  )
}
