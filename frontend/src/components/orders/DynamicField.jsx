import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'

const toOption = (o) => (typeof o === 'string' ? { value: o, label: o } : o)

export default function DynamicField({ field, register, error }) {
  const name = `brief.${field.name}`
  const label = field.is_required ? `${field.label} *` : field.label
  const rules = field.is_required ? { required: `${field.label} is required` } : {}
  const options = (field.options ?? []).map(toOption)

  let control

  switch (field.type) {
    case 'textarea':
      control = (
        <Textarea label={label} placeholder={field.placeholder ?? ''} error={error} {...register(name, rules)} />
      )
      break

    case 'select':
      control = <Select label={label} options={options} error={error} {...register(name, rules)} />
      break

    case 'radio':
      control = (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">{label}</legend>
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value={opt.value}
                className="h-4 w-4 accent-brand-600"
                {...register(name, rules)}
              />
              {opt.label}
            </label>
          ))}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </fieldset>
      )
      break

    case 'checkbox':
      control = (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register(name)} />
          {field.label}
        </label>
      )
      break

    case 'date':
      control = <Input label={label} type="date" error={error} {...register(name, rules)} />
      break

    case 'url':
      control = (
        <Input
          label={label}
          type="url"
          placeholder={field.placeholder ?? 'https://'}
          error={error}
          {...register(name, rules)}
        />
      )
      break

    default:
      control = (
        <Input label={label} placeholder={field.placeholder ?? ''} error={error} {...register(name, rules)} />
      )
  }

  return (
    <div className="space-y-1">
      {control}
      {field.help_text && <p className="text-xs text-slate-400">{field.help_text}</p>}
    </div>
  )
}