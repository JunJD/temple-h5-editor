/*
  Runtime logic for the H5 Lamp template.
  This file is bundled/inlined into the built HTML.
*/

import { defaultQtyForTitle, normalizeTitle, safeNum } from '../h5-sdk'

export function attachLampRuntime() {
  const msgEl = document.getElementById('msg') as HTMLElement | null
  const gridEl = document.getElementById('slots-grid') as HTMLElement | null
  const totalEl = document.getElementById('total') as HTMLElement | null
  const summaryEl = document.getElementById('summary') as HTMLElement | null
  const clearBtn = document.getElementById('btn-clear') as HTMLButtonElement | null
  const refreshBtn = document.getElementById('btn-refresh') as HTMLButtonElement | null
  const boardBody = document.getElementById('board-body') as HTMLElement | null
  const payBtn = document.getElementById('btn-pay') as HTMLButtonElement | null
  const maskEl = document.getElementById('pay-mask') as HTMLElement | null
  const cancelBtn = document.getElementById('btn-cancel') as HTMLElement | null
  const confirmBtn = document.getElementById('btn-confirm') as HTMLButtonElement | null
  const moneyInput = document.getElementById('money') as HTMLInputElement | null
  const usernameInput = document.getElementById('username') as HTMLInputElement | null
  const phoneInput = document.getElementById('phone') as HTMLInputElement | null
  const qifuInput = document.getElementById('qifu') as HTMLTextAreaElement | null

  const hiddenGoods = document.getElementById('goods') as HTMLInputElement | null
  const hiddenAmount = document.getElementById('amount') as HTMLInputElement | null

  const state = {
    goods: [] as Array<{ id: string; title: string; price: number; currency?: string; quantity?: number }>,
    selected: new Map<string, { id: string; title: string; price: number; currency: string; quantity: number }>(),
    currency: 'CNY',
  }

  function $(sel: string, el?: Element) {
    return (el || document).querySelector(sel)
  }
  function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
    const n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = String(text)
    return n
  }
  function fmt(price: number, currency?: string) {
    try {
      return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: currency || 'CNY', currencyDisplay: 'narrowSymbol' }).format(safeNum(price))
    } catch {
      return (currency || '¥') + safeNum(price).toFixed(2)
    }
  }
  function fmtYuan(n: number) {
    return safeNum(n).toFixed(2) + '元'
  }
  function dateMD(d?: string) {
    const dt = new Date(d || Date.now())
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const da = String(dt.getDate()).padStart(2, '0')
    return m + '-' + da
  }
  function maskName(name?: string) {
    if (!name) return '匿名'
    const s = String(name).trim()
    if (s.length <= 1) return s + '**'
    if (s.length === 2) return s[0] + '*'
    return s[0] + '**'
  }
  function resolveIssueId() {
    const sp = new URLSearchParams(location.search)
    if (sp.get('issueId')) return sp.get('issueId')
    const p = location.pathname
    const patterns = [/\/h5\/([^\/?#]+)/, /\/artboard\/preview\/([^\/?#]+)/, /\/api\/preview\/([^\/?#]+)/, /\/client\/issues\/([^\/?#]+)\/goods/, /\/client\/issues\/([^\/?#]+)/, /\/client\/issues\/([^\/?#]+)\/edit/]
    for (const re of patterns) {
      const m = p.match(re)
      if (m && m[1]) return decodeURIComponent(m[1])
    }
    return null
  }

  function updateSummary() {
    if (!summaryEl || !totalEl || !hiddenGoods || !hiddenAmount) return
    const items = Array.from(state.selected.values())
    const total = items.reduce((s, it) => s + safeNum(it.price) * safeNum(it.quantity), 0)
    if (items.length === 0) {
      summaryEl.classList.add('hidden')
      hiddenGoods.value = ''
      hiddenAmount.value = ''
      totalEl.textContent = '¥0.00'
    } else {
      summaryEl.classList.remove('hidden')
      totalEl.textContent = fmt(total, items[0]?.currency || state.currency || 'CNY')
      hiddenGoods.value = JSON.stringify({ items, total, currency: items[0]?.currency || state.currency || 'CNY' })
      hiddenAmount.value = String(total)
    }
    window.dispatchEvent(new CustomEvent('goods:changed', { detail: { items, total, json: hiddenGoods.value } }))
  }

  function buildSlot(g: { id: string; title: string; price: number; currency?: string; quantity?: number }) {
    const stock = typeof g.quantity === 'number' ? g.quantity : Infinity
    const soldOut = Number.isFinite(stock) && (stock as number) <= 0

    const node = el('div', 'slot-item' + (soldOut ? ' slot-disabled' : ''))
    const title = el('div', 'slot-title', g.title || '')
    const badge = el('div', 'slot-badge' + (soldOut ? '' : ' ok'), soldOut ? '已满' : '可选')
    node.appendChild(title)
    node.appendChild(badge)

    const syncSelectedUI = () => {
      if (state.selected.has(g.id)) node.classList.add('selected')
      else node.classList.remove('selected')
    }
    syncSelectedUI()

    node.addEventListener('click', () => {
      if (soldOut) return
      if (state.selected.has(g.id)) {
        state.selected.delete(g.id)
      } else {
        const qty = defaultQtyForTitle(g.title)
        state.selected.set(g.id, { id: g.id, title: g.title, price: safeNum(g.price), currency: g.currency || 'CNY', quantity: qty })
      }
      syncSelectedUI()
      updateSummary()
    })
    return node
  }

  function renderSlots(list: Array<{ id: string; title: string; price: number; currency?: string; quantity?: number }>) {
    if (!gridEl || !msgEl) return
    gridEl.innerHTML = ''
    if (!Array.isArray(list) || list.length === 0) {
      msgEl.textContent = '暂无商品'
      msgEl.classList.remove('hidden')
      gridEl.classList.add('hidden')
      return
    }
    msgEl.classList.add('hidden')
    gridEl.classList.remove('hidden')

    const sorted = [...list].sort((a, b) => {
      const an = /点/.test(a.title || '') ? 0 : 1
      const bn = /点/.test(b.title || '') ? 0 : 1
      if (an !== bn) return an - bn
      return (a.title || '').localeCompare(b.title || '', 'zh')
    })
    sorted.forEach((g) => gridEl.appendChild(buildSlot(g)))

    // 默认选择：18点-20点
    const target = sorted.find((g) => /18.*(点)?\D+20/.test(normalizeTitle(g.title)))
    if (target && !state.selected.has(target.id)) {
      state.selected.set(target.id, { id: target.id, title: target.title, price: safeNum(target.price), currency: target.currency || 'CNY', quantity: defaultQtyForTitle(target.title) })
      updateSummary()
      const idx = sorted.indexOf(target)
      const node = gridEl.children[idx] as HTMLElement | undefined
      if (node) node.classList.add('selected')
    }
  }

  function tryParse(v: unknown) {
    try {
      return typeof v === 'string' ? JSON.parse(v) : null
    } catch {
      return null
    }
  }

  function parseSubmissionGoods(sub: any) {
    const items: Array<{ id: string | null; title: string; quantity: number }> = []
    const fd = sub?.formData || {}
    if (fd && (fd.goods || fd.GOODS || fd.Goods)) {
      const obj = tryParse(fd.goods || fd.GOODS || fd.Goods)
      if (obj && Array.isArray(obj.items)) return obj.items.map((it: any) => ({ id: it.id, title: it.title, quantity: safeNum(it.quantity) || 1 }))
    }
    if (typeof sub?.goods1 === 'string') {
      const p = tryParse(sub.goods1)
      if (p && Array.isArray(p.items)) return p.items.map((it: any) => ({ id: it.id, title: it.title, quantity: safeNum(it.quantity) || 1 }))
      items.push({ id: null, title: String(sub.goods1), quantity: 1 })
    }
    if (typeof sub?.goods2 === 'string') items.push({ id: null, title: String(sub.goods2), quantity: 1 })
    const possible = ['time', 'timeSlot', '时段', '点灯时间', '商品']
    for (const k of possible) {
      if (fd[k]) items.push({ id: null, title: String(fd[k]), quantity: 1 })
    }
    return items
  }

  function renderBoard(submissions: any[]) {
    if (!boardBody) return
    boardBody.innerHTML = ''
    const list = submissions.filter((s) => (s.status || '').toUpperCase() === 'PAID')
    list.forEach((s) => {
      const tr = document.createElement('tr')
      const goods = parseSubmissionGoods(s)
      const firstItem = goods[0]
      const amt = typeof s.amount === 'number' ? s.amount : 0
      tr.appendChild(el('td', 'board-col-date', dateMD(s.paidAt || s.createdAt)))
      const name = s.name || s.name1 || (s.formData && (s.formData.name || s.formData['姓名'] || s.formData['称呼'])) || ''
      tr.appendChild(el('td', 'board-col-name', maskName(name)))
      tr.appendChild(el('td', 'board-col-item', firstItem ? String(firstItem.title) : '—'))
      tr.appendChild(el('td', 'board-col-amt', fmtYuan(amt)))
      boardBody.appendChild(tr)
    })
  }

  async function refresh() {
    if (!msgEl || !gridEl) return
    const id = resolveIssueId()
    if (!id) {
      msgEl.textContent = '无法识别页面 ID'
      msgEl.classList.remove('hidden')
      return
    }
    msgEl.textContent = '加载中...'
    msgEl.classList.remove('hidden')
    gridEl.classList.add('hidden')
    state.selected.clear()
    updateSummary()

    try {
      const [goodsRes, subsRes] = await Promise.all([
        fetch(`/api/issues/${encodeURIComponent(id)}/goods`, { cache: 'no-store' }),
        fetch(`/api/submissions?issueId=${encodeURIComponent(id)}`, { cache: 'no-store' }),
      ])
      const goods = goodsRes.ok ? await goodsRes.json() : []
      const subsJson = subsRes.ok ? await subsRes.json() : { data: [] }
      state.goods = Array.isArray(goods) ? goods : []
      state.currency = (state.goods[0] as any)?.currency || 'CNY'
      const submissions = Array.isArray((subsJson as any)?.data) ? (subsJson as any).data : []
      renderSlots(state.goods)
      renderBoard(submissions)
    } catch (e) {
      console.error(e)
      msgEl.textContent = '加载失败，请稍后再试'
      msgEl.classList.remove('hidden')
    }
  }

  clearBtn?.addEventListener('click', () => {
    state.selected.clear()
    document.querySelectorAll('.slot-item.selected').forEach((n) => n.classList.remove('selected'))
    updateSummary()
  })
  refreshBtn?.addEventListener('click', refresh)
  payBtn?.addEventListener('click', () => {
    const total = Number(hiddenAmount?.value || '0')
    if (!total || total <= 0) {
      alert('请选择时间段')
      return
    }
    if (moneyInput) moneyInput.value = String(total.toFixed(2))
    maskEl?.classList.add('show')
    maskEl?.setAttribute('aria-hidden', 'false')
  })
  cancelBtn?.addEventListener('click', () => {
    maskEl?.classList.remove('show')
    maskEl?.setAttribute('aria-hidden', 'true')
  })
  maskEl?.addEventListener('click', (e) => {
    if (e.target === maskEl) {
      maskEl.classList.remove('show')
      maskEl.setAttribute('aria-hidden', 'true')
    }
  })

  confirmBtn?.addEventListener('click', async () => {
    try {
      if (confirmBtn) confirmBtn.disabled = true
      const total = Number(hiddenAmount?.value || '0')
      if (!total || total <= 0) {
        alert('请选择时间段')
        if (confirmBtn) confirmBtn.disabled = false
        return
      }

      const openid = new URLSearchParams(location.search).get('openid')
      const issueId = resolveIssueId()
      if (!openid) {
        alert('无法获取openid，需在微信内打开')
        if (confirmBtn) confirmBtn.disabled = false
        return
      }
      if (!issueId) {
        alert('无法识别页面ID')
        if (confirmBtn) confirmBtn.disabled = false
        return
      }

      const goodsJson = hiddenGoods?.value ? JSON.parse(hiddenGoods.value) : { items: [] }
      const formData = {
        name: usernameInput?.value || '',
        phone: phoneInput?.value || '',
        qifu: qifuInput?.value || '',
      }

      const createRes = await fetch('/api/payment/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, openid, formData, goods: hiddenGoods?.value }),
      })
      if (!createRes.ok) {
        const er = await createRes.json().catch(() => ({ error: '创建订单失败' }))
        throw new Error(er.error || '创建订单失败')
      }
      const payConfig = await createRes.json()
      const wx: any = (window as any).wx
      if (!wx) {
        alert('未检测到微信JS SDK')
        if (confirmBtn) confirmBtn.disabled = false
        return
      }
      wx.chooseWXPay({
        timestamp: payConfig.timeStamp,
        nonceStr: payConfig.nonceStr,
        package: payConfig.package,
        signType: payConfig.signType,
        paySign: payConfig.paySign,
        success: () => {
          try {
            const items = (goodsJson.items || []) as Array<{ id: string; quantity: number }>
            const isDepleted = items.some((it) => {
              const g = state.goods.find((x) => x.id === it.id)
              return g && Number(g.quantity) <= Number(it.quantity)
            })
            if (isDepleted) alert('您选择的时段可能已满，已为您刷新')
          } catch {}
          alert('支付成功')
          location.reload()
        },
        fail: (res: any) => {
          alert('支付失败: ' + res.errMsg)
        },
        complete: () => {
          if (confirmBtn) confirmBtn.disabled = false
          maskEl?.classList.remove('show')
          maskEl?.setAttribute('aria-hidden', 'true')
        },
      })
    } catch (e: any) {
      alert('支付失败,' + (e?.message || e || '请重试'))
      if (confirmBtn) confirmBtn.disabled = false
    }
  })

  refresh()
}

// Auto attach on load if running standalone
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    try { attachLampRuntime() } catch (e) { console.error(e) }
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      try { attachLampRuntime() } catch (e) { console.error(e) }
    })
  }
}
