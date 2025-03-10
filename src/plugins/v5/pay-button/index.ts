import { Editor } from 'grapesjs'
import BasePluginV5 from '../common/base'
import { OPtion } from '..'
import { toast } from '@/hooks/use-toast'

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
                        // 是否是编辑场景 - 通过检查元素是否有data-gjs-type属性来判断
                        const isEdit = el.hasAttribute('data-gjs-type')

                        if (isEdit) {
                            console.log('编辑场景')
                            toast({
                                title: '编辑场景',
                                description: '编辑场景'
                            })
                            return
                        }

                        if (form) {
                            el.addEventListener('click', async (e) => {
                                e.preventDefault()

                                try {
                                    el.disabled = true

                                    // 获取表单数据
                                    const formData = (form as any).gForm?.getData() || {}
                                    const amount = formData.amount || formData.totalAmount || 0
                                    const openid = new URLSearchParams(window.location.search).get('openid')
                                    const issueId = window.location.pathname.split('/').pop()
                                    console.log('表单完整数据:', formData)
                                    console.log('支付金额:', amount)
                                    console.log('OpenID:', openid)
                                    console.log('Issue ID:', issueId)

                                    if (!amount || amount <= 0) {
                                        alert('支付金额必须大于0')
                                        el.disabled = false
                                        return
                                    }

                                    if (!issueId) {
                                        alert('获取issueId失败')
                                        return
                                    }

                                    if (!openid) {
                                        alert('获取openid失败==>' + window.location.href)
                                        // alert('获取openid失败')
                                        return
                                    }

                                    // 调用微信支付
                                    const wx = (window as any).wx
                                    if (!wx) {
                                        throw new Error('未检测到微信JS SDK')
                                    }

                                    // 获取用户信息
                                    let userInfo: any = null;
                                    try {
                                        const userInfoPromise = new Promise<any>((resolve, reject) => {
                                            wx.getUserInfo({
                                                success: function (res) {
                                                    console.log(res.userInfo); // 包含用户的昵称、头像等信息
                                                    resolve(res.userInfo);
                                                },
                                                fail: function (res) {
                                                    console.log('获取用户信息失败！' + res.errMsg);
                                                    reject(res.errMsg);
                                                }
                                            });
                                        });
                                        
                                        // 设置超时，避免阻塞支付流程
                                        userInfo = await Promise.race([
                                            userInfoPromise,
                                            new Promise<null>(resolve => setTimeout(() => resolve(null), 2000))
                                        ]);
                                    } catch (error) {
                                        console.error('获取用户信息出错:', error);
                                        // 继续支付流程，不阻塞
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
                                            userInfo // 添加用户信息
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
                                    console.error('支付失败:', error)
                                    alert('支付失败,' + (error.message || error || '请重试'))
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
