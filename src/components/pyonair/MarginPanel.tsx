/**
 * MarginPanel — Pyonair-only revenue / margin tracking
 *
 * Shows per-CIV margin data from margin-corey.json and margin-primary.json.
 * Data sourced from /api/pyonair/margins (witness_extensions.py).
 */
import { useEffect, useState } from 'react'

interface MarginEntry {
  civ_name: string
  human_name: string
  subscription_amount: number
  cost_estimate: number
  margin: number
  margin_pct: number
}

export function MarginPanel() {
  const [entries, setEntries] = useState<MarginEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState<{ revenue: number; cost: number; margin: number } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('pyonair-portal-token')
    fetch('/api/pyonair/margins', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error(`Margins API returned ${r.status}`)
        return r.json()
      })
      .then(data => {
        setEntries(data.entries ?? [])
        setTotals(data.totals ?? null)
        setLoading(false)
      })
      .catch(err => {
        setError(String(err))
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="witness-panel">Loading margins...</div>
  if (error) return <div className="witness-panel witness-panel--error">Margin error: {error}</div>

  return (
    <div className="witness-panel">
      <h2 className="witness-panel__title">Margins</h2>
      {totals && (
        <div className="witness-totals">
          <span>Revenue: <strong>${totals.revenue.toFixed(2)}</strong></span>
          <span>Cost: <strong>${totals.cost.toFixed(2)}</strong></span>
          <span>Margin: <strong>${totals.margin.toFixed(2)}</strong></span>
        </div>
      )}
      <table className="witness-table">
        <thead>
          <tr>
            <th>CIV</th>
            <th>Human</th>
            <th>Revenue</th>
            <th>Cost</th>
            <th>Margin</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.civ_name}>
              <td>{e.civ_name}</td>
              <td>{e.human_name}</td>
              <td>${e.subscription_amount.toFixed(2)}</td>
              <td>${e.cost_estimate.toFixed(2)}</td>
              <td className={e.margin >= 0 ? 'witness-positive' : 'witness-negative'}>
                ${e.margin.toFixed(2)}
              </td>
              <td>{e.margin_pct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
