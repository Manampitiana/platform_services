import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <Rocket className="h-5 w-5 text-brand-600" />
            DigitalHub
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Professional CVs, logos and websites, ordered and tracked in one place.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/services" className="hover:text-brand-600">Services</Link></li>
            <li><Link to="/register" className="hover:text-brand-600">Create an account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>contact@digitalhub.mg</li>
            <li>Antananarivo, Madagascar</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} DigitalHub. All rights reserved.
      </div>
    </footer>
  )
}