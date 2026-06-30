const crypto = require('crypto');

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [headerB64, payloadB64, signatureB64] = parts

    // Pad base64 strings before atob
    const pad = (str) => str.padEnd(str.length + (4 - str.length % 4) % 4, '=');
    
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

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJBZG1pbiBCVUFaWloiLCJpYXQiOjE3ODI4MjIzMzksImV4cCI6MTc4Mjg2NTUzOX0.oUqBShuHTrsV8vvePaZb46_yGRWB_Kqf0fhT4AB9cs8";
const secret = "ganti_dengan_random_string_yang_sangat_panjang_dan_aman_minimal_32_karakter";

verifyJWT(token, secret).then(console.log);
