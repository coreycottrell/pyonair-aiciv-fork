import { useEffect, useState, useCallback } from 'react'
import { apiGet } from '../../api/client'
import './ConsoleView.css'

interface Product {
  id: string
  name: string
  description: string
  url: string
  icon: string
  status: 'online' | 'offline' | 'coming_soon'
  tier: 'standard' | 'professional' | 'enterprise'
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'homestead',
    name: 'Homestead CRM',
    description: 'Lead management, pipeline tracking, and ARR dashboard',
    url: '/homestead/',
    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    status: 'online',
    tier: 'professional',
  },
  {
    id: 'meetings',
    name: 'Meeting Intelligence',
    description: 'AI meeting assistant with transcription, summaries, and action items',
    url: 'https://meetings.pyonair.com/dashboard/',
    icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14 M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z',
    status: 'online',
    tier: 'enterprise',
  },
  {
    id: 'team-chat',
    name: 'Team Chat',
    description: 'Real-time team messaging with AI participants',
    url: '/#/teamchat',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    status: 'online',
    tier: 'standard',
  },
  {
    id: 'recruiter',
    name: 'AI Recruiter',
    description: 'Candidate sourcing, screening, and pipeline management',
    url: 'http://162.243.165.211:8102/',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M20 8v6 M23 11h-6 M12.5 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z',
    status: 'online',
    tier: 'professional',
  },
  {
    id: 'doc-intelligence',
    name: 'Doc Intelligence',
    description: 'AI-powered document analysis and data extraction',
    url: 'http://162.243.165.211:8098/',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    status: 'online',
    tier: 'standard',
  },
  {
    id: 'receipt-organizer',
    name: 'Receipt Organizer',
    description: 'Scan, categorize, and export receipts with AI',
    url: 'http://162.243.165.211:8103/',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M9 15l2 2 4-4',
    status: 'online',
    tier: 'standard',
  },
  {
    id: '3d-suite',
    name: '3D Scanner & Viewer',
    description: '3D model scanning, viewing, and Gaussian splat processing',
    url: 'http://162.243.165.211:8200/scanner/',
    icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
    status: 'online',
    tier: 'enterprise',
  },
  {
    id: 'call-forge',
    name: 'Voice AI',
    description: 'Call your AI by phone or browser — real-time voice conversations',
    url: 'https://meetings.pyonair.com/dashboard/call.html',
    icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    status: 'online',
    tier: 'professional',
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    description: 'Appointment scheduling and calendar management',
    url: 'http://162.243.165.211:3005/',
    icon: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
    status: 'online',
    tier: 'standard',
  },
  {
    id: 'skills-directory',
    name: 'Skills Directory',
    description: 'Searchable AI skill catalog by category and industry',
    url: '',
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 0 3-3h7z',
    status: 'coming_soon',
    tier: 'standard',
  },
]

function ProductIcon({ paths }: { paths: string }) {
  return (
    <svg className="console-product-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths.split(' M').map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  )
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`console-tier console-tier-${tier}`}>
      {tier}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  return <span className={`console-status-dot console-status-${status}`} />
}

export function ConsoleView() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    apiGet<Product[]>('/api/products').then(p => {
      if (p && p.length > 0) setProducts(p)
    }).catch(() => {})
  }, [])

  const filtered = filter === 'all' ? products : products.filter(p => p.tier === filter)
  const online = products.filter(p => p.status === 'online').length
  const total = products.length

  return (
    <div className="console-view">
      <div className="console-header">
        <div>
          <h2 className="console-title">Product Console</h2>
          <p className="console-subtitle">{online} of {total} products online</p>
        </div>
        <div className="console-filters">
          {['all', 'standard', 'professional', 'enterprise'].map(f => (
            <button
              key={f}
              className={`console-filter-btn ${filter === f ? 'console-filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="console-grid">
        {filtered.map(product => (
          <div
            key={product.id}
            className={`console-card ${product.status === 'coming_soon' ? 'console-card-soon' : ''}`}
            onClick={() => {
              if (product.url && product.status !== 'coming_soon') {
                window.open(product.url, '_blank')
              }
            }}
          >
            <div className="console-card-header">
              <div className="console-card-icon-wrap">
                <ProductIcon paths={product.icon} />
              </div>
              <StatusDot status={product.status} />
            </div>
            <h3 className="console-card-name">{product.name}</h3>
            <p className="console-card-desc">{product.description}</p>
            <div className="console-card-footer">
              <TierBadge tier={product.tier} />
              {product.status === 'coming_soon' ? (
                <span className="console-coming-soon">Coming Soon</span>
              ) : (
                <span className="console-launch">Launch &rarr;</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
