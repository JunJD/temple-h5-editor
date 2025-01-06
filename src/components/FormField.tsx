import { type FormField as FormFieldType } from '@/schemas'

interface FormFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur: () => void
}

export function FormField({ field, value, onChange, onBlur }: FormFieldProps) {
  switch (field.type) {
    case 'text':
      return (
        <div className="form-field">
          <label>{field.label}</label>
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
          />
        </div>
      )

    case 'number':
      return (
        <div className="form-field">
          <label>{field.label}</label>
          <input
            type="number"
            value={value || ''}
            onChange={e => onChange(Number(e.target.value))}
            onBlur={onBlur}
            required={field.required}
          />
        </div>
      )

    case 'select':
      return (
        <div className="form-field">
          <label>{field.label}</label>
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
          >
            <option value="">请选择</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )

    // 添加其他字段类型...

    default:
      return null
  }
} 