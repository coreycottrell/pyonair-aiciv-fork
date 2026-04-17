import { useEffect, useState, useRef, useCallback } from 'react'
import { useTriadStore } from '../../stores/triadStore'
import { SENDER_COLORS } from '../../types/triad'
import type { TriadAgent, TriadMessage, TriadMember, MemberStatus } from '../../types/triad'
import { LoadingSpinner } from '../common/LoadingSpinner'
import './TriadView.css'

/* ─── Status indicator ─── */
function StatusDot({ status }: { status: MemberStatus }) {
  const cls =
    status === 'online' ? 'triad-dot-online' :
    status === 'compacting' ? 'triad-dot-compacting' :
    'triad-dot-offline'
  return <span className={`triad-dot ${cls}`} />
}

/* ─── Agent card (top panel) ─── */
function AgentCard({ agent }: { agent: TriadAgent }) {
  return (
    <div className="triad-agent-card" style={{ borderTopColor: agent.color }}>
      <div className="triad-agent-header">
        <StatusDot status={agent.status} />
        <span className="triad-agent-name" style={{ color: agent.color }}>{agent.name}</span>
        <span className="triad-agent-model">{agent.model}</span>
      </div>
      <div className="triad-agent-task">{agent.currentTask}</div>
      <div className="triad-agent-ctx">
        <div className="triad-ctx-bar">
          <div
            className="triad-ctx-fill"
            style={{
              width: `${Math.min(agent.contextPct, 100)}%`,
              background: agent.color,
            }}
          />
        </div>
        <span className="triad-ctx-label">{agent.contextPct}% ctx</span>
      </div>
    </div>
  )
}

/* ─── Chat message ─── */
function ChatMessage({ msg }: { msg: TriadMessage }) {
  const senderColor = SENDER_COLORS[msg.sender] || '#a0a0b0'
  const senderLabel = msg.sender === 'corey' ? 'Corey' : msg.sender.toUpperCase()
  const targetLabel = msg.target === 'all' ? '' : ` → ${msg.target.toUpperCase()}`
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`triad-msg ${msg.sender === 'corey' ? 'triad-msg-corey' : ''}`}>
      <div className="triad-msg-meta">
        <span className="triad-msg-sender" style={{ color: senderColor }}>
          {senderLabel}{targetLabel}
        </span>
        <span className="triad-msg-time">{time}</span>
      </div>
      <div className="triad-msg-body">{msg.content}</div>
    </div>
  )
}

/* ─── Chat stream panel ─── */
function ChatStream() {
  const messages = useTriadStore(s => s.messages)
  const sendMessage = useTriadStore(s => s.sendMessage)
  const sendTarget = useTriadStore(s => s.sendTarget)
  const setSendTarget = useTriadStore(s => s.setSendTarget)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(trimmed, sendTarget)
    setInput('')
  }, [input, sendMessage, sendTarget])

  return (
    <div className="triad-chat">
      <div className="triad-chat-header">
        <h3 className="triad-section-title">Chat Stream</h3>
        <div className="triad-target-selector">
          <button
            className={`triad-target-btn ${sendTarget === 'all' ? 'active' : ''}`}
            onClick={() => setSendTarget('all')}
            type="button"
          >All</button>
          <button
            className={`triad-target-btn ${sendTarget === 'acg' ? 'active' : ''}`}
            onClick={() => setSendTarget('acg')}
            style={sendTarget === 'acg' ? { background: SENDER_COLORS.acg + '33', borderColor: SENDER_COLORS.acg } : undefined}
            type="button"
          >ACG</button>
          <button
            className={`triad-target-btn ${sendTarget === 'proof' ? 'active' : ''}`}
            onClick={() => setSendTarget('proof')}
            style={sendTarget === 'proof' ? { background: SENDER_COLORS.proof + '33', borderColor: SENDER_COLORS.proof } : undefined}
            type="button"
          >Proof</button>
          <button
            className={`triad-target-btn ${sendTarget === 'discovers' ? 'active' : ''}`}
            onClick={() => setSendTarget('discovers')}
            style={sendTarget === 'discovers' ? { background: SENDER_COLORS.discovers + '33', borderColor: SENDER_COLORS.discovers } : undefined}
            type="button"
          >Discovers</button>
        </div>
      </div>

      <div className="triad-chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="triad-chat-empty">No messages yet. Hub feed will appear here.</div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
      </div>

      <div className="triad-chat-input">
        <input
          className="triad-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder={`Message ${sendTarget === 'all' ? 'all AIs' : sendTarget.toUpperCase()}...`}
        />
        <button className="triad-send-btn" onClick={handleSend} disabled={!input.trim()} type="button">
          Send
        </button>
      </div>
    </div>
  )
}

