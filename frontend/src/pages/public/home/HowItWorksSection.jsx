import { CreditCard, FileEdit, PackageCheck, Search } from 'lucide-react'
import FadeIn from '../../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../../components/motion/Stagger'

const steps = [
  { icon: Search, title: 'Choose a service', text: 'Pick a CV, logo, website or a custom project.' },
  { icon: FileEdit, title: 'Fill in your brief', text: 'Answer a few questions and attach your files.' },
  { icon: CreditCard, title: 'Pay and we start', text: 'Fixed price, or accept a quote for custom work.' },
  { icon: PackageCheck, title: 'Review and receive', text: 'Request revisions, approve and download.' },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-slate-500">Four simple steps from idea to delivery.</p>
        </FadeIn>

        <Stagger className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-slate-200 lg:block" />

          {steps.map((step, i) => (
            <StaggerItem key={step.title} className="relative text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200">
                <step.icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm text-slate-500">{step.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}