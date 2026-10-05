import { useRef } from 'react'

export default function OtpInput({ value, onChange, onComplete, length = 6, disabled = false, error = false }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const update = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
  }

  const handleChange = (i, e) => {
    const typed = e.target.value.replace(/\D/g, '')
    if (!typed) return

    // Tsy mamela banga eo anelanelan'ny isa
    const pos = Math.min(i, value.length)
    const chars = value.split('')
    typed.split('').forEach((digit, k) => {
      chars[pos + k] = digit
    })

    update(chars.join(''))
    focus(pos + typed.length)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) {
        update(value.slice(0, i) + value.slice(i + 1))
      } else if (i > 0) {
        update(value.slice(0, i - 1) + value.slice(i))
        focus(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      focus(i + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    update(text)
    focus(text.replace(/\D/g, '').length)
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digit}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-10 rounded-xl border bg-white text-center text-xl font-semibold tabular-nums outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60 sm:h-14 sm:w-12 ${
            error ? 'border-red-400' : 'border-slate-300'
          }`}
        />
      ))}
    </div>
  )
}