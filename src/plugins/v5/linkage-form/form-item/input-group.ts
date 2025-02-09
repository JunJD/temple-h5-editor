import { Editor } from "grapesjs";
import { LINKAGE_FORM_TYPES } from "../constants";
import { BaseTraitsFactory } from "../../common/traits-factory";

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

    // 获取尺寸trait
    static getSizeTrait() {
        return {
            type: 'select',
            label: '尺寸',
            name: 'size',
            options: [
                { id: 'default', value: 'default', name: '默认' },
                { id: 'large', value: 'large', name: '大' },
                { id: 'xlarge', value: 'xlarge', name: '超大' }
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
            attributes: {
                mentionItems: ['form']
            },
            placeholder: '例如: form.age * 2',
            changeProp: true
        };
    }

    // 获取占位符trait
    static getPlaceholderTrait() {
        return {
            type: 'text',
            label: '占位提示文本',
            name: 'placeholder',
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

    // 获取布局方式trait
    static getLayoutTrait() {
        return {
            type: 'select',
            label: '布局方式',
            name: 'layout',
            options: [
                { id: 'row', value: 'row', name: '行内' },
                { id: 'column', value: 'column', name: '垂直' }
            ],
            changeProp: true
        };
    }
}

export const loadInputGroup = (editor: Editor) => {
    // 注册输入组件
    editor.Components.addType(LINKAGE_FORM_TYPES['input-group'], {
        model: {
            defaults: {
                droppable: false,
                traits: [
                    LinkageFormTraitsFactory.getLabelTrait(),
                    LinkageFormTraitsFactory.getSuffixTrait(),
                    LinkageFormTraitsFactory.getInputTypeTrait(),
                    LinkageFormTraitsFactory.getSizeTrait(),
                    LinkageFormTraitsFactory.getExpressionTrait(),
                    LinkageFormTraitsFactory.getPlaceholderTrait(),
                    LinkageFormTraitsFactory.getRequiredTrait()
                ],
                'script-props': ['label', 'suffix', 'input-type', 'size', 'expression', 'placeholder', 'required'],
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
                                padding-left: 12px;
                                text-align: left;
                                background: transparent;
                            }
    
                            /* 大尺寸 */
                            .input_item.large {
                                padding: 16px 24px;
                            }
                            
                            .input_item.large > span:first-child,
                            .input_item.large > span:last-child {
                                font-size: 18px;
                                height: 32px;
                                line-height: 32px;
                            }
                            
                            .input_item.large .form-input {
                                font-size: 18px;
                                height: 32px;
                                line-height: 32px;
                                padding-left: 16px;
                            }
    
                            /* 超大尺寸 */
                            .input_item.xlarge {
                                padding: 20px 32px;
                            }
                            
                            .input_item.xlarge > span:first-child,
                            .input_item.xlarge > span:last-child {
                                font-size: 20px;
                                height: 40px;
                                line-height: 40px;
                            }
                            
                            .input_item.xlarge .form-input {
                                font-size: 20px;
                                height: 40px;
                                line-height: 40px;
                                padding-left: 20px;
                            }
                        `,
                script: function (props) {
                    const el = this as HTMLElement;
                    const label = props.label || '';
                    const suffix = props.suffix || '';
                    const inputType = props['input-type'] || 'text';
                    const size = props.size || 'default';
                    const expression = props.expression || '';
                    const placeholder = props.placeholder || '';
                    const required = props.required || false;

                    // 更新尺寸类名
                    const inputItem = el.querySelector('.input_item');
                    if (inputItem) {
                        inputItem.classList.remove('large', 'xlarge');
                        if (size !== 'default') {
                            inputItem.classList.add(size);
                        }
                    }

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

                        // 设置占位符
                        inputEl.placeholder = placeholder;
                    }
                }
            }
        }
    });


    // 注册输入组件（富文本）
    editor.Components.addType(LINKAGE_FORM_TYPES['input-group-rich-text'], {
        model: {
            defaults: {
                droppable: false,
                traits: [
                    LinkageFormTraitsFactory.getLabelTrait(),
                    LinkageFormTraitsFactory.getSuffixTrait(),
                    LinkageFormTraitsFactory.getLayoutTrait(),
                    LinkageFormTraitsFactory.getSizeTrait(),
                    LinkageFormTraitsFactory.getPlaceholderTrait(),
                    LinkageFormTraitsFactory.getRequiredTrait()
                ],
                'script-props': ['label', 'suffix', 'layout', 'size', 'placeholder', 'required'],
                components: `
                    <div class="input_item">
                        <div class="label-wrapper">
                            <span class="label"></span>
                        </div>
                        <div class="input-wrapper">
                            <textarea class="form-control rich-text" rows="3"></textarea>
                            <span class="suffix"></span>
                        </div>
                    </div>
                `,
                styles: `
                    .input_item {
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        padding: 12px 20px;
                        margin-top: 20px;
                        background-color: #fff;
                    }
                    
                    .input_item.row-layout {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .input_item.column-layout {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .input_item.column-layout .label-wrapper {
                        width: 100%;
                        text-align: left;
                    }
                    
                    .label-wrapper {
                        flex-shrink: 0;
                    }

                    .input-wrapper {
                        flex: 1;
                        display: flex;
                        gap: 8px;
                        align-items: flex-start;
                        width: 100%;
                    }
                    
                    .label {
                        color: #666666;
                        font-size: 16px;
                        height: 24px;
                        line-height: 24px;
                        white-space: nowrap;
                        display: inline-block;
                    }

                    .suffix {
                        color: #666666;
                        font-size: 16px;
                        height: 24px;
                        line-height: 24px;
                        white-space: nowrap;
                    }
                    
                    .rich-text {
                        border: none;
                        outline: none;
                        font-size: 16px;
                        color: #696969;
                        width: 100%;
                        padding: 8px 12px;
                        text-align: left;
                        background: transparent;
                        resize: vertical;
                        min-height: 80px;
                    }

                    .rich-text:focus {
                        box-shadow: none;
                    }

                    /* 大尺寸 */
                    .input_item.large {
                        padding: 16px 24px;
                    }
                    
                    .input_item.large .label,
                    .input_item.large .suffix {
                        font-size: 18px;
                        height: 32px;
                        line-height: 32px;
                    }
                    
                    .input_item.large .rich-text {
                        font-size: 18px;
                        padding: 12px 16px;
                        min-height: 100px;
                    }

                    /* 超大尺寸 */
                    .input_item.xlarge {
                        padding: 20px 32px;
                    }
                    
                    .input_item.xlarge .label,
                    .input_item.xlarge .suffix {
                        font-size: 20px;
                        height: 40px;
                        line-height: 40px;
                    }
                    
                    .input_item.xlarge .rich-text {
                        font-size: 20px;
                        padding: 16px 20px;
                        min-height: 120px;
                    }
                `,
                script: function (props) {
                    const el = this as HTMLElement;
                    const label = props.label || '';
                    const suffix = props.suffix || '';
                    const layout = props.layout || 'row';
                    const size = props.size || 'default';
                    const placeholder = props.placeholder || '';
                    const required = props.required || false;

                    // 更新布局和尺寸类名
                    const inputItem = el.querySelector('.input_item');
                    if (inputItem) {
                        // 清除所有可能的类名
                        inputItem.classList.remove('row-layout', 'column-layout', 'large', 'xlarge');

                        // 添加布局类名
                        inputItem.classList.add(`${layout}-layout`);

                        // 添加尺寸类名
                        if (size !== 'default') {
                            inputItem.classList.add(size);
                        }
                    }

                    // 更新标签
                    const labelEl = el.querySelector('.label');
                    if (labelEl) {
                        labelEl.textContent = label;
                    }

                    const suffixEl = el.querySelector('.suffix');
                    if (suffixEl) {
                        suffixEl.textContent = suffix;
                    }

                    // 更新文本框
                    const textareaEl = el.querySelector('textarea') as HTMLTextAreaElement;
                    if (textareaEl) {
                        // 设置必填状态
                        if (required) {
                            textareaEl.classList.add('required');
                        } else {
                            textareaEl.classList.remove('required');
                        }

                        // 监听输入变化，触发字段变更事件
                        textareaEl.addEventListener('input', (e) => {
                            const value = (e.target as HTMLTextAreaElement).value;
                            const formItem = el.closest('.form-item');
                            if (formItem) {
                                const event = new CustomEvent('field:change', {
                                    detail: { value }
                                });
                                formItem.dispatchEvent(event);
                            }
                        });

                        // 自动调整高度
                        textareaEl.addEventListener('input', function () {
                            this.style.height = 'auto';
                            this.style.height = (this.scrollHeight) + 'px';
                        });

                        // 设置占位符
                        textareaEl.placeholder = placeholder;
                    }
                }
            }
        }
    });

    // 注册输入组件（数字+-）
    editor.Components.addType(LINKAGE_FORM_TYPES['input-number-group'], {
        model: {
            defaults: {
                droppable: false,
                traits: [
                    LinkageFormTraitsFactory.getLabelTrait(),
                    LinkageFormTraitsFactory.getSuffixTrait(),
                    LinkageFormTraitsFactory.getInputTypeTrait(),
                    LinkageFormTraitsFactory.getSizeTrait(),
                    LinkageFormTraitsFactory.getExpressionTrait(),
                    LinkageFormTraitsFactory.getPlaceholderTrait(),
                    LinkageFormTraitsFactory.getRequiredTrait()
                ],
                'script-props': ['label', 'suffix', 'input-type', 'size', 'expression', 'placeholder', 'required'],
                components: `
                            <div class="input_item">
                                <span class="label"></span>
                                <div class="number-input-wrapper">
                                    <button type="button" class="minus">-</button>
                                    <input class="form-input-number" type="text" readonly>
                                    <button type="button" class="plus">+</button>
                                </div>
                                <span class="suffix"></span>
                            </div>
                        `,
                styles: `
                            .input_item {
                                width: 100%;
                                user-select: none;
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                padding: 12px 20px;
                                margin-top: 20px;
                                display: flex;
                                display: -webkit-flex;
                                align-items: center;
                                background-color: #fff;
                                gap: 12px;
                            }
                            
                            .input_item .label {
                                color: #666666;
                                font-size: 16px;
                                height: 24px;
                                line-height: 24px;
                                white-space: nowrap;
                            }
    
                            .input_item .suffix {
                                color: #666666;
                                font-size: 16px;
                                height: 24px;
                                line-height: 24px;
                                white-space: nowrap;
                            }

                            .number-input-wrapper {
                                margin-left: auto;
                                display: flex;
                                align-items: center;
                                gap: 2px;
                            }
                            
                            .form-input-number {
                                border: none;
                                outline: none;
                                font-size: 16px;
                                color: #696969;
                                height: 24px;
                                line-height: 24px;
                                width: 40px;
                                text-align: center;
                                background: transparent;
                                cursor: default;
                                user-select: none;
                            }

                            .minus,
                            .plus {
                                user-select: none;
                                cursor: pointer;
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                border: none;
                                background: #a77c37;
                                color: #fff;
                                font-size: 20px;
                                line-height: 1;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 0;
                                box-sizing: border-box;
                            }

                            .minus[disabled],
                            .plus[disabled] {
                                opacity: 0.5;
                                cursor: not-allowed;
                                pointer-events: none;
                            }
    
                            /* 大尺寸 */
                            .input_item.large {
                                padding: 16px 24px;
                            }
                            
                            .input_item.large .label,
                            .input_item.large .suffix {
                                font-size: 18px;
                                height: 32px;
                                line-height: 32px;
                            }
                            
                            .input_item.large .form-input-number {
                                font-size: 18px;
                                height: 32px;
                                line-height: 32px;
                            }

                            .input_item.large .minus,
                            .input_item.large .plus {
                                width: 40px;
                                height: 40px;
                            }
    
                            /* 超大尺寸 */
                            .input_item.xlarge {
                                padding: 20px 32px;
                            }
                            
                            .input_item.xlarge .label,
                            .input_item.xlarge .suffix {
                                font-size: 20px;
                                height: 40px;
                                line-height: 40px;
                            }
                            
                            .input_item.xlarge .form-input-number {
                                font-size: 20px;
                                height: 40px;
                                line-height: 40px;
                            }

                            .input_item.xlarge .minus,
                            .input_item.xlarge .plus {
                                width: 48px;
                                height: 48px;
                            }
                        `,
                script: function (props) {
                    const el = this as HTMLElement;
                    const label = props.label || '';
                    const suffix = props.suffix || '';
                    const size = props.size || 'default';
                    const expression = props.expression || '';
                    const required = props.required || false;

                    // 更新尺寸类名
                    const inputItem = el.querySelector('.input_item');
                    if (inputItem) {
                        inputItem.classList.remove('large', 'xlarge');
                        if (size !== 'default') {
                            inputItem.classList.add(size);
                        }
                    }

                    // 更新标签
                    const labelEl = el.querySelector('.label');
                    if (labelEl) {
                        labelEl.textContent = label;
                    }

                    const suffixEl = el.querySelector('.suffix');
                    if (suffixEl) {
                        suffixEl.textContent = suffix;
                    }

                    // 更新输入框
                    const inputEl = el.querySelector('input') as HTMLInputElement;
                    const minusBtn = el.querySelector('.minus') as HTMLButtonElement;
                    const plusBtn = el.querySelector('.plus') as HTMLButtonElement;

                    if (inputEl && minusBtn && plusBtn) {
                        // 设置必填状态
                        if (required) {
                            inputEl.classList.add('required');
                        } else {
                            inputEl.classList.remove('required');
                        }

                        // 设置默认值
                        inputEl.value = '0';

                        // 更新按钮状态
                        function updateButtonState() {
                            const currentValue = parseInt(inputEl.value) || 0;
                            minusBtn.disabled = currentValue <= 0;
                        }

                        // 处理加减按钮点击
                        minusBtn.addEventListener('click', () => {
                            const currentValue = parseInt(inputEl.value) || 0;
                            if (currentValue > 0) {
                                inputEl.value = String(currentValue - 1);
                                updateButtonState();
                                triggerChange();
                            }
                        });

                        plusBtn.addEventListener('click', () => {
                            const currentValue = parseInt(inputEl.value) || 0;
                            inputEl.value = String(currentValue + 1);
                            updateButtonState();
                            triggerChange();
                        });

                        // 初始化按钮状态
                        updateButtonState();

                        // 触发字段变更事件
                        function triggerChange() {
                            const formItem = el.closest('.form-item');
                            if (formItem) {
                                const event = new CustomEvent('field:change', {
                                    detail: { value: inputEl.value }
                                });
                                formItem.dispatchEvent(event);
                            }
                        }

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
                                    const newValue = Math.max(0, Math.floor(calculate(form)));

                                    // 只更新显示值，不触发新的事件
                                    inputEl.value = String(newValue);
                                    updateButtonState();
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