import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { applyApiErrors } from '../../utils/applyApiErrors'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import PasswordInput from '../../components/common/PasswordInput'
import AuthLayout from '../../layouts/AuthLayout'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [globalError, setGlobalError] = useState('')


  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setGlobalError('')
    try {
      const user = await login(values)

      const from = location.state?.from
      const fallback = user.role === 'admin' ? '/admin' : '/dashboard'

      navigate(from ? `${from.pathname}${from.search}` : fallback, { replace: true })
    } catch (error) {
      if (!applyApiErrors(error, setError)) {
        setGlobalError('Something went wrong. Please try again.')
      }
    }
  }

  return (

    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track your orders."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {globalError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{globalError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} leftIcon={LogIn} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}