import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { site } from '../../config/site'
import BrandLogo from '../common/BrandLogo'

const columns = [
  {
    title: 'Services',
    links: [
      { to: '/services/cv-design', label: 'CV design' },
      { to: '/services/logo-design', label: 'Logo design' },
      { to: '/services/website-creation', label: 'Website creation' },
      { to: '/services/custom-project', label: 'Custom project' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
      { to: '/register', label: 'Create an account' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms', label: 'Terms of service' },
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/refunds', label: 'Refund policy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <BrandLogo light />
          <p className="max-w-xs text-sm leading-relaxed">{site.tagline}</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-white">{site.phone}</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {site.address}</li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <p>{site.hours}</p>
        </div>
      </div>
    </footer>
  )
}