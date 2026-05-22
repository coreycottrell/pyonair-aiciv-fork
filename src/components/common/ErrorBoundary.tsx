import { Component, type ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Best-effort error report to portal server
    const token = localStorage.getItem('portal_token') || ''
    fetch('/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReport = () => {
    const { error } = this.state
    const token = localStorage.getItem('portal_token') || ''
    fetch('/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userReported: true,
      }),
    })
      .then(() => alert('Report sent. Our team will look into this.'))
      .catch(() => alert('Could not send report. Please try again later.'))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">!</div>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              We hit an unexpected issue. This has been logged automatically.
            </p>
            <div className="error-boundary-actions">
              <button className="error-boundary-btn primary" onClick={this.handleRetry}>
                Try Again
              </button>
              <button className="error-boundary-btn secondary" onClick={this.handleReport}>
                Report to Support
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
