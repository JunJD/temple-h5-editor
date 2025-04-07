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
                    tagName: 'div',
                    droppable: false,
                    attributes: { class: 'pay-button', role: 'button', 'aria-label': '立即支付' },
                    style: {
                        'width': '100%',
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
                        }
                    ],
                    'script-props': ['text'],
                    content: '立即支付',
                    script: function (props) {
                        const el = this as HTMLButtonElement
                        const form = el.closest('form')
                        // 是否是编辑场景 - 通过检查元素是否有data-gjs-type属性来判断
                        const isEdit = el.hasAttribute('data-gjs-type')

                        // 处理按钮文本和禁用状态
                        if (props.text) {
                            el.textContent = props.text;
                        }

                        if (isEdit) {
                            return
                        }

                        if (form) {
                            el.addEventListener('click', async (e) => {
                                e.preventDefault()

                                try {
                                    el.disabled = true

                                    // 获取表单数据
                                    const formData = (form as any).gForm?.getData() || {}
                                    const columns = (form as any).gForm?.getColumns() || []
                                    const amount = formData.amount || formData.totalAmount || 0
                                    const name = formData.name ||  '-'
                                    const name1 = (name.substring(0, 1).concat(name.length > 2 ? '某某' : '某')) ||  '-'

                                    console.log('form===>', form)
                                    const selectedNode = form?.querySelectorAll('.selected')
                                    if(!selectedNode || selectedNode.length < 2) {
                                        alert('请选择商品')
                                        return
                                    }
                                    console.log('selectedNode===>', selectedNode)
                                    const [goods1, goods2] = Array.from(selectedNode).map(item => {
                                        const label = item.querySelector('span')
                                        const button = item.querySelector('button')
                                        return label?.textContent ?? button?.textContent
                                    })
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
                                            goods1,
                                            goods2,
                                            name,
                                            name1,
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
                },

            }
        })
    }
}

export default PayButtonPlugin
