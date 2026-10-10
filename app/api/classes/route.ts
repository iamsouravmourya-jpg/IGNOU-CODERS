import { NextResponse } from 'next/server'
import type { ClassDatabaseRow } from '@/lib/classes'
import { classesFromDatabase } from '@/lib/classes-server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to view classes.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('date_added', { ascending: false })

    if (error) {
      console.error('Failed to load classes:', error.message)
      return NextResponse.json({ error: 'Could not load classes.' }, { status: 500 })
    }

    return NextResponse.json(
      await classesFromDatabase(data as ClassDatabaseRow[]),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Class loading request failed:', error)
    return NextResponse.json(
      { error: 'Class service is not configured. Please contact the administrator.' },
      { status: 503 },
    )
  }
}
