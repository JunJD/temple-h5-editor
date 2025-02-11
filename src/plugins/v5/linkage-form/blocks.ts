import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadBlocks } from "../common/base";
import { LINKAGE_FORM_TYPES, PRESETS } from "./constants";
import { CASCADE_SELECTOR_TYPES } from "./constants";
import { typeSubmitButton } from "@/plugins/linkageForm/components";


export class LinkageFormBlocks extends BaseLoadBlocks {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const blockManager = this.editor.Blocks;

        // 添加数字输入block
        blockManager.add('number-input', {
            label: '数量输入',
            category: '表单组件',
            content: {
                type: 'form-item',
                attributes: { name: 'quantity', label: '' },
                components: [{
                    type: LINKAGE_FORM_TYPES['input-number-group'],
                    label: PRESETS.number.label,
                    suffix: PRESETS.number.suffix,
                    required: true
                }]
            },
            attributes: { class: 'fa fa-plus-square' }
        });

        // 添加金额输入block
        blockManager.add('amount-input', {
            label: '金额输入',
            category: '表单组件',
            content: {
                type: 'form-item',
                attributes: { name: 'price', label: '' },
                components: [{
                    type: LINKAGE_FORM_TYPES['input-group'],
                    label: PRESETS.amount.label,
                    suffix: PRESETS.amount.suffix,
                    'input-type': PRESETS.amount.type,
                    required: true
                }]
            },
            attributes: { class: 'fa fa-money' }
        });

        // 添加姓名输入block
        blockManager.add('name-input', {
            label: '姓名输入',
            category: '表单组件',
            content: {
                type: 'form-item',
                attributes: { name: 'name', label: '' },
                components: [{
                    type: LINKAGE_FORM_TYPES['input-group'],
                    label: PRESETS.name.label,
                    suffix: PRESETS.name.suffix,
                    'input-type': PRESETS.name.type,
                    required: true
                }]
            },
            attributes: { class: 'fa fa-user' }
        });

        // 添加级联选择器block
        blockManager.add('cascade-selector', {
            label: '级联选择器',
            category: '表单组件',
            content: {
                type: 'form-item',
                attributes: { name: 'goods', label: '' },
                components: [
                    {
                        type: 'default',
                        style: {
                            'font-size': '16px',
                            'font-weight': 'bold',
                            'color': '#fff',
                            'text-align': 'center',
                            'background-color': '#a67c37',
                            'border-radius': '10px 10px 0 0',
                            'padding': '20px 0',
                            'box-sizing': 'border-box'
                        },
                        content: '选择项目'
                    },
                    {
                        type: CASCADE_SELECTOR_TYPES['cascade-selector'],
                        required: true
                    }
                ],
            }
        });

        // 添加演示表单block
        blockManager.add('demo-form', {
            label: '演示表单',
            category: '表单组件',
            content: {
                type: 'form',
                components: [
                    {
                        type: 'form-item',
                        attributes: { name: 'goods', label: '' },
                        components: [
                            {
                                type: 'default',
                                style: {
                                    'font-size': '16px',
                                    'font-weight': 'bold',
                                    'color': '#fff',
                                    'text-align': 'center',
                                    'background-color': '#a67c37',
                                    'border-radius': '10px 10px 0 0',
                                    'padding': '20px 0',
                                    'box-sizing': 'border-box'
                                },
                                content: '选择项目'
                            },
                            {
                                type: CASCADE_SELECTOR_TYPES['cascade-selector'],
                                required: true
                            }
                        ],
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'name', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-group'],
                            label: PRESETS.name.label,
                            suffix: PRESETS.name.suffix,
                            'input-type': PRESETS.name.type,
                            required: true
                        }]
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'quantity', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-number-group'],
                            label: PRESETS.number.label,
                            suffix: PRESETS.number.suffix,
                            required: true
                        }]
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'price', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-group'],
                            label: PRESETS.amount.label,
                            suffix: PRESETS.amount.suffix,
                            'input-type': PRESETS.amount.type,
                            required: true
                        }]
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'totalAmount', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-group'],
                            label: '总金额:',
                            suffix: '元',
                            'input-type': 'number',
                            expression: 'form.price * form.quantity || 0'
                        }]
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'remark', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-group-rich-text'],
                            label: '备注:',
                            suffix: '',
                            'input-type': 'text'
                        }]
                    },
                    {
                        type: 'form-item',
                        attributes: { name: 'submit', label: '' },
                        style: {
                            'display': 'flex',
                            'justify-content': 'center',
                            'align-items': 'center',
                        },
                        components: [{
                            type: typeSubmitButton,
                            label: '提交',
                            'button-type': 'submit'
                        }]
                    }
                ]
            },
            attributes: { class: 'fa fa-wpforms' }
        });
    }
} 