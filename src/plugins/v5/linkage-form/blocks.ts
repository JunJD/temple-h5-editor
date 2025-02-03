import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadBlocks } from "../common/base";
import { LINKAGE_FORM_TYPES, PRESETS } from "./constants";
import { CASCADE_SELECTOR_TYPES } from "./constants";


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
                type: LINKAGE_FORM_TYPES['input-group'],
                label: PRESETS.number.label,
                suffix: PRESETS.number.suffix,
                'input-type': PRESETS.number.type
            },
            attributes: { class: 'fa fa-plus-square' }
        });

        // 添加金额输入block
        blockManager.add('amount-input', {
            label: '金额输入',
            category: '表单组件',
            content: {
                type: LINKAGE_FORM_TYPES['input-group'],
                label: PRESETS.amount.label,
                suffix: PRESETS.amount.suffix,
                'input-type': PRESETS.amount.type
            },
            attributes: { class: 'fa fa-money' }
        });

        // 添加姓名输入block
        blockManager.add('name-input', {
            label: '姓名输入',
            category: '表单组件',
            content: {
                type: LINKAGE_FORM_TYPES['input-group'],
                label: PRESETS.name.label,
                suffix: PRESETS.name.suffix,
                'input-type': PRESETS.name.type
            },
            attributes: { class: 'fa fa-user' }
        });

        // 添加级联选择器block
        blockManager.add('cascade-selector', {
            label: '级联选择器',
            category: '表单组件',
            content: {
                type: CASCADE_SELECTOR_TYPES['cascade-selector'],
                style: {
                    padding: '23px 5%',
                    border: '1px solid #ccc',
                    'background-color': '#fff',
                    'border-radius': '10px',
                    display: 'flex',
                    'flex-direction': 'column',
                    gap: '20px'
                }
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
                        attributes: { name: 'quantity', label: '' },
                        components: [{
                            type: LINKAGE_FORM_TYPES['input-group'],
                            label: PRESETS.number.label,
                            suffix: PRESETS.number.suffix,
                            'input-type': PRESETS.number.type,
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
                    }
                ]
            },
            attributes: { class: 'fa fa-wpforms' }
        });
    }
} 