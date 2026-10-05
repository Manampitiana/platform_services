import { Link } from 'react-router-dom'
import Accordion from '../../../components/common/Accordion'
import FadeIn from '../../../components/motion/FadeIn'
import { faqs } from '../../../content/faq'

export default function FaqPreviewSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          <p className="mt-2 text-slate-500">
            Can't find your answer?{' '}
            <Link to="/contact" className="font-medium text-brand-600 hover:underline">Contact us</Link>
          </p>
        </FadeIn>

        <FadeIn>
          <Accordion items={faqs.slice(0, 5)} />
          <div className="mt-6 text-center">
            <Link to="/faq" className="text-sm font-semibold text-brand-600 hover:underline">
              See all questions
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}