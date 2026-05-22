import { useState, useEffect, useRef, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'
import { useIdentityStore } from '../../stores/identityStore'
import { toggleBoop } from '../../api/settings'
import { apiGet, apiPut, apiFetch } from '../../api/client'
import { cn } from '../../utils/cn'
import type { Theme } from '../../types/settings'
import './SettingsView.css'

interface Branding {
  display_name: string
  logo_url: string
  platform: string
}

export function SettingsView() {
  const { theme, setTheme, quickfirePills, setQuickfirePills, boopEnabled, setBoopEnabled } = useSettingsStore()
  const { logout } = useAuthStore()
  const { civName, humanName, status } = useIdentityStore()
  const [branding, setBranding] = useState<Branding>({ display_name: '', logo_url: '', platform: '' })
  const [brandName, setBrandName] = useState('')
  const [brandSaving, setBrandSaving] = useState(false)
  const [brandMsg, setBrandMsg] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiGet<Branding>('/api/branding').then(b => {
      setBranding(b)
      setBrandName(b.display_name || '')
    }).catch(() => {})
  }, [])

  const handleBrandNameSave = useCallback(async () => {
    setBrandSaving(true)
    setBrandMsg('')
    try {
      await apiPut('/api/branding', { display_name: brandName })
      setBranding(prev => ({ ...prev, display_name: brandName }))
      setBrandMsg('Saved')
      setTimeout(() => setBrandMsg(''), 2000)
    } catch {
      setBrandMsg('Error saving')
    }
    setBrandSaving(false)
  }, [brandName])

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setBrandMsg('File too large (max 2MB)')
      return
    }
    setLogoUploading(true)
    setBrandMsg('')
    try {
      const form = new FormData()
      form.append('logo', file)
      const token = localStorage.getItem('pyonair-portal-token') || localStorage.getItem('aiciv-portal-token')
      const res = await fetch('/api/branding/logo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      const data = await res.json()
      if (data.ok) {
        setBranding(prev => ({ ...prev, logo_url: data.logo_url }))
        setBrandMsg('Logo updated')
        setTimeout(() => setBrandMsg(''), 2000)
      } else {
        setBrandMsg(data.error || 'Upload failed')
      }
    } catch {
      setBrandMsg('Upload failed')
    }
    setLogoUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const handleThemeToggle = (t: Theme) => {
    setTheme(t)
  }

  const handleBoopToggle = async () => {
    const next = !boopEnabled
    try {
      await toggleBoop(next)
      setBoopEnabled(next)
    } catch {
      // silently fail
    }
  }

  const handleRemovePill = (pill: string) => {
    setQuickfirePills(quickfirePills.filter(p => p !== pill))
  }

  const handleAddPill = () => {
    const val = prompt('Enter quickfire message:')
    if (val?.trim() && !quickfirePills.includes(val.trim())) {
      setQuickfirePills([...quickfirePills, val.trim()])
    }
  }

  return (
    <div className="settings-view">
      <h2 className="settings-title">Settings</h2>

      <section className="settings-section">
        <h3>Identity</h3>
        <div className="settings-info">
          <div className="settings-row">
            <span className="settings-label">CIV Name</span>
            <span className="settings-value">{civName || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Human Name</span>
            <span className="settings-value">{humanName || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">{status?.version || '—'}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Branding</h3>
        <div className="branding-preview">
          <div className="branding-logo-box">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="branding-logo-img" />
            ) : (
              <span className="branding-logo-placeholder">No logo</span>
            )}
          </div>
          <div className="branding-controls">
            <button
              className="branding-upload-btn"
              onClick={() => fileRef.current?.click()}
              disabled={logoUploading}
            >
              {logoUploading ? 'Uploading...' : 'Upload Logo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <span className="branding-hint">SVG or PNG, max 2MB</span>
          </div>
        </div>
        <div className="branding-name-row">
          <label className="settings-label" htmlFor="brand-name">Display Name</label>
          <div className="branding-name-input-group">
            <input
              id="brand-name"
              type="text"
              className="branding-name-input"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Your Company Name"
            />
            <button
              className="branding-save-btn"
              onClick={handleBrandNameSave}
              disabled={brandSaving || brandName === branding.display_name}
            >
              {brandSaving ? '...' : 'Save'}
            </button>
          </div>
        </div>
        {brandMsg && <p className="branding-msg">{brandMsg}</p>}
      </section>

      <section className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-row">
          <span className="settings-label">Theme</span>
          <span className="settings-value">Pyonair White</span>
        </div>
      </section>

      <section className="settings-section">
        <h3>BOOP</h3>
        <div className="settings-row">
          <span className="settings-label">Background tasks</span>
          <button
            className={cn('boop-toggle', boopEnabled && 'boop-toggle-on')}
            onClick={handleBoopToggle}
          >
            <span className="boop-toggle-thumb" />
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Quick Fire Messages</h3>
        <div className="pill-list">
          {quickfirePills.map((pill, i) => (
            <span key={`${i}-${pill}`} className="pill-item">
              {pill}
              <button className="pill-remove" onClick={() => handleRemovePill(pill)}>&times;</button>
            </span>
          ))}
          <button className="pill-add" onClick={handleAddPill}>+ Add</button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Resources</h3>
        <div className="settings-links">
          <a href="https://pyonair.com" target="_blank" rel="noopener noreferrer" className="settings-link">
            Pyonair Platform
          </a>
          <a href="https://pyonair.com/blog" target="_blank" rel="noopener noreferrer" className="settings-link">
            Pyonair Chronicles (Blog)
          </a>
        </div>
      </section>

      <section className="settings-section">
        <button className="settings-logout" onClick={logout}>
          Logout
        </button>
      </section>
    </div>
  )
}
