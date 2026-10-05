const levels = [
  {
    label: 'Too short',
    bar: 'bg-red-500',
    text: 'text-red-600',
  },
  {
    label: 'Weak',
    bar: 'bg-amber-500',
    text: 'text-amber-600',
  },
  {
    label: 'Fair',
    bar: 'bg-blue-500',
    text: 'text-blue-600',
  },
  {
    label: 'Good',
    bar: 'bg-emerald-400',
    text: 'text-emerald-600',
  },
  {
    label: 'Strong',
    bar: 'bg-emerald-600',
    text: 'text-emerald-700',
  },
]

function score(password) {
  if (!password) return 0

  /*
   * 1. Longueur
   */
  const hasMinLength = password.length >= 8

  /*
   * 2. Uppercase + lowercase
   */
  const hasLetters =
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)

  /*
   * 3. Number
   */
  const hasNumber = /\d/.test(password)

  /*
   * 4. Special character
   */
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  /*
   * Latsaky ny 4 caractères
   */
  if (password.length < 4) {
    return 1
  }

  /*
   * Efa misy longueur kely
   * fa mbola tsy 8 caractères
   */
  if (!hasMinLength) {
    if (hasSpecial) return 3
    return 2
  }

  /*
   * 8+ caractères
   */
  let points = 2

  if (hasLetters) {
    points++
  }

  if (hasNumber) {
    points++
  }

  if (hasSpecial) {
    points++
  }

  return Math.min(points, 4)
}

export default function PasswordStrength({
  password = '',
  confirmPassword = '',
  isConfirmation = false,
}) {
  /*
   * =========================
   * CONFIRM PASSWORD
   * =========================
   */
  if (isConfirmation) {
    if (!password) return null

    const isMatch = password === confirmPassword

    return (
      <div
        className="space-y-1.5"
        aria-live="polite"
      >
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={`h-1 flex-1 rounded-full transition-colors ${
                isMatch
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            />
          ))}
        </div>

        <p
          className={`text-xs font-medium ${
            isMatch
              ? 'text-emerald-600'
              : 'text-red-600'
          }`}
        >
          {isMatch
            ? 'Passwords match'
            : 'Passwords do not match'}
        </p>
      </div>
    )
  }

  /*
   * =========================
   * PASSWORD STRENGTH
   * =========================
   */

  if (!password) return null

  const level = score(password)

  const {
    label,
    bar,
    text,
  } = levels[level]

  return (
    <div
      className="space-y-1.5"
      aria-live="polite"
    >
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${
              segment <= level
                ? bar
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <p className={`text-xs font-medium ${text}`}>
        {label}
      </p>
    </div>
  )
}