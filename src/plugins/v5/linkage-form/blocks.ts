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
    }
} 