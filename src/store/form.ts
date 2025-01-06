import { create } from 'zustand'
import { formConfigSchema, type FormConfig } from '@/schemas'
import { evaluateRules, executeCalculation } from '@/lib/form-utils'

interface FormState {
  config: FormConfig | null
  values: Record<string, any>
  calculations: Record<string, number>
  visibility: Record<string, boolean>
  setConfig: (config: FormConfig) => void
  setValue: (field: string, value: any) => void
  validateField: (field: string) => boolean
  evaluateVisibility: () => void
  executeCalculations: () => void
}

export const useFormStore = create<FormState>((set, get) => ({
  config: null,
  values: {},
  calculations: {},
  visibility: {},

  setConfig: (config) => {
    set({ config })
    get().evaluateVisibility()
    get().executeCalculations()
  },

  setValue: (field, value) => {
    set((state) => ({
      values: { ...state.values, [field]: value }
    }))
    get().evaluateVisibility()
    get().executeCalculations()
  },

  validateField: (field) => {
    const { config, values } = get()
    if (!config) return true
    
    const fieldConfig = config.fields.find(f => f.name === field)
    if (!fieldConfig) return true

    // 使用 zod 验证
    const result = formConfigSchema.shape.fields.element.safeParse(values[field])
    return result.success
  },

  evaluateVisibility: () => {
    const { config, values } = get()
    if (!config) return

    const visibility = config.fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: evaluateRules(field.rules, values)
    }), {})

    set({ visibility })
  },

  executeCalculations: () => {
    const { config, values } = get()
    if (!config?.calculations) return

    const calculations = config.calculations.reduce((acc, calc) => ({
      ...acc,
      [calc.targetField]: executeCalculation(calc, values)
    }), {})

    set({ calculations })
  }
})) 