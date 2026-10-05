import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')

  const [done, setDone] = useState(false)
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
      await authApi.resetPassword({ token, email, ...values })
      setDone(true)
    } catch (error) {
      // Erreur "password" → eo ambanin'ny champ; ny sisa (lien tsy mety) → hafatra ambony
      if (error?.response?.data?.errors?.password) applyApiErrors(error, setError)
      else setGlobalError(getApiError(error))
    }
  }

  if (!token || !email) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invalid link</h1>
          <p className="text-sm text-slate-500">This password reset link is invalid or incomplete.</p>
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:underline">
            Request a new link
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-5">
        {done ? (
          <>
            <h1 className="text-2xl font-bold">Password updated</h1>
            <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
            <Link to="/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold">Choose a new password</h1>
              <p className="text-sm text-slate-500">For {email}</p>
            </div>

            {globalError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {globalError}{' '}
                <Link to="/forgot-password" className="font-medium underline">
                  Request a new link
                </Link>
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New password"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm new password"
                type="password"
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />
              <Button type="submit" loading={isSubmitting} leftIcon={KeyRound} className="w-full">
                Reset password
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}