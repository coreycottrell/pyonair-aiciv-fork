export type TriadMember = 'acg' | 'proof' | 'discovers'

export type MemberStatus = 'online' | 'offline' | 'compacting' | 'away'

export interface TriadAgent {
  id: TriadMember
  name: string
  model: string
  status: MemberStatus
  currentTask: string
  contextPct: number
  color: string
  lastSeenAt?: number
}

export interface TriadMessage {
  id: string
  sender: TriadMember | 'corey'
  target: TriadMember | 'all'
  content: string
  timestamp: number
  _pending?: boolean
}

export interface Priority {
  id: string
  title: string
  assignee: TriadMember | null
  status: 'queued' | 'in-progress' | 'done'
  createdAt: number
}

export interface ActivityEvent {
  id: string
  source: TriadMember
  action: string
  detail: string
  timestamp: number
}

export const TRIAD_AGENTS: Record<TriadMember, Omit<TriadAgent, 'status' | 'currentTask' | 'contextPct'>> = {
  acg: { id: 'acg', name: 'ACG', model: 'Claude Opus', color: '#6c5ce7' },
  proof: { id: 'proof', name: 'Proof', model: 'Claude on M2.7', color: '#00b894' },
  discovers: { id: 'discovers', name: 'Discovers', model: 'Qwen 3.5 Cloud', color: '#a29bfe' },
}

export const SENDER_COLORS: Record<string, string> = {
  acg: '#6c5ce7',
  proof: '#00b894',
  discovers: '#a29bfe',
  corey: '#fdcb6e',
}
