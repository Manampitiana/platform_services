import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { usePageMeta } from '../../hooks/usePageMeta'
import { applyApiErrors } from '../../utils/applyApiErrors'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import PasswordInput from '../../components/common/PasswordInput'
import PasswordMatch from '../../components/common/PasswordMatch'
import PasswordStrength from '../../components/profile/PasswordStrength'

const schema = z
  .object({
    name: z.string().trim().min(2, 'Your name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((value) => value === true, 'You must accept the terms to continue'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export default function Register() {
  usePageMeta({ title: 'Create an account', description: 'Create your free account to order and track your projects.' })

  const { register: registerUser } = useAuth()
  const location = useLocation()
  const [globalError, setGlobalError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      terms: false,
    },
  })

  const password = watch('password')
  const confirmation = watch('password_confirmation')

  // Aorian'ny fisoratana anarana, ny GuestRoute no mitondra any amin'ny /verify-email
  const onSubmit = async (values) => {
    setGlobalError('')
    try {
      await registerUser(values)
    } catch (error) {
      if (!applyApiErrors(error, setError)) {
        setGlobalError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It's free and takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {globalError && (
        <div className="mb-4">
          <Alert tone="error">{globalError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          {!errors.password_confirmation && <PasswordMatch password={password} confirmation={confirmation} />}
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
              aria-invalid={!!errors.terms}
              {...register('terms')}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">
                Terms of service
              </Link>{' '}
              and the{' '}
              <Link to="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">
                Privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms.message}</p>}
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} leftIcon={UserPlus} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}