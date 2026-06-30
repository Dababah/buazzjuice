// src/middleware.ts
// Proteksi semua route /admin/* kecuali /admin/login
// IMPORTANT: Middleware runs in Edge Runtime — cannot use bcryptjs or jsonwebtoken.
// JWT verification is done manually via Web Crypto API (HS256).

import { NextRequest, NextResponse } from 'next/server'

// ─── Edge-compatible JWT verification ─────────────────────────────────────────

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [headerB64, payloadB64, signatureB64] = parts

    // Pad base64 strings before atob
    const pad = (str: string) => str.padEnd(str.length + (4 - str.length % 4) % 4, '=');
    
    // Decode and verify expiry from payload
    const payloadJson = atob(pad(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    const payload = JSON.parse(payloadJson)
    if (payload.exp && Date.now() / 1000 > payload.exp) return false

    // Verify signature using HMAC-SHA256
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = encoder.encode(`${headerB64}.${payloadB64}`)

    // Decode base64url signature
    const signaturePad = pad(signatureB64.replace(/-/g, '+').replace(/_/g, '/'))
    const signatureBytes = Uint8Array.from(atob(signaturePad), (c) => c.charCodeAt(0))

    const valid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, data)
    return valid
  } catch (error) {
    console.error('JWT Verification Error:', error)
    return false
  }
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Hanya proteksi /admin/* kecuali login page
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('buazzz_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const valid = await verifyJWT(token)
    if (!valid) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('buazzz_token')
      return response
    }
  }

  // Proteksi semua API admin (kecuali auth & products public)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/products')
  ) {
    const token = request.cookies.get('buazzz_token')?.value

    if (!token || !(await verifyJWT(token))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
