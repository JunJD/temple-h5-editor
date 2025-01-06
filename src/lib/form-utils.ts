import type { Rule, Calculation, Condition } from '@/schemas'

// 评估条件
export function evaluateCondition(
  condition: Condition,
  fieldValue: any
): boolean {
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value
    case 'notEquals':
      return fieldValue !== condition.value
    case 'contains':
      return String(fieldValue).includes(String(condition.value))
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value)
    case 'lessThan':
      return Number(fieldValue) < Number(condition.value)
    default:
      return false
  }
}

// 评估规则
export function evaluateRules(rules: Rule[] = [], values: Record<string, any>): boolean {
  if (!rules.length) return true

  return rules.every(rule => {
    // 检查所有条件
    return Object.entries(rule.when).every(([fieldName, condition]) => {
      return evaluateCondition(condition, values[fieldName])
    })
  })
}

// 执行计算
export function executeCalculation(calc: Calculation, values: Record<string, any>): number {
  const { type, fields, customFormula } = calc

  switch (type) {
    case 'sum':
      return fields.reduce((sum, field) => sum + (Number(values[field]) || 0), 0)
    
    case 'multiply':
      return fields.reduce((product, field) => product * (Number(values[field]) || 1), 1)
    
    case 'custom':
      if (!customFormula) return 0
      // 使用 Function 构造器创建安全的计算函数
      const calculateFn = new Function(...fields, `return ${customFormula}`)
      const fieldValues = fields.map(field => values[field])
      return calculateFn(...fieldValues)
    
    default:
      return 0
  }
} 