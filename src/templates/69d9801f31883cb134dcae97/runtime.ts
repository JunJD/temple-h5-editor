import { formatCurrency, safeNum } from '../h5-sdk'

const PAGE_TITLE = '开利寺 · 水陆大法会庄严法器募化登记'

type IssueRecord = {
  id?: string
  title?: string
  description?: string
  content?: {
    templateConfig?: TemplateConfig | null
  } | null
}

type TemplateConfig = {
  heroImageUrl?: string
  audioUrl?: string
  overviewHtml?: string
  boardTitle?: string
  payTitle?: string
  payHint?: string
}

type TemplateContext = {
  issue?: {
    id?: string
    title?: string
    description?: string
  }
  templateConfig?: TemplateConfig | null
}

type GoodsRecord = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  price: number
  currency?: string
  quantity?: number
}

type SelectedRecord = {
  id: string
  title: string
  price: number
  currency: string
  quantity: number
}

type SubmissionRecord = {
  amount?: number
  createdAt?: string
  paidAt?: string
  formData?: Record<string, any>
  goods1?: string
  goods2?: string
  name?: string
  name1?: string
  status?: string
}

function resolveIssueId() {
  const searchParams = new URLSearchParams(location.search)
  if (searchParams.get('issueId')) return searchParams.get('issueId')

  const pathname = location.pathname
  const patterns = [
    /\/h5\/([^/?#]+)/,
    /\/artboard\/preview\/([^/?#]+)/,
    /\/api\/preview\/([^/?#]+)/,
    /\/client\/issues\/([^/?#]+)\/goods/,
    /\/client\/issues\/([^/?#]+)\/edit/,
    /\/client\/issues\/([^/?#]+)/
  ]

  for (const pattern of patterns) {
    const match = pathname.match(pattern)
    if (match?.[1]) return decodeURIComponent(match[1])
  }

  return null
}

function maskName(name?: string) {
  if (!name) return '匿名'
  const value = String(name).trim()
  if (value.length <= 1) return value + '**'
  if (value.length === 2) return value[0] + '*'
  return value[0] + '**'
}

function dateMD(dateLike?: string) {
  const date = new Date(dateLike || Date.now())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseSubmissionGoods(submission: SubmissionRecord) {
  const items: Array<{ id: string | null; title: string; quantity: number }> =
    []
  const formData = submission.formData || {}

  const tryParse = (value: unknown) => {
    try {
      if (value && typeof value === 'object') return value as any
      return typeof value === 'string' ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  const goodsPayload = tryParse(
    formData.goods || formData.GOODS || formData.Goods
  )
  if (goodsPayload && Array.isArray(goodsPayload.items)) {
    return goodsPayload.items.map((item: any) => ({
      id: item.id ?? null,
      title: String(item.title ?? ''),
      quantity: safeNum(item.quantity) || 1
    }))
  }

  if (typeof submission.goods1 === 'string') {
    const goods1Payload = tryParse(submission.goods1)
    if (goods1Payload && Array.isArray(goods1Payload.items)) {
      return goods1Payload.items.map((item: any) => ({
        id: item.id ?? null,
        title: String(item.title ?? ''),
        quantity: safeNum(item.quantity) || 1
      }))
    }
    items.push({ id: null, title: submission.goods1, quantity: 1 })
  }

  if (typeof submission.goods2 === 'string') {
    items.push({ id: null, title: submission.goods2, quantity: 1 })
  }

  for (const key of ['商品', 'goods', 'time', 'timeSlot', '时段', '亮灯时间']) {
    if (formData[key]) {
      items.push({ id: null, title: String(formData[key]), quantity: 1 })
    }
  }

  return items
}

function normalizeContext(
  raw: TemplateContext | null | undefined,
  issue?: IssueRecord | null
): TemplateContext {
  const templateConfig =
    raw?.templateConfig ?? issue?.content?.templateConfig ?? null

  return {
    issue: {
      id: raw?.issue?.id ?? issue?.id ?? '',
      title: raw?.issue?.title ?? issue?.title ?? '',
      description: raw?.issue?.description ?? issue?.description ?? ''
    },
    templateConfig
  }
}

async function loadTemplateContext(issueId: string) {
  const win = window as Window & {
    __ISSUE_TEMPLATE_CONTEXT__?: TemplateContext
  }

  const injected = win.__ISSUE_TEMPLATE_CONTEXT__
  if (injected?.issue?.id === issueId) {
    return normalizeContext(injected, null)
  }

  try {
    const response = await fetch(`/api/issues/${encodeURIComponent(issueId)}`, {
      cache: 'no-store'
    })
    if (!response.ok) {
      return normalizeContext(injected, null)
    }

    const issue = (await response.json()) as IssueRecord
    return normalizeContext(injected, issue)
  } catch {
    return normalizeContext(injected, null)
  }
}

export function attachLampRuntime() {
  if (document.body.dataset.h5LampRuntimeReady === 'true') return
  document.body.dataset.h5LampRuntimeReady = 'true'
  document.title = PAGE_TITLE

  const boardSectionEl = document.getElementById('board') as HTMLElement | null
  const boardTitleEl = document.getElementById(
    'board-title'
  ) as HTMLElement | null
  const formatListEl = document.getElementById(
    'format-list'
  ) as HTMLElement | null
  const msgEl = document.getElementById('msg') as HTMLElement | null
  const gridEl = document.getElementById('slots-grid') as HTMLElement | null
  const heroImageEl = document.getElementById(
    'hero-image'
  ) as HTMLImageElement | null
  const overviewEl = document.getElementById('overview') as HTMLElement | null
  const musicEl = document.getElementById('music') as HTMLElement | null
  const audioEl = document.getElementById('audio') as HTMLAudioElement | null
  const maskEl = document.getElementById('pay-mask') as HTMLElement | null
  const cancelBtn = document.getElementById('btn-cancel') as HTMLElement | null
  const confirmBtn = document.getElementById(
    'btn-confirm'
  ) as HTMLButtonElement | null
  const payTitleEl = document.getElementById('pay-title') as HTMLElement | null
  const payHintEl = document.getElementById('pay-hint') as HTMLElement | null
  const totalEl = document.getElementById('total') as HTMLElement | null
  const selectedTitleEl = document.getElementById(
    'selected-title'
  ) as HTMLElement | null
  const moneyInput = document.getElementById('money') as HTMLInputElement | null
  const usernameInput = document.getElementById(
    'username'
  ) as HTMLInputElement | null
  const phoneInput = document.getElementById('phone') as HTMLInputElement | null
  const qifuInput = document.getElementById(
    'qifu'
  ) as HTMLTextAreaElement | null
  const hiddenGoods = document.getElementById(
    'goods'
  ) as HTMLInputElement | null
  const hiddenAmount = document.getElementById(
    'amount'
  ) as HTMLInputElement | null

  let boardAutoScrollTimer: number | null = null

  const state = {
    issueId: resolveIssueId(),
    context: null as TemplateContext | null,
    goods: [] as GoodsRecord[],
    selected: null as SelectedRecord | null,
    quantities: {} as Record<string, number>,
    currency: 'CNY'
  }

  function openModal() {
    maskEl?.classList.add('show')
    maskEl?.setAttribute('aria-hidden', 'false')
  }

  function closeModal() {
    maskEl?.classList.remove('show')
    maskEl?.setAttribute('aria-hidden', 'true')
  }

  function updateSummary() {
    const item = state.selected
    if (!hiddenGoods || !hiddenAmount || !moneyInput) return

    if (!item) {
      hiddenGoods.value = ''
      hiddenAmount.value = ''
      if (totalEl) totalEl.textContent = '¥0.00'
      if (selectedTitleEl) selectedTitleEl.textContent = '未选择'
      moneyInput.value = ''
      window.dispatchEvent(
        new CustomEvent('goods:changed', {
          detail: { items: [], total: 0, json: '' }
        })
      )
      return
    }

    const total = safeNum(item.price) * safeNum(item.quantity)
    const payload = {
      items: [item],
      total,
      currency: item.currency || state.currency || 'CNY'
    }

    hiddenGoods.value = JSON.stringify(payload)
    hiddenAmount.value = String(total)
    if (totalEl) totalEl.textContent = formatCurrency(total, payload.currency)
    if (selectedTitleEl) {
      selectedTitleEl.textContent =
        item.quantity > 1 ? `${item.title} x ${item.quantity}` : item.title
    }
    moneyInput.value = total.toFixed(2)

    window.dispatchEvent(
      new CustomEvent('goods:changed', {
        detail: { items: [item], total, json: hiddenGoods.value }
      })
    )
  }

  function applyTemplateContext(context: TemplateContext) {
    const config = context.templateConfig || {}
    const overviewHtml =
      typeof config.overviewHtml === 'string' && config.overviewHtml.trim()
        ? config.overviewHtml
        : ''

    if (overviewEl && overviewHtml) overviewEl.innerHTML = overviewHtml
    if (boardTitleEl)
      boardTitleEl.textContent =
        config.boardTitle || boardTitleEl.textContent || '功德榜'
    if (payTitleEl)
      payTitleEl.textContent =
        config.payTitle || payTitleEl.textContent || '在线登记'
    if (payHintEl)
      payHintEl.textContent = config.payHint || '确认后将唤起微信支付。'

    if (
      heroImageEl &&
      typeof config.heroImageUrl === 'string' &&
      config.heroImageUrl.trim()
    ) {
      heroImageEl.src = config.heroImageUrl.trim()
    }

    if (
      musicEl &&
      audioEl &&
      typeof config.audioUrl === 'string' &&
      config.audioUrl.trim()
    ) {
      const audioUrl = config.audioUrl.trim()
      musicEl.dataset.url = audioUrl
      audioEl.src = audioUrl
    }
  }

  function clearBoardAutoScroll() {
    if (boardAutoScrollTimer != null) {
      window.cancelAnimationFrame(boardAutoScrollTimer)
      boardAutoScrollTimer = null
    }
  }

  function renderFormatList(submissions: SubmissionRecord[]) {
    if (!formatListEl || !boardSectionEl) return

    clearBoardAutoScroll()
    formatListEl.innerHTML = ''

    const paidItems = submissions
      .filter(submission => (submission.status || '').toUpperCase() === 'PAID')
      .map(submission => {
        const goods = parseSubmissionGoods(submission)
        const firstGoods = goods[0]
        const formData = submission.formData || {}
        const rawName =
          submission.name ||
          submission.name1 ||
          formData.name ||
          formData['姓名'] ||
          formData['称呼'] ||
          ''

        return {
          date: dateMD(submission.paidAt || submission.createdAt),
          name: maskName(rawName),
          goods: firstGoods ? String(firstGoods.title) : '功德随喜',
          amount: `${safeNum(submission.amount).toFixed(0)}元`
        }
      })

    if (paidItems.length === 0) {
      boardSectionEl.classList.add('hidden')
      return
    }

    boardSectionEl.classList.remove('hidden')

    const wrapper = document.createElement('div')
    wrapper.className = 'list-wrapper'
    wrapper.setAttribute('data-v-e00a63bf', '')

    const list = document.createElement('ul')
    list.className = 'ranking_list_detail'
    list.setAttribute('data-v-e00a63bf', '')
    list.style.margin = '0'
    list.style.padding = '0'
    list.style.listStyle = 'none'

    const appendCycle = () => {
      paidItems.forEach(item => {
        const li = document.createElement('li')
        li.setAttribute('data-v-e00a63bf', '')

        const row = document.createElement('p')
        row.setAttribute('data-v-e00a63bf', '')

        for (const value of [item.date, item.name, item.goods, item.amount]) {
          const span = document.createElement('span')
          span.textContent = value
          row.appendChild(span)
        }

        li.appendChild(row)
        list.appendChild(li)
      })
    }

    appendCycle()
    wrapper.appendChild(list)
    formatListEl.appendChild(wrapper)

    if (paidItems.length <= 4) return

    appendCycle()
    appendCycle()

    let offset = formatListEl.offsetHeight
    const cycleHeight = list.scrollHeight / 3

    const tick = () => {
      offset -= 0.3
      if (offset <= -cycleHeight) {
        offset = formatListEl.offsetHeight
      }
      wrapper.style.transform = `translateY(${offset}px)`
      boardAutoScrollTimer = window.requestAnimationFrame(tick)
    }

    wrapper.style.transform = `translateY(${offset}px)`
    boardAutoScrollTimer = window.requestAnimationFrame(tick)
  }

  function getStock(good: GoodsRecord) {
    return typeof good.quantity === 'number' ? good.quantity : Infinity
  }

  function getQuantity(good: GoodsRecord) {
    const stock = getStock(good)
    const value = state.quantities[good.id] ?? 1
    if (Number.isFinite(stock)) {
      return Math.min(Math.max(value, 1), Math.max(stock, 1))
    }
    return Math.max(value, 1)
  }

  function setSelectedGood(good: GoodsRecord, quantity: number) {
    state.selected = {
      id: good.id,
      title: good.title,
      price: safeNum(good.price),
      currency: good.currency || 'CNY',
      quantity
    }
    updateSummary()
  }

  function buildSlot(good: GoodsRecord) {
    const stock = getStock(good)
    const soldOut = Number.isFinite(stock) && stock <= 0
    const itemEl = document.createElement('li')
    itemEl.setAttribute('data-v-a3f6ef4d', '')

    const imageUrl =
      typeof good.imageUrl === 'string' ? good.imageUrl.trim() : ''
    if (imageUrl) {
      const imageEl = document.createElement('img')
      imageEl.src = imageUrl
      imageEl.alt = good.title || '商品图片'
      imageEl.className = 'imgClass'
      imageEl.setAttribute('data-v-a3f6ef4d', '')
      itemEl.appendChild(imageEl)
    }

    const leftEl = document.createElement('div')
    leftEl.className = 'leftDiv'
    leftEl.setAttribute('data-v-a3f6ef4d', '')

    const titleEl = document.createElement('span')
    titleEl.setAttribute('data-v-a3f6ef4d', '')
    titleEl.innerHTML = escapeHtml(good.title || '未命名商品').replace(
      /\n/g,
      '<br />'
    )
    leftEl.appendChild(titleEl)

    const priceEl = document.createElement('span')
    priceEl.className = 'colorClass'
    priceEl.setAttribute('data-v-a3f6ef4d', '')
    priceEl.textContent = formatCurrency(
      safeNum(good.price),
      good.currency || 'CNY'
    )
    leftEl.appendChild(priceEl)

    const extraText =
      good.description?.trim() ||
      (Number.isFinite(stock) ? `剩余 ${stock} 件` : '')
    if (extraText) {
      const extraEl = document.createElement('span')
      extraEl.className = 'colorClass'
      extraEl.setAttribute('data-v-a3f6ef4d', '')
      extraEl.textContent = extraText
      leftEl.appendChild(extraEl)
    }

    itemEl.appendChild(leftEl)

    const rightEl = document.createElement('div')
    rightEl.className = 'rightDiv'
    rightEl.setAttribute('data-v-a3f6ef4d', '')

    const quantityRowEl = document.createElement('div')
    quantityRowEl.className = 'quantityRow'
    quantityRowEl.setAttribute('data-v-a3f6ef4d', '')

    const minusEl = document.createElement('button')
    minusEl.type = 'button'
    minusEl.className = 'quantityButton'
    minusEl.setAttribute('data-v-a3f6ef4d', '')
    minusEl.textContent = '-'

    const quantityValueEl = document.createElement('span')
    quantityValueEl.className = 'quantityValue'
    quantityValueEl.setAttribute('data-v-a3f6ef4d', '')

    const plusEl = document.createElement('button')
    plusEl.type = 'button'
    plusEl.className = 'quantityButton'
    plusEl.setAttribute('data-v-a3f6ef4d', '')
    plusEl.textContent = '+'

    const updateQuantityView = () => {
      const quantity = getQuantity(good)
      quantityValueEl.textContent = String(quantity)
      minusEl.disabled = soldOut || quantity <= 1
      plusEl.disabled = soldOut || (Number.isFinite(stock) && quantity >= stock)
    }

    minusEl.addEventListener('click', () => {
      if (soldOut) return
      state.quantities[good.id] = getQuantity(good) - 1
      updateQuantityView()
    })

    plusEl.addEventListener('click', () => {
      if (soldOut) return
      state.quantities[good.id] = getQuantity(good) + 1
      updateQuantityView()
    })

    quantityRowEl.appendChild(minusEl)
    quantityRowEl.appendChild(quantityValueEl)
    quantityRowEl.appendChild(plusEl)

    const buttonEl = document.createElement('button')
    buttonEl.type = 'button'
    buttonEl.className = `ivu-btn ivu-btn-error ${soldOut ? 'addPayButton1' : 'addPayButton'}`
    buttonEl.setAttribute('data-v-a3f6ef4d', '')
    if (soldOut) buttonEl.disabled = true

    const buttonTextEl = document.createElement('span')
    buttonTextEl.textContent = soldOut ? '已圆满' : '登记'
    buttonEl.appendChild(buttonTextEl)

    buttonEl.addEventListener('click', () => {
      if (soldOut) return
      setSelectedGood(good, getQuantity(good))
      openModal()
    })

    rightEl.appendChild(quantityRowEl)
    rightEl.appendChild(buttonEl)
    itemEl.appendChild(rightEl)
    updateQuantityView()

    return itemEl
  }

  function renderSlots(goods: GoodsRecord[]) {
    if (!gridEl || !msgEl) return

    gridEl.innerHTML = ''

    if (!Array.isArray(goods) || goods.length === 0) {
      msgEl.textContent = '暂无商品'
      msgEl.classList.remove('hidden')
      gridEl.classList.add('hidden')
      return
    }

    msgEl.classList.add('hidden')
    gridEl.classList.remove('hidden')

    goods.forEach(good => {
      gridEl.appendChild(buildSlot(good))
    })
  }

  function setupMusic() {
    if (!musicEl || !audioEl) return
    if (musicEl.dataset.ready === 'true') return
    musicEl.dataset.ready = 'true'

    const play = () =>
      audioEl
        .play()
        .then(() => {
          musicEl.classList.remove('stopped')
        })
        .catch(() => {
          musicEl.classList.add('stopped')
        })

    const pause = () => {
      audioEl.pause()
      musicEl.classList.add('stopped')
    }

    musicEl.addEventListener('click', () => {
      if (audioEl.paused) {
        void play()
      } else {
        pause()
      }
    })

    audioEl.addEventListener('play', () => {
      musicEl.classList.remove('stopped')
    })

    audioEl.addEventListener('pause', () => {
      musicEl.classList.add('stopped')
    })

    document.addEventListener(
      'WeixinJSBridgeReady',
      () => {
        void play()
      },
      false
    )

    document.addEventListener(
      'click',
      () => {
        if (audioEl.paused) {
          void play()
        }
      },
      { once: true }
    )
  }

  async function refresh() {
    if (!msgEl || !gridEl || !state.issueId) {
      if (msgEl && !state.issueId) {
        msgEl.textContent = '无法识别页面 ID'
        msgEl.classList.remove('hidden')
      }
      return
    }

    msgEl.textContent = '加载中...'
    msgEl.classList.remove('hidden')
    gridEl.classList.add('hidden')
    state.selected = null
    updateSummary()

    try {
      const win = window as Window & {
        __ISSUE_TEMPLATE_CONTEXT__?: TemplateContext
        submissionData?: SubmissionRecord[]
      }

      const submissionsPromise = Array.isArray(win.submissionData)
        ? Promise.resolve(win.submissionData)
        : fetch(
            `/api/submissions?issueId=${encodeURIComponent(state.issueId)}`,
            { cache: 'no-store' }
          ).then(async response => {
            if (!response.ok) return []
            const json = await response.json()
            return Array.isArray(json?.data) ? json.data : []
          })

      const [context, goods, submissions] = await Promise.all([
        loadTemplateContext(state.issueId),
        fetch(`/api/issues/${encodeURIComponent(state.issueId)}/goods`, {
          cache: 'no-store'
        }).then(async response => {
          if (!response.ok) return []
          const json = await response.json()
          return Array.isArray(json) ? json : []
        }),
        submissionsPromise
      ])

      state.context = context
      state.goods = goods as GoodsRecord[]
      state.quantities = {}
      state.currency = state.goods[0]?.currency || 'CNY'

      applyTemplateContext(context)
      setupMusic()
      renderFormatList(submissions as SubmissionRecord[])
      renderSlots(state.goods)
    } catch (error) {
      console.error(error)
      msgEl.textContent = '加载失败，请稍后再试'
      msgEl.classList.remove('hidden')
    }
  }

  cancelBtn?.addEventListener('click', closeModal)

  maskEl?.addEventListener('click', event => {
    if (event.target === maskEl) closeModal()
  })

  confirmBtn?.addEventListener('click', async () => {
    if (!state.selected) {
      alert('请先选择一个商品')
      return
    }
    if (!confirmBtn) return

    try {
      confirmBtn.disabled = true

      const openid = new URLSearchParams(location.search).get('openid')
      if (!openid) {
        throw new Error('预览模式下无法唤起支付，请在微信内打开')
      }
      if (!state.issueId) {
        throw new Error('无法识别页面 ID')
      }

      const createRes = await fetch('/api/payment/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: state.issueId,
          openid,
          formData: {
            name: usernameInput?.value || '',
            phone: phoneInput?.value || '',
            qifu: qifuInput?.value || ''
          },
          goods: hiddenGoods?.value || ''
        })
      })

      if (!createRes.ok) {
        const error = await createRes
          .json()
          .catch(() => ({ error: '创建订单失败' }))
        throw new Error(error.error || '创建订单失败')
      }

      const payConfig = await createRes.json()
      const wx = (window as Window & { wx?: any }).wx
      if (!wx?.chooseWXPay) {
        throw new Error('未检测到微信支付环境')
      }

      wx.chooseWXPay({
        timestamp: payConfig.timeStamp,
        nonceStr: payConfig.nonceStr,
        package: payConfig.package,
        signType: payConfig.signType,
        paySign: payConfig.paySign,
        success: () => {
          alert('支付成功')
          location.reload()
        },
        fail: (result: { errMsg?: string }) => {
          alert('支付失败: ' + (result.errMsg || '请稍后重试'))
        },
        complete: () => {
          confirmBtn.disabled = false
          closeModal()
        }
      })
    } catch (error: any) {
      alert(error?.message || '支付失败，请稍后重试')
      confirmBtn.disabled = false
    }
  })

  void refresh()
}

if (typeof window !== 'undefined') {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    try {
      attachLampRuntime()
    } catch (error) {
      console.error(error)
    }
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      try {
        attachLampRuntime()
      } catch (error) {
        console.error(error)
      }
    })
  }
}
