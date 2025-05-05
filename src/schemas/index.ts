import { string, z } from 'zod'

// ConditionOperator 条件操作符
enum ConditionOperator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  Contains = 'contains',
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
}

// 联动条件的 schema
export const conditionSchema = z.object({
  operator: z.enum(Object.values(ConditionOperator) as [string, ...string[]]),
  value: z.any(),
})

// 联动规则的 schema
export const ruleSchema = z.object({
  when: z.record(conditionSchema), // 触发条件: { fieldName: { operator, value } }
  then: z.object({
    visible: z.boolean().optional(),    // 是否显示
    required: z.boolean().optional(),   // 是否必填
    value: z.any().optional(),         // 默认值
    options: z.array(z.object({        // 动态选项
      label: z.string(),
      value: z.string(),
      price: z.number().optional(),
    })).optional(),
  }),
})

// 计算规则的 schema
export const calculationSchema = z.object({
  type: z.enum(['sum', 'multiply', 'custom']),
  fields: z.array(z.string()),  // 参与计算的字段
  customFormula: z.string().optional(), // 自定义计算公式
})

// 修改表单字段 schema，添加联动规则
export const formFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['input-group', 'input-group-text', 'input-group-rich-text', 'input-number-group', 'cascade-selector']),
  required: z.boolean().default(false),
  suffix: z.string(),
  defaultValue: z.any().optional(),
  expression: z.string().optional(),
  placeholder: z.string(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    price: z.number().optional(),
  })).optional(),
})

// 修改表单配置 schema，添加商品选择器配置
export const formConfigSchema = z.object({
  fields: z.array(formFieldSchema),
  // layout: z.enum(['vertical', 'horizontal']).default('vertical'),
  submitButtonText: z.string().default('提交'),
  goodsOptions: z.any().optional(),
  // calculations: z.array(z.object({        // 金额计算规则
  //   targetField: z.string(),              // 计算结果存储字段
  //   rule: calculationSchema,              // 计算规则
  // })).optional(),
  // dependencies: z.record(z.array(z.string())).optional(), // 字段依赖关系 { field: [dependentFields] }
})

// 微信支付配置的 schema
export const wxPayConfigSchema = z.object({
  mchid: z.string(),
  appid: z.string(),
  notifyUrl: z.string().url(),
  description: z.string(),
  attach: z.string().optional(),
  timeExpire: z.string().optional(),
})
// Submission 创建的 schema
export const submissionSchema = z.object({
  id: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  paidAt: z.date().default(() => new Date()),
  expiredAt: z.date().default(() => new Date()),
  currency: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  issueId: z.string(),

  goods1: z.string(),
  goods2: z.string(),

  formData: z.record(z.any()), // 动态表单数据
  amount: z.number().min(0),
  openid: z.string().optional(),
  userInfo: z.record(z.any()).optional(),
})



// Issue 创建和更新的 schema
export const issueSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  content: z.any(), // grapesjs JSON 内容
  // 发布状态
  status: z.enum(['draft', 'published']).default('draft'),
  formConfig: formConfigSchema.optional().nullable(),
  wxPayConfig: wxPayConfigSchema.optional().nullable(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  submissions: z.array(submissionSchema).optional(),
})


// 支付状态更新的 schema
export const paymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  paymentId: z.string().optional(),
  wxPayInfo: z.record(z.any()).optional(),
})

// 用户偏好设置的 schema
export const preferencesSchema = z.object({
  user_email: z.string().email("请输入有效的邮箱地址"),
  user_fullname: z.string().min(2, "姓名至少需要2个字符"),
  user_profile_picture: z.string().url("请输入有效的图片URL"),
  username: z.string().min(3, "用户名至少需要3个字符"),
  user_description: z.string(),
})

// API 响应的通用 schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// 导出类型定义
export type FormField = z.infer<typeof formFieldSchema>
export type FormConfig = z.infer<typeof formConfigSchema>
export type WxPayConfig = z.infer<typeof wxPayConfigSchema>
export type Issue = z.infer<typeof issueSchema>
export type Submission = z.infer<typeof submissionSchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type Preferences = z.infer<typeof preferencesSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type Condition = z.infer<typeof conditionSchema>
export type Rule = z.infer<typeof ruleSchema>
export type Calculation = z.infer<typeof calculationSchema>
