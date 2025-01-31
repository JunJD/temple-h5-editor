import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../common/base";
import { BaseTraitsFactory } from "../common/traits-factory";
import { LINKAGE_FORM_TYPES } from "./constants";

// Traits工厂
class LinkageFormTraitsFactory extends BaseTraitsFactory {
    constructor() {
        super()
    }

    // 获取标签trait
    static getLabelTrait() {
        return {
            type: 'text',
            label: '左侧标签',
            name: 'label',
            changeProp: true
        };
    }

    // 获取后缀trait
    static getSuffixTrait() {
        return {
            type: 'text',
            label: '右侧标签',
            name: 'suffix',
            changeProp: true
        };
    }

    // 获取输入类型trait
    static getInputTypeTrait() {
        return {
            type: 'text',
            label: '输入类型',
            name: 'input-type',
            changeProp: true
        };
    }
}

export class LinkageFormComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const editor = this.editor;

        // 注册输入组件
        editor.Components.addType(LINKAGE_FORM_TYPES['input-group'], {
            model: {
                defaults: {
                    droppable: false,
                    traits: [
                        LinkageFormTraitsFactory.getLabelTrait(),
                        LinkageFormTraitsFactory.getSuffixTrait(),
                        LinkageFormTraitsFactory.getInputTypeTrait()
                    ],
                    'script-props': ['label', 'suffix', 'input-type'],
                    components: `
                        <div class="input_item">
                            <span></span>
                            <input class="form-input">
                            <span></span>
                        </div>
                    `,
                    styles: `
                        .input_item {
                            border: 1px solid #ccc;
                            border-radius: 8px;
                            padding: 12px 20px;
                            margin-top: 20px;
                            display: flex;
                            display: -webkit-flex;
                            align-items: center;
                            background-color: #fff;
                        }
                        
                        .input_item > span:first-child {
                            color: #666666;
                            font-size: 16px;
                            height: 24px;
                            line-height: 24px;
                        }

                        .input_item > span:last-child {
                            color: #666666;
                            font-size: 16px;
                            height: 24px;
                            line-height: 24px;
                            margin-left: 8px;
                        }
                        
                        .form-input {
                            border: none;
                            outline: none;
                            font-size: 16px;
                            color: #696969;
                            height: 24px;
                            line-height: 24px;
                            flex: 1;
                            width: 100%;
                            padding-right: 12px;
                            text-align: right;
                            background: transparent;
                        }
                    `,
                    script: function(props) {
                        const el = this as HTMLElement;
                        const label = props.label || '';
                        const suffix = props.suffix || '';
                        const inputType = props['input-type'] || 'text';

                        // 更新标签
                        const labelEl = el.querySelector('span:first-child');
                        if (labelEl) {
                            labelEl.textContent = label;
                        }

                        const suffixEl = el.querySelector('span:last-child');
                        if (suffixEl) {
                            suffixEl.textContent = suffix;
                        }

                        // 更新输入框
                        const inputEl = el.querySelector('input') as HTMLInputElement;
                        if (inputEl) {
                            inputEl.type = 'text' ;
                            if (inputType === 'number') {
                                // 添加输入限制
                                inputEl.addEventListener('input', (e) => {
                                    const target = e.target as HTMLInputElement;
                                    // 只允许输入数字
                                    target.value = target.value.replace(/[^\d]/g, '');
                                });
                            }
                        }
                    }
                }
            }
        });
    }
} 