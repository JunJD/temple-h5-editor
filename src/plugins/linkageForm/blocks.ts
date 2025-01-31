import type { BlockProperties, Editor } from 'grapesjs';
import { PluginOptions } from '.';
import { typeForm, typeFormItem, typeInput, typeAmountInput, typeSubmitButton } from './components';
import { typeRadioButton, typeRadioButtonGroup } from './radioGroup'

export default function (editor: Editor, opt: Required<PluginOptions>) {
    const opts = opt;
    const bm = editor.BlockManager;
    const addBlock = (id: string, def: BlockProperties) => {
        opts.blocks?.indexOf(id)! >= 0 && bm.add(id, {
            ...def,
            category: opts.category,
            select: true,
            ...opt.block(id),
        });
    }

    // 表单块 - 包含完整的演示结构
    addBlock(typeForm, {
        label: '表单',
        content: {
            type: typeForm,
            components: [
                {
                    type: typeFormItem,
                    attributes: { name: 'userType', label: '用户类型' },
                    components: [{
                        type: typeRadioButtonGroup,
                        attributes: { value: 'normal' },
                        components: [
                            {
                                type: typeRadioButton,
                                attributes: { value: 'normal', label: '普通用户' }
                            },
                            {
                                type: typeRadioButton,
                                attributes: { value: 'vip', label: 'VIP用户' }
                            }
                        ]
                    }]
                },
                {
                    type: typeFormItem,
                    attributes: { name: 'price', label: '商品价格' },
                    components: [{
                        type: typeAmountInput,
                        attributes: {
                            placeholder: '请输入商品价格'
                        }
                    }]
                },
                {
                    type: typeFormItem,
                    attributes: { name: 'finalPrice', label: '最终价格' },
                    components: [{
                        type: typeAmountInput,
                        attributes: {
                            placeholder: '最终价格（自动计算）',
                            expression: 'form.userType === "vip" ? form.price * 0.8 : form.price'
                        }
                    }]
                },
                {
                    type: typeSubmitButton,
                    attributes: { text: '提交订单' }
                }
            ]
        }
    });

    // 表单项块
    addBlock(typeFormItem, {
        label: '表单项',
        content: {
            type: typeFormItem,
            attributes: { name: 'field' },
            components: [{
                type: typeInput,
                attributes: {
                    placeholder: '请输入...'
                }
            }]
        }
    });

    // 输入框块
    addBlock(typeInput, {
        label: '输入框',
        content: {
            type: typeFormItem,
            attributes: { name: 'field' },
            components: [{
                type: typeInput,
                attributes: {
                    placeholder: '请输入...'
                }
            }]
        }
    });

    // 单选按钮组块
    addBlock(typeRadioButtonGroup, {
        label: '单选按钮组',
        content: {
            type: typeFormItem,
            attributes: { name: 'options' },
            components: [{
                type: typeRadioButtonGroup,
                components: [
                    {
                        type: typeRadioButton,
                        attributes: {
                            value: 'option1',
                            label: '选项一'
                        }
                    },
                    {
                        type: typeRadioButton,
                        attributes: {
                            value: 'option2',
                            label: '选项二'
                        }
                    },
                    {
                        type: typeRadioButton,
                        attributes: {
                            value: 'option3',
                            label: '选项三'
                        }
                    }
                ]
            }]
        }
    });

    // 提交按钮块
    addBlock(typeSubmitButton, {
        label: '提交按钮',
        content: {
            type: typeSubmitButton,
            attributes: { text: '提交' }
        }
    });
}