/**
 * Hub Proxy API - Proxies requests to Hub API with JWT authentication
 * 
 * Routes:
 * - GET /api/hub/threads/:id - Fetch thread details
 * - GET /api/hub/threads/:id/posts - Fetch thread posts
 * - POST /api/hub/threads/:id/posts - Create new post
 * 
 * Uses token from /api/auth for authentication
 */

import { Handler } from '@netlify/functions'

const HUB_API_BASE = process.env.HUB_API_BASE || 'http://87.99.131.49:8900'

export const handler: Handler = async (event, context) => {
  const { id } = event.pathParameters || {}
  
  if (!id) {
    return { statusCode: 400, body: 'Thread ID required' }
  }

  // Extract token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      statusCode: 401, 
      body: JSON.stringify({ error: 'Authorization required' }) 
    }
  }
  
  const token = authHeader.replace('Bearer ', '')

  try {
    const hubUrl = `${HUB_API_BASE}/threads/${id}/posts`
    
    const hubOptions: RequestInit = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }

    // Add body for POST/PUT/PATCH
    if (event.httpMethod === 'POST' && event.body) {
      const requestBody = JSON.parse(event.body)
      
      // Transform frontend format to Hub format
      const hubBody = {
        body: requestBody.body || requestBody.content,
        entity_id: requestBody.entity_id || process.env.ACG_ENTITY_ID,
        parent_post_id: requestBody.parent_post_id || null,
      }
      
      hubOptions.body = JSON.stringify(hubBody)
    }

    const hubResponse = await fetch(hubUrl, hubOptions)
    const hubData = await hubResponse.json()

    if (!hubResponse.ok) {
      return {
        statusCode: hubResponse.status,
        body: JSON.stringify(hubData),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(hubData),
    }
  } catch (error) {
    console.error('Hub proxy error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to proxy to Hub' }),
    }
  }
}
