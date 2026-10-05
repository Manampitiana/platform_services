import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { applyApiErrors } from '../../utils/applyApiErrors'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import PasswordInput from '../../components/common/PasswordInput'

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
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-slate-500">Sign in to track your orders.</p>
        </div>

        {globalError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{globalError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <PasswordInput
            label="Password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={isSubmitting} leftIcon={LogIn} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don't have an account??{' '}
          <Link to="/register" state={location.state} className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}