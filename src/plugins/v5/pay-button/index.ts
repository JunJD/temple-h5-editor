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
                        'height': '56px',
                        'color': '#fff',
                        'background-color': '#a77c37',
                        'border': 'none',
                        'border-radius': '8px',
                        'margin': '30px auto',
                        'font-size': '18px',
                        'font-weight': '500',
                        'padding': '0',
                        'display': 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                        'cursor': 'pointer',
                        'box-shadow': '0 4px 10px rgba(167, 124, 55, 0.3)',
                        'transition': 'all 0.3s ease',
                        '&:hover': {
                            'background-color': '#8e6b2f',
                            'box-shadow': '0 6px 15px rgba(167, 124, 55, 0.4)',
                            'transform': 'translateY(-2px)'
                        },
                        '&:active': {
                            'background-color': '#a77c37',
                            'box-shadow': '0 2px 5px rgba(167, 124, 55, 0.4)',
                            'transform': 'translateY(1px)'
                        },
                        '&:disabled': {
                            'opacity': '0.6',
                            'cursor': 'not-allowed',
                            'background-color': '#b89865',
                            'box-shadow': 'none',
                            'transform': 'none'
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
                        // 是否是编辑场景 - 通过检查元素是否有data-gjs-type属性来判断
                        const isEdit = el.hasAttribute('data-gjs-type')

                        // if (isEdit) {
                        //     console.log('编辑场景')
                        //     alert('编辑场景')
                        //     return
                        // }

                        if (form) {
                            el.addEventListener('click', async (e) => {
                                e.preventDefault()

                                try {
                                    el.disabled = true

                                    // 获取表单数据
                                    const formData = (form as any).gForm?.getData() || {}
                                    const columns = (form as any).gForm?.getColumns() || []
                                    const amount = formData.amount || formData.totalAmount || 0
                                    const openid = new URLSearchParams(window.location.search).get('openid')
                                    const issueId = window.location.pathname.split('/').pop()
                                    
                                    for (const column of columns) {
                                        if(formData && column.required && !formData[column.value]) {
                                            alert(`请填写${column.label}`)
                                            return
                                        }
                                    }
                                    
                                    // 尝试从URL参数中获取用户信息
                                    let userInfo = null;
                                    try {
                                        const userInfoStr = new URLSearchParams(window.location.search).get('user_info');
                                        if (userInfoStr) {
                                            userInfo = JSON.parse(decodeURIComponent(userInfoStr));
                                            console.log('从URL参数获取到用户信息:', userInfo);
                                        }
                                    } catch (error) {
                                        console.error('解析用户信息失败:', error);
                                    }

                                    if (!amount || amount <= 0) {
                                        alert('支付金额必须大于0')
                                        el.disabled = false
                                        return
                                    }

                                    if (!openid || !issueId) {
                                        alert('出错了，请联系工作人员或重试')
                                        return
                                    }

                                    // 调用微信支付
                                    const wx = (window as any).wx
                                    if (!wx) {
                                        throw new Error('未检测到微信JS SDK')
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
                                            issueId,
                                            openid,
                                            userInfo
                                        })
                                    })

                                    console.log(createRes, '<==createRes')

                                    if (!createRes.ok) {
                                        const errorData = await createRes.json();
                                        throw new Error(errorData.error || '创建支付订单失败');
                                    }

                                    const payConfig = await createRes.json()

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
                                    alert('支付失败,' + (error.message || error || '请重试'))
                                } finally {
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
                    this.set('attributes', { ...this.get('attributes'), disabled: disabled })
                }
            }
        })
    }
}

export default PayButtonPlugin
