import { Check } from 'lucide-react'

export default function OrderStepper({ steps, current }) {
  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <ol className="mb-8 flex items-center">
      {steps.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  done
                    ? 'bg-brand-600 text-white'
                    : active
                      ? 'border-2 border-brand-600 text-brand-600'
                      : 'border border-slate-300 text-slate-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  active ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-3 h-px flex-1 ${done ? 'bg-brand-600' : 'bg-slate-300'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}