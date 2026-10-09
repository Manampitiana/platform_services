import { Component } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Button from './Button'

// Fichier JS tsy hita intsony aorian'ny déploiement vaovao
const CHUNK_ERROR = /dynamically imported module|importing a module script failed|loading chunk|loading css chunk/i

function Fallback({ error, fullScreen }) {
  const chunk = CHUNK_ERROR.test(String(error?.message ?? error))

  return (
    <div
      role="alert"
      className={`flex items-center justify-center px-4 ${fullScreen ? 'min-h-screen' : 'py-16'}`}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </span>

        <h1 className="mt-4 text-xl font-bold tracking-tight">
          {chunk ? 'A new version is available' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {chunk
            ? 'Reload the page to get the latest version.'
            : 'An unexpected error occurred. Reloading the page usually fixes it.'}
        </p>

        {import.meta.env.DEV && !chunk && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-red-700">
            {String(error?.stack ?? error)}
          </pre>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button leftIcon={RefreshCw} onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <a href="/">
            <Button variant="secondary" leftIcon={Home} className="w-full">
              Back to home
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

class Boundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  // Averina ho tsara rehefa miova pejy
  componentDidUpdate(previous) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return <Fallback error={this.state.error} fullScreen={this.props.fullScreen} />
    }

    return this.props.children
  }
}

export default function ErrorBoundary({ children, fullScreen = false }) {
  const { pathname } = useLocation()

  return (
    <Boundary resetKey={pathname} fullScreen={fullScreen}>
      {children}
    </Boundary>
  )
}