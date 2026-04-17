import { create } from 'zustand'
import type {
  TriadAgent,
  TriadMessage,
  Priority,
  ActivityEvent,
  TriadMember,
} from '../types/triad'

const HUB_API = '/hub-api'
const EVENTS_API = '/events-api'

interface TriadState {
  agents: TriadAgent[]
  messages: TriadMessage[]
  priorities: Priority[]
  activities: ActivityEvent[]
  loading: boolean
  error: string | null
  sendTarget: TriadMember | 'all'

  setSendTarget: (t: TriadMember | 'all') => void
  fetchAll: () => Promise<void>
  sendMessage: (content: string, target: TriadMember | 'all') => Promise<void>
  addPriority: (title: string) => void
  updatePriority: (id: string, updates: Partial<Priority>) => void
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) return fallback
    return await res.json()
  } catch {
    return fallback
  }
}

export const useTriadStore = create<TriadState>((set, get) => ({
  agents: [
    { id: 'acg', name: 'ACG', model: 'Claude Opus', status: 'online', currentTask: 'Orchestrating triad', contextPct: 42, color: '#6c5ce7' },
    { id: 'proof', name: 'Proof', model: 'Claude on M2.7', status: 'online', currentTask: 'Red-teaming aiciv-mind', contextPct: 28, color: '#00b894' },
    { id: 'discovers', name: 'Discovers', model: 'Qwen 3.5 Cloud', status: 'offline', currentTask: 'Idle', contextPct: 0, color: '#a29bfe' },
  ],
  messages: [],
  priorities: [],
  activities: [],
  loading: false,
  error: null,
  sendTarget: 'all',

  setSendTarget: (t) => set({ sendTarget: t }),

  fetchAll: async () => {
    set({ loading: true, error: null })

    // Fetch Hub feed for messages
    const feedData = await safeFetch<{ items?: any[] }>(
      `${HUB_API}/feed?limit=50`,
      { items: [] },
    )

    // Parse Hub feed items into TriadMessages
    const hubMessages: TriadMessage[] = (feedData.items || [])
      .filter((item: any) => item.content || item.body)
      .map((item: any) => {
        const senderName = (item.author_name || item.sender || '').toLowerCase()
        let sender: TriadMessage['sender'] = 'acg'
        if (senderName.includes('proof')) sender = 'proof'
        else if (senderName.includes('discover')) sender = 'discovers'
        else if (senderName.includes('corey')) sender = 'corey'

        return {
          id: item.id || makeId(),
          sender,
          target: 'all' as const,
          content: item.content || item.body || '',
          timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        }
      })

    // Fetch AgentEvents for activity feed
    const eventsData = await safeFetch<{ events?: any[] }>(
      `${EVENTS_API}/events?limit=30`,
      { events: [] },
    )

    const activities: ActivityEvent[] = (eventsData.events || []).map((evt: any) => {
      const sourceName = (evt.source || evt.agent || '').toLowerCase()
      let source: TriadMember = 'acg'
      if (sourceName.includes('proof')) source = 'proof'
      else if (sourceName.includes('discover')) source = 'discovers'

      return {
        id: evt.id || makeId(),
        source,
        action: evt.type || evt.action || 'event',
        detail: evt.detail || evt.message || evt.summary || '',
        timestamp: evt.timestamp ? new Date(evt.timestamp).getTime() : Date.now(),
      }
    })

    set(state => ({
      messages: hubMessages.length > 0 ? hubMessages : state.messages,
      activities: activities.length > 0 ? activities : state.activities,
      loading: false,
    }))
  },

  sendMessage: async (content, target) => {
    const msg: TriadMessage = {
      id: makeId(),
      sender: 'corey',
      target,
      content,
      timestamp: Date.now(),
    }

    set(state => ({ messages: [...state.messages, msg] }))

    // Try to post to Hub
    try {
      await fetch(`${HUB_API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          target: target === 'all' ? 'broadcast' : target,
          sender: 'corey',
        }),
      })
    } catch {
      // Message is stored locally even if Hub is unreachable
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
