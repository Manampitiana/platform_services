import {
  Clock,
  FileCheck2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'

import Card from '../../../components/common/Card'
import FadeIn from '../../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../../components/motion/Stagger'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure and private',
    text: 'Your files are stored privately and only visible to you and our team. Every payment is checked by a person.',
    span: 'lg:col-span-2',
    featured: true,
  },
  {
    icon: Clock,
    title: 'Clear deadlines',
    text: 'Know the estimated delivery time before you commit.',
  },
  {
    icon: RefreshCw,
    title: 'Revisions included',
    text: 'Each package comes with revisions, tracked on your order.',
  },
  {
    icon: MessageSquare,
    title: 'One place to talk',
    text: 'Messages, files and quotes live inside your order, not in scattered chats.',
    span: 'lg:col-span-2',
  },
  {
    icon: FileCheck2,
    title: 'Quotes for custom work',
    text: 'Describe your project and receive a detailed quote before paying.',
  },
]

export default function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      {/* Header */}
      <FadeIn className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Built for peace of mind
        </h2>

        <p className="mt-2 text-slate-500">
          A professional process, from the first click to the final file.
        </p>
      </FadeIn>

      {/* Features */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(
          ({ icon: Icon, title, text, span = '', featured = false }) => (
            <StaggerItem
              key={title}
              className={`${span} h-full`}
            >
              <Card
                className={[
                  'h-full border transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-pop',
                  featured
                    ? '!border-brand-600 !bg-brand-600 !text-white'
                    : 'border-slate-200 bg-white text-slate-900',
                ].join(' ')}
              >
                {/* Icon */}
                <span
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-xl',
                    featured
                      ? 'bg-white/15 text-white'
                      : 'bg-brand-50 text-brand-600',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                </span>

                {/* Title */}
                <h3
                  className={[
                    'mt-5 text-lg font-semibold',
                    featured ? 'text-white' : 'text-slate-900',
                  ].join(' ')}
                >
                  {title}
                </h3>

                {/* Description */}
                <p
                  className={[
                    'mt-2 text-sm leading-relaxed',
                    featured ? 'text-white/80' : 'text-slate-500',
                  ].join(' ')}
                >
                  {text}
                </p>
              </Card>
            </StaggerItem>
          ),
        )}
      </Stagger>
    </section>
  )
}