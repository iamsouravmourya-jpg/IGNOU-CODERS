import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  isAdminAuthConfigured,
  verifyAdminPasscode,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSCODE and ADMIN_SESSION_SECRET.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 })
  }

  const passcode =
    body && typeof body === 'object' && 'passcode' in body
      ? body.passcode
      : undefined

  if (typeof passcode !== 'string' || !verifyAdminPasscode(passcode)) {
    return NextResponse.json({ error: 'Incorrect admin passcode.' }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
  return response
}
