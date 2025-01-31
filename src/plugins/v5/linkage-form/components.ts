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
            type: 'select',
            label: '输入类型',
            name: 'input-type',
            options: [
                { id: 'text-type', value: 'text', name: '文本' },
                { id: 'number-type', value: 'number', name: '数字' }
            ],
            changeProp: true
        };
    }

    // 获取联动表达式trait
    static getExpressionTrait() {
        return {
            type: 'text',
            label: '联动表达式',
            name: 'expression',
            placeholder: '例如: form.age * 2',
            changeProp: true
        };
    }

    // 获取必填trait
    static getRequiredTrait() {
        return {
            type: 'checkbox',
            label: '必填',
            name: 'required',
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
                        LinkageFormTraitsFactory.getInputTypeTrait(),
                        LinkageFormTraitsFactory.getExpressionTrait(),
                        LinkageFormTraitsFactory.getRequiredTrait()
                    ],
                    'script-props': ['label', 'suffix', 'input-type', 'expression', 'required'],
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
                        const expression = props.expression || '';
                        const required = props.required || false;

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
                            // 设置类型和必填状态
                            inputEl.type = 'text';
                            if (required) {
                                inputEl.classList.add('required');
                            } else {
                                inputEl.classList.remove('required');
                            }

                            // 数字类型的输入限制
                            if (inputType === 'number') {
                                inputEl.addEventListener('input', (e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/[^\d]/g, '');
                                });
                            }

                            // 监听输入变化，触发字段变更事件
                            inputEl.addEventListener('input', (e) => {
                                const value = (e.target as HTMLInputElement).value;
                                const formItem = el.closest('.form-item');
                                if (formItem) {
                                    const event = new CustomEvent('field:change', {
                                        detail: { value }
                                    });
                                    formItem.dispatchEvent(event);
                                }
                            });

                            // 监听表单字段变化，处理联动
                            const formItem = el.closest('.form-item');
                            if (formItem && expression) {
                                formItem.addEventListener('form:field:change', (e: any) => {
                                    const { formData, source } = e.detail;
                                    
                                    // 避免自我更新导致的循环
                                    if (source === inputEl) {
                                        return;
                                    }
                                    
                                    // 处理表达式计算
                                    try {
                                        const form = formData;
                                        const calculate = new Function('form', `return ${expression}`);
                                        const newValue = calculate(form);
                                        
                                        // 只更新显示值，不触发新的事件
                                        inputEl.value = String(newValue);
                                    } catch (error) {
                                        console.error('表达式计算错误:', error);
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });
    }
} 