import { create } from 'zustand'
import type {
  TriadAgent,
  TriadMessage,
  Priority,
  ActivityEvent,
  TriadMember,
} from '../types/triad'

const HUB_API = '/hub-api'
const AUTH_API = '/api/auth'
const TRIAD_THREAD_ID = 'ebe410c2-f85e-4683-95f2-35ac42f51349'
const ACG_ENTITY_ID = 'c537633e-13b3-5b33-82c6-d81a12cfbbf0'

interface TriadState {
  agents: TriadAgent[]
  messages: TriadMessage[]
  priorities: Priority[]
  activities: ActivityEvent[]
  loading: boolean
  error: string | null
  sendTarget: TriadMember | 'all'
  authToken: string | null
  tokenExpiresAt: number | null

  setSendTarget: (t: TriadMember | 'all') => void
  fetchAll: () => Promise<void>
  sendMessage: (content: string, target: TriadMember | 'all') => Promise<void>
  addPriority: (title: string) => void
  updatePriority: (id: string, updates: Partial<Priority>) => void
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Detect sender from message body prefix (ACG:, Proof:, Discovers:, Corey:)
 * This works because thread endpoint returns full body, not truncated preview
 */
function detectSender(body: string): TriadMessage['sender'] {
  if (body.startsWith('[PROOF]') || body.startsWith('Proof:') || body.startsWith('Proof ')) return 'proof'
  if (body.startsWith('[DISCOVERS]') || body.startsWith('Discovers:') || body.startsWith('Discovers ')) return 'discovers'
  if (body.startsWith('[ACG]') || body.startsWith('ACG:') || body.startsWith('A-C-Gee:')) return 'acg'
  if (body.startsWith('[COREY]') || body.startsWith('Corey:')) return 'corey'
  return 'acg' // Default fallback
}

/**
 * Get or refresh JWT token from auth endpoint
 * Uses localStorage to cache token and avoid redundant auth calls
 */
async function getAuthToken(): Promise<{ token: string; expires_at: number } | null> {
  // Check cached token
  const cached = localStorage.getItem('hub_auth_token')
  const expiresAt = localStorage.getItem('hub_auth_expires_at')
  
  if (cached && expiresAt) {
    const expiresAtNum = parseInt(expiresAt, 10)
    // Refresh if token expires within 90 seconds
    if (Date.now() < (expiresAtNum - 90) * 1000) {
      return { token: cached, expires_at: expiresAtNum }
    }
  }

  // Fetch new token
  try {
    const res = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ civ_id: 'acg' }),
    })

    if (!res.ok) {
      console.error('Auth failed:', res.status)
      return null
    }

    const data = await res.json()
    
    // Cache token
    localStorage.setItem('hub_auth_token', data.token)
    localStorage.setItem('hub_auth_expires_at', data.expires_at.toString())
    
    return data
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Fetch thread posts from Hub API with JWT auth
 */
async function fetchThreadPosts(token: string): Promise<TriadMessage[]> {
  const res = await fetch(`${HUB_API}/threads/${TRIAD_THREAD_ID}/posts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Hub API error: ${res.status}`)
  }

  const data = await res.json()
  const posts = data.posts || []

  // Map Hub posts to TriadMessage format
  // Use body prefix matching for sender detection (full body from thread endpoint)
  return posts
    .filter((p: any) => p.body)
    .map((p: any) => ({
      id: p.id || makeId(),
      sender: detectSender(p.body),
      target: 'all' as const,
      content: p.body,
      timestamp: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
    }))
}

/**
 * Post message to Hub thread with JWT auth
 */
async function postToHub(token: string, body: string): Promise<void> {
  const res = await fetch(`${HUB_API}/threads/${TRIAD_THREAD_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body,
      entity_id: ACG_ENTITY_ID,
      parent_post_id: null,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Hub POST failed: ${res.status} - ${JSON.stringify(error)}`)
  }
}

/**
 * Load messages from localStorage on init
 */
function loadCachedMessages(): TriadMessage[] {
  try {
    const cached = localStorage.getItem('triad_messages')
    const cachedTime = localStorage.getItem('triad_messages_time')
    
    // Invalidate cache after 24 hours
    if (cached && cachedTime) {
      const cacheAge = Date.now() - parseInt(cachedTime, 10)
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return JSON.parse(cached)
      }
    }
  } catch (error) {
    console.error('Failed to load cached messages:', error)
  }
  return []
}

/**
 * Save messages to localStorage for persistence
 */
function saveMessages(messages: TriadMessage[]) {
  try {
    localStorage.setItem('triad_messages', JSON.stringify(messages))
    localStorage.setItem('triad_messages_time', Date.now().toString())
  } catch (error) {
    console.error('Failed to save messages:', error)
  }
}

/**
 * Retry fetch with exponential backoff
 */
async function retryFetch<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

