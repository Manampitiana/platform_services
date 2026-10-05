import { CreditCard, FileEdit, PackageCheck, Search } from 'lucide-react'
import FadeIn from '../../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../../components/motion/Stagger'

const steps = [
  { icon: Search, title: 'Choose a service', text: 'Pick a CV, logo, website or a custom project.' },
  { icon: FileEdit, title: 'Fill in your brief', text: 'Answer a few questions and attach your files.' },
  { icon: CreditCard, title: 'Get a quote & pay', text: 'Review the price, accept and pay securely.' },
  { icon: PackageCheck, title: 'Receive your files', text: 'Track progress, request revisions and download.' },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-slate-500">Four simple steps from idea to delivery.</p>
        </FadeIn>

        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem key={step.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">
                Step {index + 1}
              </p>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}