/* ─── Priority board ─── */
function PriorityBoard() {
  const priorities = useTriadStore(s => s.priorities)
  const addPriority = useTriadStore(s => s.addPriority)
  const updatePriority = useTriadStore(s => s.updatePriority)
  const [newTitle, setNewTitle] = useState('')

  const handleAdd = useCallback(() => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    addPriority(trimmed)
    setNewTitle('')
  }, [newTitle, addPriority])

  const cycleStatus = useCallback((id: string, current: string) => {
    const next = current === 'queued' ? 'in-progress' : current === 'in-progress' ? 'done' : 'queued'
    updatePriority(id, { status: next as any })
  }, [updatePriority])

  const assignTo = useCallback((id: string, member: TriadMember) => {
    updatePriority(id, { assignee: member })
  }, [updatePriority])

  return (
    <div className="triad-priorities">
      <h3 className="triad-section-title">Priority Board</h3>

      <div className="triad-priority-add">
        <input
          className="triad-input"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Drop a priority..."
        />
        <button className="triad-send-btn" onClick={handleAdd} disabled={!newTitle.trim()} type="button">+</button>
      </div>

      <div className="triad-priority-list">
        {priorities.length === 0 && (
          <div className="triad-chat-empty">No priorities yet. Drop one above.</div>
        )}
        {priorities.map(p => (
          <div key={p.id} className={`triad-priority-item triad-priority-${p.status}`}>
            <button
              className="triad-priority-status"
              onClick={() => cycleStatus(p.id, p.status)}
              title="Click to cycle status"
              type="button"
            >
              {p.status === 'queued' ? '\u{1F7E1}' : p.status === 'in-progress' ? '\u{1F535}' : '\u{2705}'}
            </button>
            <span className="triad-priority-title">{p.title}</span>
            <div className="triad-priority-assign">
              {(['acg', 'proof', 'discovers'] as TriadMember[]).map(m => (
                <button
                  key={m}
                  className={`triad-assign-btn ${p.assignee === m ? 'active' : ''}`}
                  style={p.assignee === m ? { background: SENDER_COLORS[m] + '44', color: SENDER_COLORS[m] } : undefined}
                  onClick={() => assignTo(p.id, m)}
                  title={`Assign to ${m.toUpperCase()}`}
                  type="button"
                >
                  {m === 'acg' ? 'A' : m === 'proof' ? 'P' : 'D'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Activity feed ─── */
function ActivityFeed() {
  const activities = useTriadStore(s => s.activities)

  return (
    <div className="triad-activity">
      <h3 className="triad-section-title">Activity Feed</h3>
      <div className="triad-activity-list">
        {activities.length === 0 && (
          <div className="triad-chat-empty">No activity yet. AgentEvents feed will appear here.</div>
        )}
        {activities.map(evt => {
          const color = SENDER_COLORS[evt.source] || '#a0a0b0'
          const time = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          return (
            <div key={evt.id} className="triad-activity-item">
              <span className="triad-activity-source" style={{ color }}>{evt.source.toUpperCase()}</span>
              <span className="triad-activity-action">{evt.action}</span>
              <span className="triad-activity-detail">{evt.detail}</span>
              <span className="triad-activity-time">{time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main view ─── */
export function TriadView() {
  const agents = useTriadStore(s => s.agents)
  const loading = useTriadStore(s => s.loading)
  const fetchAll = useTriadStore(s => s.fetchAll)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 12_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return (
    <div className="triad-view">
      <div className="triad-header">
        <h2 className="triad-title">Triad Coordination</h2>
        <span className="triad-subtitle">ACG + Proof + Discovers</span>
        {loading && <LoadingSpinner size={16} />}
      </div>

      {/* Status panel — 3 agent cards */}
      <div className="triad-agents-grid">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Main content — chat + sidebar */}
      <div className="triad-main">
        <ChatStream />
        <div className="triad-sidebar">
          <PriorityBoard />
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
