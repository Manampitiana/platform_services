import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { applyApiErrors } from '../../utils/applyApiErrors'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import PasswordInput from '../../components/common/PasswordInput'
import PasswordStrength from '../../components/profile/PasswordStrength'

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [globalError, setGlobalError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setGlobalError('')
    try {
      await registerUser(values)
      const from = location.state?.from
      navigate(from ? `${from.pathname}${from.search}` : '/dashboard', { replace: true })
    } catch (error) {
      if (!applyApiErrors(error, setError)) {
        setGlobalError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-slate-500">It's free and takes less than a minute.</p>
        </div>

        {globalError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{globalError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone (nullable)" error={errors.phone?.message} {...register('phone')} />
          <PasswordInput
            label="Password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={watch('password')} />
          <PasswordInput
            label="Confirm password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <PasswordStrength
            password={watch('password_confirmation')}
            confirmPassword={watch('password')}
            isConfirmation
          />
          <Button type="submit" loading={isSubmitting} leftIcon={UserPlus} className="w-full">
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}