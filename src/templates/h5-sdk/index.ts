export type Currency = 'CNY' | 'USD' | string

export type Goods = {
  id: string
  title: string
  price: number
  currency?: Currency
  quantity?: number | null
}

export type SelectedItem = {
  id: string
  title: string
  price: number
  currency: Currency
  quantity: number
}

export type LeaderboardItem = {
  createdAt?: string
  paidAt?: string
  name?: string
  amount?: number
  formData?: Record<string, any>
  goods1?: string
  goods2?: string
  status?: string
}

export type RenderOptions = {
  /** Root body padding, e.g. '12px' */
  padding?: string
  /** Title for goods section */
  goodsTitle?: string
}

export const defaultRenderOptions: Required<RenderOptions> = {
  padding: '12px',
  goodsTitle: '亮灯时间',
}

export function normalizeTitle(title?: string) {
  return String(title || '')
    .replace(/[~～至到\-]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase()
}

export function safeNum(n: unknown) {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

export function defaultQtyForTitle(title?: string) {
  const s = normalizeTitle(title)
  if (/18.*20/.test(s)) return 1
  return 1
}

export function formatCurrency(n: number, currency: Currency = 'CNY') {
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(safeNum(n))
  } catch {
    const sym = currency === 'CNY' ? '¥' : currency
    return sym + safeNum(n).toFixed(2)
  }
}

