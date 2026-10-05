import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { contactApi } from '../../api/contactApi'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import FadeIn from '../../components/motion/FadeIn'
import PageHero from '../../components/public/PageHero'
import { site } from '../../config/site'
import { usePageMeta } from '../../hooks/usePageMeta'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'

const SUBJECTS = ['General question', 'Order or quote', 'Payment', 'Partnership', 'Other']

const schema = z.object({
  name: z.string().trim().min(2, 'Your name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  subject: z.string().min(1, 'Please choose a subject'),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(3000, 'Message is too long'),
  website: z.string().optional(), // honeypot
})

const info = [
  { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}` },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: `https://wa.me/${site.whatsapp}` },
  { icon: MapPin, label: 'Address', value: site.address },
  { icon: Clock, label: 'Opening hours', value: site.hours },
]

export default function Contact() {
  usePageMeta({ title: 'Contact', description: `Contact the ${site.name} team. We usually reply within one business day.` })

  const [sent, setSent] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
  })

  const onSubmit = async (values) => {
    setGlobalError('')
    try {
      await contactApi.send(values)
      reset()
      setSent(true)
    } catch (error) {
      if (error?.response?.status === 429) {
        setGlobalError('You have sent several messages in a short time. Please try again in a few minutes.')
      } else if (!applyApiErrors(error, setError)) {
        setGlobalError(getApiError(error))
      }
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Ask a question or tell us about your project. We usually reply within one business day."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <FadeIn>
          <Card className="space-y-5">
            {sent ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="mt-4 text-2xl font-bold">Message sent</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Thank you! We will get back to you at the email address you provided.
                </p>
                <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">Send us a message</h2>
                  <p className="text-sm text-slate-500">All fields are required.</p>
                </div>

                {globalError && <Alert tone="error">{globalError}</Alert>}

                {/* Honeypot: nafenina amin'ny olombelona */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                </div>

                <Select
                  label="Subject"
                  placeholder="Choose a subject"
                  options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <Textarea label="Message" rows={6} error={errors.message?.message} {...register('message')} />

                <Button type="submit" size="lg" loading={isSubmitting} leftIcon={Send} className="w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            )}
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="space-y-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Contact details</h2>
            <ul className="space-y-4">
              {info.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="break-words text-sm font-medium hover:text-brand-600"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      </div>
    </>
  )
}