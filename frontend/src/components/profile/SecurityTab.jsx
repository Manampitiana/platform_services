import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut } from 'lucide-react'
import { profileApi } from '../../api/profileApi'
import { useAuth } from '../../contexts/AuthContext'
import { useFlash } from '../../hooks/useFlash'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'
import Alert from '../common/Alert'
import Button from '../common/Button'
import Card from '../common/Card'
import PasswordInput from '../common/PasswordInput'
import FormCard from './FormCard'
import PasswordStrength from './PasswordStrength'

const schema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine((d) => d.password !== d.current_password, {
    message: 'Choose a password different from your current one',
    path: ['password'],
  })

function PasswordCard() {
  const [flash, setFlash] = useFlash()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const onSubmit = async (values) => {
    setFlash(null)
    try {
      await profileApi.updatePassword(values)
      reset()
      setFlash({ tone: 'success', text: 'Your password has been updated.' })
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFlash({ tone: 'error', text: getApiError(error) })
    }
  }

  return (
    <FormCard
      title="Password"
      description="Use a strong password that you do not use anywhere else."
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <p className="text-xs text-slate-500">At least 8 characters. Mix letters, numbers and symbols.</p>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Update password
          </Button>
        </>
      }
    >
      {flash && <Alert tone={flash.tone}>{flash.text}</Alert>}

      <PasswordInput
        label="Current password"
        autoComplete="current-password"
        error={errors.current_password?.message}
        {...register('current_password')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className='flex flex-col gap-2'>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={watch('password')} />
        </div>
        <div className='flex flex-col gap-2'>
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <PasswordStrength
            password={watch('password_confirmation')}
            confirmPassword={watch('password')}
            isConfirmation
          />
        </div>
      </div>

    </FormCard>
  )
}



function SessionCard() {
  const { logout } = useAuth()

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Sign out</p>
        <p className="text-sm text-slate-500">Sign out of your account on this device.</p>
      </div>
      <Button variant="secondary" size="sm" leftIcon={LogOut} onClick={logout}>
        Sign out
      </Button>
    </Card>
  )
}

export default function SecurityTab() {
  return (
    <>
      <PasswordCard />
      <SessionCard />
    </>
  )
}