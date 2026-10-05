import { Clock, MessageSquare, ShieldCheck } from 'lucide-react'
import Card from '../../../components/common/Card'

const reasons = [
  { icon: ShieldCheck, title: 'Secure & private', text: 'Your files and payments are protected and only visible to you.' },
  { icon: Clock, title: 'Clear deadlines', text: 'Know the estimated delivery time before you commit.' },
  { icon: MessageSquare, title: 'Direct communication', text: 'Chat about your order and share files in one place.' },
]

export default function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Why choose us</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {reasons.map((r) => (
          <Card key={r.title}>
            <r.icon className="h-6 w-6 text-brand-600" />
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{r.text}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}