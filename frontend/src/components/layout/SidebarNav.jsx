import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import CountBadge from '../common/CountBadge'

const styles = {
  admin: {
    text: 'text-slate-400 hover:text-white',
    active: 'text-white',
    beam: 'rgba(255,255,255,0.14)',
    indicator: 'bg-white',
    title: 'text-slate-500',
    divider: 'border-slate-800',
    ring: 'ring-slate-950',
  },
  client: {
    text: 'text-slate-600 hover:text-slate-900',
    active: 'text-brand-700',
    beam: 'rgba(79,70,229,0.13)',
    indicator: 'bg-brand-600',
    title: 'text-slate-400',
    divider: 'border-slate-200',
    ring: 'ring-white',
  },
}

export default function SidebarNav({
  sections,
  variant,
  collapsed = false,
  idPrefix,
  onNavigate,
}) {
  const s = styles[variant]

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
      {sections.map((section, index) => (
        <div key={section.title} className="space-y-1">
          {collapsed ? (
            index > 0 && (
              <div className={`mx-2 mb-3 border-t ${s.divider}`} />
            )
          ) : (
            <p
              className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider ${s.title}`}
            >
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
                `relative flex items-center overflow-hidden whitespace-nowrap rounded-xl py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : 'gap-3 px-3'
                } ${isActive ? s.active : s.text}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <motion.span
                        layoutId={`${idPrefix}-torch`}
                        className="pointer-events-none absolute left-0 top-1/2 z-0 h-12 w-30 -translate-y-1/2"
                        style={{
                          clipPath: 'polygon(0 38%, 0 62%, 100% 100%, 100% 0)',
                          background: `linear-gradient(to right, ${s.beam}, transparent)`,
                          filter: 'blur(4px)',
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      />

                      <motion.span
                        layoutId={`${idPrefix}-light`}
                        className={`absolute left-0 top-1/2 z-20 h-6 w-1 -translate-y-1/2 rounded-full ${s.indicator}`}
                        style={{
                          boxShadow: '0 0 8px currentColor, 0 0 16px currentColor',
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      />
                    </>
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />

                  {!collapsed && (
                    <span className="relative z-10 truncate">
                      {label}
                    </span>
                  )}

                  {badge > 0 &&
                    (collapsed ? (
                      <span
                        className={`absolute right-2.5 top-2 z-20 h-2 w-2 rounded-full bg-red-500 ring-2 ${s.ring}`}
                      />
                    ) : (
                      <CountBadge
                        count={badge}
                        className="relative z-10 ml-auto"
                      />
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