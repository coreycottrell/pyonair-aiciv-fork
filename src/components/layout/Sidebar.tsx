import { useState, useEffect, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useMailStore } from '../../stores/mailStore'
import { useBookmarkStore } from '../../stores/bookmarkStore'
import { cn } from '../../utils/cn'
import './Sidebar.css'

/* ── SVG line icons matching Pyonair brand ── */
const S = { w: 20, h: 20, s: 'none', sw: 1.8, lc: 'round' as const, lj: 'round' as const }
const icon = (d: string) => (
  <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill={S.s} stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d={d}/></svg>
)
const icon2 = (...paths: string[]) => (
  <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill={S.s} stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}>{paths.map((d,i)=><path key={i} d={d}/>)}</svg>
)

const ICONS: Record<string, ReactNode> = {
  chat: icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'),
  teamchat: icon2('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'),
  calendar: icon2('M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'),
  mail: icon2('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'),
  console: icon2('M4 17l6-6-6-6', 'M12 19h8'),
  hub: icon2('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'),
  settings: icon2('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'),
  status: icon2('M22 12h-4l-3 9L9 3l-3 9H2'),
  guide: icon2('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'),
  liveview: icon2('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'),
  bookmarks: icon('M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'),
  memory: icon2('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 8v8', 'M8 12h8'),
  scorecard: icon2('M18 20V10', 'M12 20V4', 'M6 20v-6'),
  docs: icon2('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'),
  data: icon2('M18 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z', 'M4 9h16', 'M4 15h16', 'M10 3v18'),
  coordination: icon2('M13 2L3 14h9l-1 8 10-12h-9l1-8'),
  fleet: icon2('M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'),
  financials: icon2('M12 1v22', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'),
  alerts: icon2('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'),
}

interface NavItem { to: string; iconKey: string; label: string }

const SECTION_1: NavItem[] = [
  { to: '/', iconKey: 'chat', label: 'AI Chat' },
  { to: '/teamchat', iconKey: 'teamchat', label: 'Team AI Chat' },
  { to: '/calendar', iconKey: 'calendar', label: 'Calendar' },
  { to: '/mail', iconKey: 'mail', label: 'Agent Mail' },
  { to: '/terminal', iconKey: 'console', label: 'Console' },
  { to: '/bookmarks', iconKey: 'hub', label: 'Hub' },
  { to: '/settings', iconKey: 'settings', label: 'Settings' },
  { to: '/status', iconKey: 'status', label: 'Status' },
  { to: '/guide', iconKey: 'guide', label: 'Guide' },
]

const SECTION_2: NavItem[] = [
  { to: '/teams', iconKey: 'liveview', label: 'Live View' },
  { to: '/context', iconKey: 'memory', label: 'Memory' },
  { to: '/docs', iconKey: 'docs', label: 'Documents' },
  { to: '/sheets', iconKey: 'data', label: 'Data' },
]

const SECTION_3_ADMIN: NavItem[] = [
  { to: '/pyonair/fleet', iconKey: 'fleet', label: 'Fleet' },
  { to: '/pyonair/margins', iconKey: 'financials', label: 'Financials' },
  { to: '/pyonair/alerts', iconKey: 'alerts', label: 'Alerts' },
]

const ADMIN_PORTALS = ['forge', 'apex', 'meridian']

function isAdminPortal(): boolean {
  const host = window.location.hostname.toLowerCase()
  return ADMIN_PORTALS.some(p => host.includes(p))
}

export function Sidebar() {
  const unreadCount = useMailStore(s => s.unreadCount)
  const bookmarkCount = useBookmarkStore(s => s.bookmarks.length)
  const showAdmin = isAdminPortal()
  const [installDismissed, setInstallDismissed] = useState(() =>
    localStorage.getItem('install-banner-dismissed') === 'true'
  )
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (result.outcome === 'accepted') dismissInstall()
    } else {
      // Fallback: guide user to browser's native install
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        alert('To install: tap the Share button in Safari, then "Add to Home Screen"')
      } else {
        alert('To install: open the browser menu (three dots) and select "Install app" or "Add to Home Screen"')
      }
    }
  }

  const dismissInstall = () => {
    setInstallDismissed(true)
    localStorage.setItem('install-banner-dismissed', 'true')
  }

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
    >
      <span className="sidebar-icon">{ICONS[item.iconKey]}</span>
      <span className="sidebar-label">{item.label}</span>
      {item.to === '/mail' && unreadCount > 0 && (
        <span className="sidebar-badge">{unreadCount}</span>
      )}
      {item.to === '/bookmarks' && bookmarkCount > 0 && (
        <span className="sidebar-badge">{bookmarkCount}</span>
      )}
    </NavLink>
  )

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          {SECTION_1.map(renderLink)}
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-section">
          {SECTION_2.map(renderLink)}
        </div>
        {showAdmin && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section sidebar-section-admin">
              <span className="sidebar-section-label">Admin</span>
              {SECTION_3_ADMIN.map(renderLink)}
            </div>
          </>
        )}
      </nav>
      {!installDismissed && (
        <div className="sidebar-install-banner">
          <div className="sidebar-install-text">
            <strong>Install Pyonair</strong>
            <span>Get the app for quick access</span>
          </div>
          <button className="sidebar-install-btn" onClick={handleInstall} type="button">Install</button>
          <button className="sidebar-install-dismiss" onClick={dismissInstall} type="button">&times;</button>
        </div>
      )}
      <div className="sidebar-footer">
        <a href="https://pyonair.com" target="_blank" rel="noopener noreferrer" className="sidebar-powered">
          Powered by <strong>Pyonair</strong>
        </a>
      </div>
    </aside>
  )
}
