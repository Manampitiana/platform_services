import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import ScrollToTop from '../components/common/ScrollToTop'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { Suspense } from 'react'

import ErrorBoundary from '../components/common/ErrorBoundary'
import Loader from '../components/common/Loader'

export default function PublicLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-pop focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <ScrollToTop />
      <Navbar />

      <main id="main" className="flex-1">
        <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}