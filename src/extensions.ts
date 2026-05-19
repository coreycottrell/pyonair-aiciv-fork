/**
 * Pyonair Extension Registry
 *
 * This file declares all Pyonair-specific routes and sidebar items that are
 * layered on top of Synth's base portal. Keep this file as the SINGLE source
 * of truth for what Pyonair adds — makes upstream diffs clean.
 *
 * Pattern: Synth's App.tsx and Sidebar.tsx import from this file (3-5 line
 * patch each). We never modify Synth's component logic, only add to it.
 */

export interface PyonairRoute {
  path: string
  /** Dynamic import for code-splitting */
  component: () => Promise<{ default: React.ComponentType }>
}

export interface PyonairNavItem {
  to: string
  icon: string
  label: string
  /** Only show this nav item when WITNESS_MODE env var is set */
  witnessOnly: true
}

/** Routes Pyonair adds to App.tsx */
export const PYONAIR_ROUTES: PyonairRoute[] = [
  {
    path: '/pyonair/fleet',
    component: () => import('./components/pyonair/FleetPanel').then(m => ({ default: m.FleetPanel })),
  },
  {
    path: '/pyonair/margins',
    component: () => import('./components/pyonair/MarginPanel').then(m => ({ default: m.MarginPanel })),
  },
  {
    path: '/pyonair/alerts',
    component: () => import('./components/pyonair/AlertsPanel').then(m => ({ default: m.AlertsPanel })),
  },
]

/** Sidebar nav items Pyonair adds to Sidebar.tsx */
export const PYONAIR_NAV_ITEMS: PyonairNavItem[] = [
  { to: '/pyonair/fleet', icon: '🚢', label: 'Fleet', witnessOnly: true },
  { to: '/pyonair/margins', icon: '📈', label: 'Margins', witnessOnly: true },
  { to: '/pyonair/alerts', icon: '🔔', label: 'Alerts', witnessOnly: true },
]
