import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  isValidAdminSession,
} from '@/lib/admin-auth'

export function GET(request: NextRequest) {
  return NextResponse.json({
    configured: isAdminAuthConfigured(),
    authenticated: isValidAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    ),
  })
}
