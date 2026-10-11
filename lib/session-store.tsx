'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  createSupabaseBrowserClient,
  isSupabaseClientConfigured,
} from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
}

export interface SessionStoreContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  isConfigured: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionStoreContext = createContext<SessionStoreContextValue | undefined>(
  undefined,
)

const CACHED_USER_KEY = 'ignou_coders_user_cache'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // Derive simple user profile for UI components
  const profile = useMemo<UserProfile | null>(() => {
    if (!user) return null
    const meta = user.user_metadata || {}
    const fullName =
      meta.full_name ||
      meta.name ||
      (user.email ? user.email.split('@')[0] : 'Student')
    const avatar = meta.avatar_url || meta.picture || undefined

    return {
      id: user.id,
      email: user.email,
      name: fullName,
      avatarUrl: avatar,
    }
  }, [user])

  const refreshSession = useCallback(async () => {
    if (!isSupabaseClientConfigured()) {
      setIsConfigured(false)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setError(null)

      if (data.session?.user) {
        try {
          window.localStorage.setItem(
            CACHED_USER_KEY,
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
              name:
                data.session.user.user_metadata?.full_name ||
                data.session.user.email?.split('@')[0],
            }),
          )
        } catch {
          // ignore storage quota errors
        }
      } else {
        window.localStorage.removeItem(CACHED_USER_KEY)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not refresh session.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const configured = isSupabaseClientConfigured()
    setIsConfigured(configured)

    if (!configured) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    // Try reading cached session profile to avoid layout jumps
    try {
      const cached = window.localStorage.getItem(CACHED_USER_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.id) {
          // Temporarily populate partial profile while real network session resolves
          setUser((prev) => prev ?? ({ id: parsed.id, email: parsed.email } as User))
        }
      }
    } catch {
      // ignore
    }

    const supabase = createSupabaseBrowserClient()

    // 1. Initial fetch of active session
    supabase.auth
      .getSession()
      .then(({ data, error: fetchErr }) => {
        if (!isMounted) return
        if (fetchErr) {
          setError(fetchErr.message)
          setUser(null)
          setSession(null)
        } else {
          setSession(data.session)
          setUser(data.session?.user ?? null)
          setError(null)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Session error')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    // 2. Real-time auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setIsLoading(false)

      if (!newSession) {
        window.localStorage.removeItem(CACHED_USER_KEY)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseClientConfigured()) {
      setUser(null)
      setSession(null)
      window.localStorage.removeItem(CACHED_USER_KEY)
      return
    }

    try {
      setIsLoading(true)
      const supabase = createSupabaseBrowserClient()
      const { error: signOutErr } = await supabase.auth.signOut()
      if (signOutErr) throw signOutErr
      setSession(null)
      setUser(null)
      window.localStorage.removeItem(CACHED_USER_KEY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo<SessionStoreContextValue>(
    () => ({
      session,
      user,
      profile,
      isAuthenticated: Boolean(session?.user || user),
      isLoading,
      isConfigured,
      error,
      signOut,
      refreshSession,
    }),
    [session, user, profile, isLoading, isConfigured, error, signOut, refreshSession],
  )

  return (
    <SessionStoreContext.Provider value={value}>
      {children}
    </SessionStoreContext.Provider>
  )
}

export function useSessionStore(): SessionStoreContextValue {
  const context = useContext(SessionStoreContext)
  if (!context) {
    throw new Error('useSessionStore must be used within a <SessionProvider>')
  }
  return context
}

// Convenient alias
export const useSession = useSessionStore
