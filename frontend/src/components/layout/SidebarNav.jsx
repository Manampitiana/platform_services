import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import CountBadge from '../common/CountBadge'

const styles = {
  admin: {
    text: 'text-slate-400 hover:text-white',
    active: 'text-white',
    pill: 'bg-white/10',
    title: 'text-slate-500',
    divider: 'border-slate-800',
    ring: 'ring-slate-950',
  },
  client: {
    text: 'text-slate-600 hover:text-slate-900',
    active: 'text-brand-700',
    pill: 'bg-brand-50',
    title: 'text-slate-400',
    divider: 'border-slate-200',
    ring: 'ring-white',
  },
}

export default function SidebarNav({ sections, variant, collapsed = false, idPrefix, onNavigate }) {
  const s = styles[variant]

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
      {sections.map((section, index) => (
        <div key={section.title} className="space-y-1">
          {collapsed ? (
            index > 0 && <div className={`mx-2 mb-3 border-t ${s.divider}`} />
          ) : (
            <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider ${s.title}`}>
              {section.title}
            </p>
          )}

          {section.items.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                `relative flex items-center whitespace-nowrap rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center' : 'gap-3 px-3'
                } ${isActive ? s.active : s.text}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={`${idPrefix}-pill`}
                      className={`absolute inset-0 rounded-xl ${s.pill}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="relative z-10 truncate">{label}</span>}
                  {badge > 0 &&
                    (collapsed ? (
                      <span className={`absolute right-2.5 top-2 z-10 h-2 w-2 rounded-full bg-red-500 ring-2 ${s.ring}`} />
                    ) : (
                      <CountBadge count={badge} className="relative z-10 ml-auto" />
                    ))}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}