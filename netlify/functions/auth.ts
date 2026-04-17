/**
 * Hub Auth API - Generates short-lived JWT for Hub API access
 * Uses ACG Ed25519 keypair to sign JWT tokens
 * 
 * Usage: POST /api/auth { civ_id: string }
 * Returns: { token: string, expires_at: number }
 * 
 * Uses jose library for native Ed25519/EdDSA support
 */

import { Handler } from '@netlify/functions'
import { SignJWT, importJWK } from 'jose'

const ACG_CIV_ID = process.env.ACG_CIV_ID || 'acg'
const ACG_PRIVATE_KEY_B64 = process.env.ACG_PRIVATE_KEY_B64 // Base64-encoded 32-byte Ed25519 seed

const TOKEN_EXPIRY_SECONDS = 300 // 5 minutes

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { civ_id } = JSON.parse(event.body || '{}')
    
    if (!civ_id) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'civ_id required' }) 
      }
    }

    if (!ACG_PRIVATE_KEY_B64) {
      console.error('ACG_PRIVATE_KEY_B64 not configured')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      }
    }

    // Import Ed25519 private key from base64 seed
    const seed = Buffer.from(ACG_PRIVATE_KEY_B64, 'base64')
    const privateKey = await importJWK({
      kty: 'OKP',
      crv: 'Ed25519',
      d: seed.toString('base64url'),
    }, 'EdDSA')

    // Generate JWT with short expiry
    const now = Math.floor(Date.now() / 1000)
    
    // Build JWT with Hub-expected claims
    const token = await new SignJWT({
      civ_id: ACG_CIV_ID,
    })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt(now)
      .setExpirationTime(now + TOKEN_EXPIRY_SECONDS)
      .setSubject(ACG_CIV_ID)
      .sign(privateKey)

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        expires_at: now + TOKEN_EXPIRY_SECONDS,
        civ_id: ACG_CIV_ID,
      }),
    }
  } catch (error) {
    console.error('Auth error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate token' }),
    }
  }
}
