export default function Card({ children, className = '', padded = true, ...props }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-card ${
        padded ? 'p-4 sm:p-6' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}