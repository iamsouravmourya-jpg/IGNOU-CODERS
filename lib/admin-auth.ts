import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE = 'ignou_admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_PASSCODE &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32,
  )
}

export function verifyAdminPasscode(passcode: string) {
  const expected = process.env.ADMIN_PASSCODE
  if (!expected) return false

  const actualHash = createHash('sha256').update(passcode).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(actualHash, expectedHash)
}

export function createAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.')

  const issuedAt = Math.floor(Date.now() / 1000).toString()
  const signature = createHmac('sha256', secret).update(issuedAt).digest('hex')
  return `${issuedAt}.${signature}`
}

export function isValidAdminSession(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !token) return false

  const [issuedAt, providedSignature, extra] = token.split('.')
  if (!issuedAt || !providedSignature || extra !== undefined) return false

  const timestamp = Number(issuedAt)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isInteger(timestamp) || timestamp > now || now - timestamp > ADMIN_SESSION_MAX_AGE) {
    return false
  }

  const expectedSignature = createHmac('sha256', secret).update(issuedAt).digest()
  const actualSignature = Buffer.from(providedSignature, 'hex')
  return (
    actualSignature.length === expectedSignature.length &&
    timingSafeEqual(actualSignature, expectedSignature)
  )
}
