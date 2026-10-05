import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'


export default function NotFound() {
  usePageMeta({ title: 'Page not found', noindex: true })

  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/"><Button>Back to home</Button></Link>
            <Link to="/services"><Button variant="secondary">Browse services</Button></Link>
          </div>
        }
      />
    </div>
  )
}