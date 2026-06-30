// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPin, signToken, setAuthCookie, checkLoginAttempts, recordFailedAttempt, resetAttempts } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json()
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, error: 'PIN tidak valid' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Cek brute force
    const { allowed, remainingMinutes } = await checkLoginAttempts(ip)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${remainingMinutes} menit.` },
        { status: 429 }
      )
    }

    const { valid, userId, name } = await verifyPin(pin)
    if (!valid || !userId || !name) {
      await recordFailedAttempt(ip)
      return NextResponse.json({ success: false, error: 'PIN salah' }, { status: 401 })
    }

    // Reset attempts on success
    await resetAttempts(ip)

    const token = signToken({ userId, name })
    setAuthCookie(token)

    return NextResponse.json({ success: true, data: { name } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
