'use client'

import { StudentDashboard } from '@/components/student-dashboard'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(window.localStorage.getItem('ignou-coders-theme') === 'dark')
  }, [])

  return (
    <StudentDashboard
      onLogout={() => router.push('/')}
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