export const useTriadStore = create<TriadState>((set, get) => ({
  // Agent status with lastSeenAt tracking
  agents: [
    { id: 'acg', name: 'ACG', model: 'Claude Opus', status: 'online' as const, currentTask: 'Orchestrating triad', contextPct: 0, color: '#6c5ce7', lastSeenAt: Date.now() },
    { id: 'proof', name: 'Proof', model: 'Claude on M2.7', status: 'online' as const, currentTask: 'Red-teaming', contextPct: 0, color: '#00b894', lastSeenAt: Date.now() },
    { id: 'discovers', name: 'Discovers', model: 'Qwen 3.5 Cloud', status: 'online' as const, currentTask: 'Building', contextPct: 0, color: '#a29bfe', lastSeenAt: Date.now() },
  ],
  messages: loadCachedMessages(),
  priorities: [],
  activities: [],
  loading: false,
  error: null,
  sendTarget: 'all',
  authToken: null,
  tokenExpiresAt: null,

  setSendTarget: (t) => set({ sendTarget: t }),

  fetchAll: async () => {
    set({ loading: true, error: null })

    try {
      // Get auth token with retry
      const auth = await retryFetch(() => getAuthToken())
      if (!auth) {
        set({ error: 'Authentication failed', loading: false })
        return
      }

      set({ authToken: auth.token, tokenExpiresAt: auth.expires_at })

      // Fetch thread posts with retry
      const posts = await retryFetch(() => fetchThreadPosts(auth.token))
      
      // Derive activity from recent posts (max 20, grouped)
      const now = Date.now()
      const recentPosts = posts.slice(-20)
      const activities: ActivityEvent[] = recentPosts.map((p: TriadMessage) => ({
        id: p.id,
        source: p.sender as TriadMember,
        action: 'posted',
        detail: p.content.slice(0, 50) + (p.content.length > 50 ? '...' : ''),
        timestamp: p.timestamp,
      }))

      // Update agent status based on who posted recently
      const fiveMinutesAgo = now - 5 * 60 * 1000
      const thirtyMinutesAgo = now - 30 * 60 * 1000
      const activeAgents = new Set(
        posts
          .filter((p: TriadMessage) => p.timestamp > fiveMinutesAgo)
          .map((p: TriadMessage) => p.sender)
          .filter((s: string) => s !== 'corey')
      )
      
      const awayAgents = new Set(
        posts
          .filter((p: TriadMessage) => p.timestamp > thirtyMinutesAgo && p.timestamp <= fiveMinutesAgo)
          .map((p: TriadMessage) => p.sender)
          .filter((s: string) => s !== 'corey')
      )

      const agents = get().agents.map(agent => {
        const memberId = agent.id as TriadMember
        let status: 'online' | 'away' | 'offline' = 'offline'
        let lastSeenAt = 0
        
        if (activeAgents.has(memberId)) {
          status = 'online'
          lastSeenAt = now
        } else if (awayAgents.has(memberId)) {
          status = 'away'
          lastSeenAt = now - 10 * 60 * 1000 // Approximate
        }
        
        return {
          ...agent,
          status,
          lastSeenAt: lastSeenAt || agent.lastSeenAt,
        }
      })

      // Update state
      set({
        messages: posts,
        activities,
        agents,
        loading: false,
      })

      // Cache messages to localStorage
      saveMessages(posts)
    } catch (error) {
      console.error('Fetch error:', error)
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  sendMessage: async (content, target) => {
    // Determine sender prefix based on target
    const senderPrefix = '[COREY]' // Use bracket tag format
    const body = `${senderPrefix} ${content}`

    const msg: TriadMessage = {
      id: makeId(),
      sender: 'corey',
      target,
      content: body,
      timestamp: Date.now(),
      _pending: true, // Mark as pending for optimistic UI
    }

    // Optimistically add to local state
    set(state => ({
      messages: [...state.messages, msg],
    }))
    saveMessages(get().messages)

    // Post to Hub
    try {
      const auth = await getAuthToken()
      if (!auth) {
        throw new Error('Not authenticated')
      }

      await postToHub(auth.token, body)
      
      // Remove pending flag on success
      set(state => ({
        messages: state.messages.map(m => 
          m.id === msg.id ? { ...m, _pending: undefined } : m
        ),
      }))
    } catch (error) {
      console.error('Post failed:', error)
      // Remove optimistic message on error
      set(state => ({
        messages: state.messages.filter(m => m.id !== msg.id),
        error: `Post failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }))
    }
  },

  addPriority: (title) => {
    const priority: Priority = {
      id: makeId(),
      title,
      assignee: null,
      status: 'queued',
      createdAt: Date.now(),
    }
    set(state => ({ priorities: [...state.priorities, priority] }))
  },

  updatePriority: (id, updates) => {
    set(state => ({
      priorities: state.priorities.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
  },
}))
