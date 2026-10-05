import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { site } from '../../config/site'

export default function BrandLogo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <Rocket className="h-[18px] w-[18px]" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        {site.name}
      </span>
    </Link>
  )
}