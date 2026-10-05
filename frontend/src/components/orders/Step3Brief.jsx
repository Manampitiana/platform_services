import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import DynamicField from './DynamicField'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'

export default function Step3Brief({ fields, savedBrief, onBack, onSubmit }) {
    const briefFields = fields.filter((f) => f.type !== 'file')
    const [formError, setFormError] = useState('')

    const defaultValues = {
        brief: Object.fromEntries(
            briefFields.map((f) => [f.name, savedBrief?.[f.name] ?? (f.type === 'checkbox' ? false : '')])
        ),
    }

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues })

    const submit = async (values) => {
        setFormError('')
        try {
            await onSubmit(values.brief)
        } catch (error) {
            const applied = applyApiErrors(error, setError)
            if (!applied || error?.response?.data?.errors?.package) setFormError(getApiError(error))
        }
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Tell us about your project</h2>
                <p className="mt-1 text-sm text-slate-500">Fields marked with * are required.</p>
            </div>

            {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <div className="space-y-5">
                {briefFields.map((field) => (
                    <DynamicField
                        key={field.id}
                        field={field}
                        register={register}
                        error={errors.brief?.[field.name]?.message}
                    />
                ))}
            </div>

            <div className="flex justify-between">
                {onBack ? (
                    <Button type="button" variant="secondary" onClick={onBack}>
                        Back
                    </Button>
                ) : (
                    <span />
                )}
                <Button type="submit" loading={isSubmitting}>
                    Save and continue
                </Button>
            </div>
        </form>
    )
}