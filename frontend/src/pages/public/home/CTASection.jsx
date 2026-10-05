import { Link } from 'react-router-dom'
import Button from '../../../components/common/Button'

export default function CTASection() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl rounded-3xl bg-brand-600 px-6 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to start your project?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Create a free account and submit your first request in minutes.
        </p>
        <Link to="/register" className="mt-6 inline-block">
          <Button size="lg" variant="secondary">Get started</Button>
        </Link>
      </div>
    </section>
  )
}