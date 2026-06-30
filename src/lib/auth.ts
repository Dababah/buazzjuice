// src/lib/auth.ts
// JWT + PIN auth utilities untuk single admin

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET!
const SESSION_DURATION = 60 * 60 * 12 // 12 jam (cover full hari operasional)
const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 menit

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_DURATION })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// ─── Cookie ───────────────────────────────────────────────────────────────────

export function setAuthCookie(token: string) {
  cookies().set('buazzz_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().delete('buazzz_token')
}

export function getAuthToken(): string | undefined {
  return cookies().get('buazzz_token')?.value
}

// ─── Session Check (untuk Server Components / Route Handlers) ─────────────────

export async function getSession(): Promise<JWTPayload | null> {
  const token = getAuthToken()
  if (!token) return null
  return verifyToken(token)
}

// ─── Brute Force Protection ───────────────────────────────────────────────────

export async function checkLoginAttempts(ip: string): Promise<{
  allowed: boolean
  remainingMinutes?: number
}> {
  const record = await prisma.loginAttempt.findFirst({ where: { ip } })

  if (!record) return { allowed: true }

  if (record.lockedAt) {
    const lockedMs = Date.now() - record.lockedAt.getTime()
    if (lockedMs < LOCK_DURATION_MS) {
      const remainingMinutes = Math.ceil((LOCK_DURATION_MS - lockedMs) / 60000)
      return { allowed: false, remainingMinutes }
    }
    // Lock expired — reset
    await prisma.loginAttempt.update({
      where: { id: record.id },
      data: { attempts: 0, lockedAt: null },
    })
  }

  return { allowed: true }
}

export async function recordFailedAttempt(ip: string) {
  const record = await prisma.loginAttempt.findFirst({ where: { ip } })

  if (!record) {
    await prisma.loginAttempt.create({ data: { ip, attempts: 1 } })
    return
  }

  const newAttempts = record.attempts + 1
  await prisma.loginAttempt.update({
    where: { id: record.id },
    data: {
      attempts: newAttempts,
      lockedAt: newAttempts >= MAX_ATTEMPTS ? new Date() : null,
    },
  })
}

export async function resetAttempts(ip: string) {
  await prisma.loginAttempt.updateMany({
    where: { ip },
    data: { attempts: 0, lockedAt: null },
  })
}

// ─── PIN ──────────────────────────────────────────────────────────────────────

export async function verifyPin(pin: string): Promise<{ valid: boolean; userId?: number; name?: string }> {
  const user = await prisma.user.findFirst()
  if (!user) return { valid: false }

  const valid = await bcrypt.compare(pin, user.pinHash)
  if (!valid) return { valid: false }

  return { valid: true, userId: user.id, name: user.name }
}
