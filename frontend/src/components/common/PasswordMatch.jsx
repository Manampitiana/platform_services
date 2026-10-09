import { Check, X } from 'lucide-react'

// Aseho rehefa vita ny fanoratana (tsy mampiseho diso mandritra ny fanoratana)
export default function PasswordMatch({ password = '', confirmation = '' }) {
  if (!confirmation || confirmation.length < password.length) return null

  const match = password === confirmation

  return (
    <p
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs font-medium ${match ? 'text-emerald-600' : 'text-red-600'}`}
    >
      {match ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {match ? 'Passwords match' : 'Passwords do not match'}
    </p>
  )
}