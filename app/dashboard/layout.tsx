import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
  try {
    supabase = await createSupabaseServerClient()
  } catch {
    redirect('/auth?error=configuration')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return children
}
