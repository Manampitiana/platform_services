import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { profileApi } from '../../api/profileApi'
import { useAuth } from '../../contexts/AuthContext'
import { useFlash } from '../../hooks/useFlash'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'
import Alert from '../common/Alert'
import Button from '../common/Button'
import Input from '../common/Input'
import FormCard from './FormCard'
import { useToast } from '../../contexts/ToastContext'

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
})

const toValues = (u) => ({ name: u.name, email: u.email, phone: u.phone ?? '' })

export default function GeneralTab() {
  const { user, setUser } = useAuth()
  const [flash, setFlash] = useFlash()

  const toast = useToast()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toValues(user) })

  const onSubmit = async (values) => {
    setFlash(null)
    const emailChanged = values.email !== user.email

    try {
      const updated = await profileApi.update(values)
      setUser(updated)
      reset(toValues(updated)) // mamafa ny "unsaved changes"
      toast.success(
        emailChanged
          ? `Profile updated. We sent a verification link to ${updated.email}.`
          : 'Your profile has been updated.'
      )
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFlash({ tone: 'error', text: getApiError(error) })
    }
  }

  return (
    <FormCard
      title="Personal information"
      description="Update your name and how we can reach you."
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <p className="text-xs text-slate-500">
            {isDirty ? 'You have unsaved changes.' : 'Your information is up to date.'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
              Discard
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </>
      }
    >
      {flash && <Alert tone={flash.tone}>{flash.text}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          If you change your email, you will be asked to confirm the new address with a code.
        </p>
      </div>
    </FormCard>
  )
}