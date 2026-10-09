import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { AuthProvider } from './contexts/AuthContext'
import { ConfirmProvider } from './contexts/ConfirmContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                <ErrorBoundary fullScreen>
                  <App />
                </ErrorBoundary>
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MotionConfig>
  </StrictMode>
)