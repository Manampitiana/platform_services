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

          <p className="max-w-xs text-sm leading-relaxed">
            {site.tagline}
          </p>

          <ul className="space-y-1 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="group relative flex items-center gap-2 overflow-hidden rounded-lg px-2 py-2 transition-colors hover:text-white"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 z-0 w-48 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="relative z-10">
                  <Mail className="h-4 w-4 shrink-0 group-hover:text-brand-400" />
                </span>
                <span className="relative z-10">{site.email}</span>
              </a>
            </li>

            <li>
              <a
                href={`tel:${site.phone.replace(/\s/g, '')}`}
                className="group relative flex items-center gap-2 overflow-hidden rounded-lg px-2 py-2 transition-colors hover:text-white"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 z-0 w-48 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                 
                />
                <span className="relative z-10">
                  <Phone className="h-4 w-4 shrink-0 group-hover:text-brand-400" />
                </span>
                <span className="relative z-10">{site.phone}</span>
              </a>
            </li>

            <li>
              <div className="flex items-center gap-2 px-2 py-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{site.address}</span>
              </div>
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="px-2 text-sm font-semibold text-white">
              {col.title}
            </h4>

            <ul className="mt-3 space-y-1">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group relative flex items-center overflow-hidden rounded-lg px-2 py-2 text-sm transition-colors duration-200 hover:text-white"
                  >
                    {/* Torch beam */}
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        clipPath:
                          'polygon(0 40%, 0 60%, 100% 100%, 100% 0)',
                        background:
                          'linear-gradient(to right, rgba(99,102,241,.18), rgba(99,102,241,.08), transparent)',
                        filter: 'blur(3px)',
                      }}
                    />

                    {/* Light source */}
                    <span
                      className="pointer-events-none absolute left-0 top-1/2 z-20 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{
                        boxShadow:
                          '0 0 7px currentColor, 0 0 14px currentColor',
                      }}
                    />

                    <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>

          <p>{site.hours}</p>
        </div>
      </div>
    </footer>
  )
}