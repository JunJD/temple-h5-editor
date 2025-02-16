import { Editor } from 'grapesjs'
import BasePluginV5 from '../common/base'
import { OPtion } from '..'

export const PAY_BUTTON_TYPE = 'pay-button'

class PayButtonPlugin extends BasePluginV5 {
    constructor(editor: Editor, options: OPtion) {
        super(editor, options)
    }

    load() {
        this._loadComponents()
    }

    _loadComponents() {
        this.editor.Components.addType(PAY_BUTTON_TYPE, {
            model: {
                defaults: {
                    tagName: 'button',
                    droppable: false,
                    attributes: { class: 'pay-button' },
                    style: {
                        'width': '60%',
                        'height': '47.76px',
                        'color': '#fff',
                        'background-color': '#07c160',
                        'border': 'none',
                        'border-radius': '7.96px',
                        'margin': '31.84px 0',
                        'font-size': '19.9px',
                        'padding': '0',
                        'display': 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                        'cursor': 'pointer',
                        '&:disabled': {
                            'opacity': '0.5',
                            'cursor': 'not-allowed'
                        }
                    },
                    traits: [
                        {
                            type: 'text',
                            name: 'text',
                            label: '按钮文本',
                            default: '立即支付',
                            changeProp: true
                        },
                        {
                            type: 'checkbox',
                            name: 'disabled',
                            label: '禁用'
                        }
                    ],
                    script: function () {
                        const el = this as HTMLButtonElement
                        const form = el.closest('form')
                        console.log(form, '<==form')
                        if (form) {
                            el.addEventListener('click', async (e) => {
                                e.preventDefault()

                                try {
                                    el.disabled = true

                                    // 获取表单数据
                                    const formData = (form as any).gForm?.getData() || {}
                                    const amount = formData.amount || formData.totalAmount || 0
                                    const issueId = window.location.pathname.split('/').pop()
                                    const openid = new URLSearchParams(window.location.search).get('openid')
                                    console.log((form as any).gForm, '<==formData')
                                    console.log(amount, '<==amount')
                                    
                                    if (!amount) {
                                        alert('请输入支付金额')
                                        return
                                    }

                                    if (!issueId) {
                                        alert('获取issueId失败')
                                        return
                                    }

                                    if (!openid) {
                                        alert('获取openid失败')
                                        return
                                    }

                                    // 调用创建支付订单API
                                    const createRes = await fetch('/api/payment/create', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            formData,
                                            amount,
                                            issueId: window.location.pathname.split('/').pop(),
                                            openid: new URLSearchParams(window.location.search).get('openid')
                                        })
                                    })

                                    console.log(createRes, '<==createRes')
                                    
                                    if (!createRes.ok) {
                                        throw new Error('创建支付订单失败'+'createRes:'+JSON.stringify(createRes))
                                    }

                                    const payConfig = await createRes.json()

                                    // 调用微信支付
                                    const wx = (window as any).wx
                                    if (!wx) {
                                        throw new Error('未检测到微信JS SDK')
                                    }

                                    wx.chooseWXPay({
                                        timestamp: payConfig.timeStamp,
                                        nonceStr: payConfig.nonceStr,
                                        package: payConfig.package,
                                        signType: payConfig.signType,
                                        paySign: payConfig.paySign,
                                        success: () => {
                                            alert('支付成功')
                                            window.location.reload()
                                        },
                                        fail: (res: any) => {
                                            alert('支付失败:' + res.errMsg)
                                        },
                                        complete: () => {
                                            el.disabled = false
                                        }
                                    })

                                } catch (error) {
                                    console.error('支付失败:', error)
                                    alert('支付失败,请重试2'+ (error.message || error || '未知错误') )
                                    el.disabled = false
                                }
                            })
                        }
                    }
                },

                init() {
                    this.on('change:attributes:text', this.handleTextChange)
                    this.on('change:attributes:disabled', this.handleDisabledChange)
                    
                    // 设置初始文本
                    const text = this.get('attributes').text || '立即支付'
                    this.set('content', text)
                },

                handleTextChange() {
                    const text = this.get('attributes').text
                    this.set('content', text || '立即支付')
                },

                handleDisabledChange() {
                    const disabled = this.get('attributes').disabled
                    if (disabled) {
                        this.addClass('opacity-50 cursor-not-allowed')
                    } else {
                        this.removeClass('opacity-50 cursor-not-allowed')
                    }
                }
            }
        })
    }
}

export default PayButtonPlugin
