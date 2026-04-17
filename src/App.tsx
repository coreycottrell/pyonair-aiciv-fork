import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
// Witness extension registry — Witness-only routes layered on top of base portal
import { WITNESS_ROUTES } from './extensions'
import { AuthGuard } from './components/auth/AuthGuard'
import { ClaudeAuthFlow } from './components/auth/ClaudeAuthFlow'
import { AppShell } from './components/layout/AppShell'
import { ChatView } from './components/chat/ChatView'
import { CalendarView } from './components/calendar/CalendarView'
import { MailView } from './components/agentmail/MailView'
import { SettingsView } from './components/settings/SettingsView'
import { TerminalView } from './components/terminal/TerminalView'
import { TeamsView } from './components/teams/TeamsView'
import { BookmarksView } from './components/bookmarks/BookmarksView'
import { StatusView } from './components/status/StatusView'
import { ContextView } from './components/context/ContextView'
import OrgChartView from './components/agents/OrgChartView'
import { DocsView } from './components/docs/DocsView'
import { SheetsView } from './components/sheets/SheetsView'
import { PointsView } from './components/points/PointsView'
import { TriadView } from './components/triad/TriadView'
import { useIdentityStore } from './stores/identityStore'
import { useSettingsStore } from './stores/settingsStore'
import { apiGet } from './api/client'

/** Runs identity + status fetches only after auth succeeds */
function AuthenticatedApp() {
  const fetchIdentity = useIdentityStore(s => s.fetchIdentity)
  const fetchStatusInfo = useIdentityStore(s => s.fetchStatusInfo)

  useEffect(() => {
    fetchIdentity()
    fetchStatusInfo()
    const interval = setInterval(fetchStatusInfo, 30_000)
    return () => clearInterval(interval)
  }, [fetchIdentity, fetchStatusInfo])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ChatView />} />
        <Route path="/terminal" element={<TerminalView />} />
        <Route path="/teams" element={<TeamsView />} />
        <Route path="/orgchart" element={<OrgChartView />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/mail" element={<MailView />} />
        <Route path="/bookmarks" element={<BookmarksView />} />
        <Route path="/context" element={<ContextView />} />
        <Route path="/points" element={<PointsView />} />
        <Route path="/docs" element={<DocsView />} />
        <Route path="/sheets" element={<SheetsView />} />
        <Route path="/triad" element={<TriadView />} />
        <Route path="/status" element={<StatusView />} />
        <Route path="/settings" element={<SettingsView />} />
        {/* Witness extensions — lazy-loaded, only present in Witness's local build */}
        {WITNESS_ROUTES.map(r => {
          const Panel = lazy(r.component)
          return <Route key={r.path} path={r.path} element={<Suspense fallback={null}><Panel /></Suspense>} />
        })}
      </Route>
    </Routes>
  )
}

/** Inner app — has access to useNavigate (inside HashRouter) */
function AppInner() {
  const navigate = useNavigate()
  // null = still checking, true = needs auth, false = already authed
  const [needsClaudeAuth, setNeedsClaudeAuth] = useState<boolean | null>(null)

  useEffect(() => {
    apiGet<{ authenticated: boolean }>('/api/auth/status')
      .then(s => setNeedsClaudeAuth(!s.authenticated))
      .catch(() => setNeedsClaudeAuth(false)) // If check fails, don't block portal
  }, [])

  const handleAuthComplete = useCallback(() => {
    // Parent unmounts ClaudeAuthFlow — overlay gone instantly
    setNeedsClaudeAuth(false)
    // Navigate to terminal so human watches evolution
    navigate('/terminal')
  }, [navigate])

  return (
    <>
      {needsClaudeAuth && <ClaudeAuthFlow onComplete={handleAuthComplete} />}
      <AuthenticatedApp />
    </>
  )
}

export default function App() {
  const loadFromStorage = useSettingsStore(s => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <HashRouter>
      <Routes>
        {/* Triad page is public — no auth required */}
        <Route path="/triad" element={<TriadView />} />
        {/* Everything else requires auth */}
        <Route path="*" element={
          <AuthGuard>
            <AppInner />
          </AuthGuard>
        } />
      </Routes>
    </HashRouter>
  )
}
