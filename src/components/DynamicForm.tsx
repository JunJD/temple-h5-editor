import { useFormStore } from '@/store/form'
import { FormField } from './FormField'

export function DynamicForm() {
  const { 
    config,
    values, 
    visibility, 
    calculations,
    setValue,
    validateField 
  } = useFormStore()

  if (!config) return null

  return (
    <form className="space-y-4">
      {config.fields.map(field => {
        if (!visibility[field.name]) return null
        
        return (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => setValue(field.name, value)}
            onBlur={() => validateField(field.name)}
          />
        )
      })}
      
      {/* 显示计算结果 */}
      {calculations.totalAmount !== undefined && (
        <div className="text-lg font-bold">
          总金额: ¥{calculations.totalAmount.toFixed(2)}
        </div>
      )}
    </form>
  )
} 