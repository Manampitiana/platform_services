import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState('')
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
      await authApi.forgotPassword(values)
      setSentTo(values.email)
    } catch (error) {
      if (!applyApiErrors(error, setError)) setGlobalError(getApiError(error))
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-5">
        {sentTo ? (
          <>
            <h1 className="text-2xl font-bold">Check your inbox</h1>
            <p className="text-sm text-slate-500">
              If an account exists for <span className="font-medium text-slate-700">{sentTo}</span>,
              we have sent a link to reset your password. The link expires in 60 minutes.
            </p>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold">Forgot your password?</h1>
              <p className="text-sm text-slate-500">
                Enter your email and we will send you a reset link.
              </p>
            </div>

            {globalError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{globalError}</p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Button type="submit" loading={isSubmitting} leftIcon={Mail} className="w-full">
                Send reset link
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}