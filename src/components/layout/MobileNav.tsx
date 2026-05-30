import { useState, useCallback, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useMailStore } from '../../stores/mailStore'
import { cn } from '../../utils/cn'
import './MobileNav.css'

/* ── SVG line icons (matching sidebar) ── */
const S = { w: 20, h: 20, s: 'none', sw: 1.8, lc: 'round' as const, lj: 'round' as const }
const icon = (d: string) => (
  <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill={S.s} stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d={d}/></svg>
)
const icon2 = (...paths: string[]) => (
  <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill={S.s} stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}>{paths.map((d,i)=><path key={i} d={d}/>)}</svg>
)

/* ── Icons — exact same set as Sidebar for consistency ── */
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
  memory: icon2('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 8v8', 'M8 12h8'),
  docs: icon2('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'),
  data: icon2('M18 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z', 'M4 9h16', 'M4 15h16', 'M10 3v18'),
  coordination: icon2('M13 2L3 14h9l-1 8 10-12h-9l1-8'),
  fleet: icon2('M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'),
  financials: icon2('M12 1v22', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'),
  alerts: icon2('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'),
  more: icon2('M3 12h18', 'M3 6h18', 'M3 18h18'),
  close: icon2('M18 6L6 18', 'M6 6l12 12'),
}

interface NavItem { to: string; iconKey: string; label: string }

/* Bottom bar: most-used items */
const PRIMARY_ITEMS: NavItem[] = [
  { to: '/', iconKey: 'chat', label: 'AI Chat' },
  { to: '/teamchat', iconKey: 'teamchat', label: 'Team AI' },
  { to: '/mail', iconKey: 'mail', label: 'Mail' },
  { to: '/calendar', iconKey: 'calendar', label: 'Calendar' },
]

/* More menu: exact order per Jord's directive (no admin on mobile) */
const MORE_ITEMS: NavItem[] = [
  { to: '/bookmarks', iconKey: 'hub', label: 'Hub' },
  { to: '/settings', iconKey: 'settings', label: 'Settings' },
  { to: '/status', iconKey: 'status', label: 'Status' },
  { to: '/guide', iconKey: 'guide', label: 'Guide' },
  { to: '/teams', iconKey: 'liveview', label: 'Live View' },
  { to: '/context', iconKey: 'memory', label: 'Memory' },
  { to: '/docs', iconKey: 'docs', label: 'Documents' },
  { to: '/sheets', iconKey: 'data', label: 'Data' },
]

export function MobileNav() {
  const unreadCount = useMailStore(s => s.unreadCount)
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()

  const handleMoreItem = useCallback((to: string) => {
    navigate(to)
    setMoreOpen(false)
  }, [navigate])

  return (
    <>
      {/* Overlay */}
      {moreOpen && (
        <div className="mobile-more-overlay" onClick={() => setMoreOpen(false)} />
      )}

      {/* Slide-up sheet */}
      {moreOpen && (
        <div className="mobile-more-sheet">
          <div className="mobile-more-handle" />
          <div className="mobile-more-grid">
            {MORE_ITEMS.map(item => (
              <button
                key={item.to}
                className="mobile-more-item"
                onClick={() => handleMoreItem(item.to)}
                type="button"
              >
                <span className="mobile-more-icon">{ICONS[item.iconKey]}</span>
                <span className="mobile-more-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="mobile-nav">
        {PRIMARY_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn('mobile-nav-item', isActive && 'mobile-nav-active')}
            onClick={() => setMoreOpen(false)}
          >
            <span className="mobile-nav-icon">
              {ICONS[item.iconKey]}
              {item.to === '/mail' && unreadCount > 0 && (
                <span className="mobile-nav-badge">{unreadCount}</span>
              )}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <button
          className={cn('mobile-nav-item', 'mobile-nav-more-btn', moreOpen && 'mobile-nav-active')}
          onClick={() => setMoreOpen(o => !o)}
          type="button"
        >
          <span className="mobile-nav-icon">{moreOpen ? ICONS.close : ICONS.more}</span>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>
    </>
  )
}
