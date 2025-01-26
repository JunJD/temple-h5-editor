import { Editor, Component } from "grapesjs";

export const typeRadioButton = 'radio-button'
export const typeRadioButtonGroup = 'radio-button-group';
export const radioButtonActiveClass = 'radio-button-active';

export default function (editor: Editor) {
    const { Components } = editor;

    Components.addType(typeRadioButton, {
        isComponent: el => el.classList?.contains('radio-button'),
        model: {
            defaults: {
                tagName: 'button',
                attributes: { type: 'button', role: 'radio' },
                classes: ['radio-button'],
                traits: [
                    {
                        type: 'text',
                        name: 'value',
                        label: '值',
                    },
                    {
                        type: 'text',
                        name: 'label',
                        label: '标签',
                    }
                ],
                // 默认样式
                style: {
                    padding: '12px 24px',
                    margin: '0',
                    border: '1px solid #ddd',
                    'border-radius': '4px',
                    cursor: 'pointer',
                    'background-color': '#fff',
                    'text-align': 'center',
                    'font-size': '14px',
                    'line-height': '1.5',
                    flex: '0 0 auto',
                    width: 'calc((100% - 24px) / 3)', // 默认三等分
                },
            },

            init() {
                this.on('change:attributes:value', this.handleValueChange);
                this.on('change:attributes:label', this.handleLabelChange);
                
                // 设置初始内容
                const attrs = this.getAttributes();
                if (!this.get('content')) {
                    this.set('content', attrs.label || attrs.value || '未命名');
                }
            },

            handleValueChange() {
                const value = this.getAttributes().value || '';
                if (!this.getAttributes().label) {
                    this.set('content', value || '未命名');
                }
            },

            handleLabelChange() {
                const label = this.getAttributes().label || '';
                this.set('content', label || this.getAttributes().value || '未命名');
            },

            isSelected() {
                const parent = this.parent();
                if (parent && parent.get('type') === typeRadioButtonGroup) {
                    return parent.getAttributes().value === this.getAttributes().value;
                }
                return false;
            },
        },
    });

    Components.addType(typeRadioButtonGroup, {
        isComponent: el => el.classList?.contains('radio-button-group'),
        model: {
            defaults: {
                tagName: 'div',
                classes: ['radio-button-group'],
                attributes: { 
                    role: 'radiogroup',
                    columns: '3', // 默认3列
                },
                traits: [
                    {
                        type: 'text',
                        name: 'value',
                        label: '选中值',
                    },
                    {
                        type: 'text',
                        name: 'label',
                        label: '标题',
                    },
                    {
                        type: 'select',
                        name: 'direction',
                        label: '排列方向',
                        options: [
                            { id: 'horizontal', value: 'horizontal', name: '水平' },
                            { id: 'vertical', value: 'vertical', name: '垂直' }
                        ],
                        default: 'horizontal',
                    },
                    {
                        type: 'select',
                        name: 'size',
                        label: '尺寸',
                        options: [
                            { id: 'small', value: 'small', name: '小' },
                            { id: 'medium', value: 'medium', name: '中' },
                            { id: 'large', value: 'large', name: '大' }
                        ],
                        default: 'medium',
                    },
                    {
                        type: 'checkbox',
                        name: 'disabled',
                        label: '禁用',
                    },
                    {
                        type: 'number',
                        name: 'columns',
                        label: '每行按钮数',
                        default: 3,
                        min: 1,
                        max: 12,
                    },
                    {
                        type: 'slider',
                        name: 'horizontalGap',
                        label: '水平间距',
                        default: 12,
                        min: 0,
                        max: 48,
                        step: 4,
                    },
                    {
                        type: 'slider',
                        name: 'verticalGap',
                        label: '垂直间距',
                        default: 12,
                        min: 0,
                        max: 48,
                        step: 4,
                    },
                    {
                        type: 'text',
                        name: 'expression',
                        label: '联动表达式',
                        placeholder: '例如: form.type === "vip" ? "option1" : "option2"'
                    }
                ],
                'script-props': ['classactive', 'direction', 'size', 'disabled'],
                classactive: radioButtonActiveClass,
                script: function(props) {
                    const el = this;
                    const classActive = props.classactive;
                    const formItem = el.closest('.form-item');
                    
                    const updateRadios = (selectedValue) => {
                        const radios = el.querySelectorAll('[role=radio]');
                        radios.forEach(radio => {
                            const isSelected = radio.getAttribute('value') === selectedValue;
                            if (isSelected) {
                                radio.classList.add(classActive);
                                radio.setAttribute('aria-checked', 'true');
                            } else {
                                radio.classList.remove(classActive);
                                radio.setAttribute('aria-checked', 'false');
                            }
                        });

                        // 更新 formItem 的值
                        if (formItem) {
                            const event = new CustomEvent('field:change', {
                                detail: { value: selectedValue }
                            });
                            formItem.dispatchEvent(event);
                        }
                    };

                    // 初始化状态
                    const initValue = el.getAttribute('value');
                    updateRadios(initValue);

                    // 点击事件处理
                    el.addEventListener('click', (ev) => {
                        if (el.getAttribute('disabled') === 'true') return;
                        const radio = ev.target.closest('[role=radio]');
                        if (radio) {
                            const value = radio.getAttribute('value');
                            el.setAttribute('value', value);
                            updateRadios(value);
                        }
                    });

                    // 处理表单字段变化
                    if (formItem) {
                        formItem.addEventListener('form:field:change', (e: any) => {
                            const { value, formData } = e.detail;
                            
                            // 如果有联动表达式，则计算新值
                            const expression = el.getAttribute('expression');
                            if (expression) {
                                try {
                                    const form = formData;
                                    const calculate = new Function('form', `return ${expression}`);
                                    const newValue = calculate(form);
                                    
                                    // 更新选中值
                                    el.setAttribute('value', newValue);
                                    updateRadios(newValue);
                                } catch (error) {
                                    console.error('表达式计算错误:', error);
                                }
                            } else {
                                // 如果没有表达式，直接更新值
                                if (value !== undefined) {
                                    el.setAttribute('value', value);
                                    updateRadios(value);
                                }
                            }
                        });
                    }
                },
                style: {
                    display: 'flex',
                    'flex-wrap': 'wrap',
                    gap: '12px',
                    padding: '8px',
                },
                components: [
                    {
                        type: typeRadioButton,
                        attributes: { value: 'option1', label: '选项一', 'aria-checked': 'true' },
                        content: '选项一'
                    },
                    {
                        type: typeRadioButton,
                        attributes: { value: 'option2', label: '选项二', 'aria-checked': 'false' },
                        content: '选项二'
                    },
                    {
                        type: typeRadioButton,
                        attributes: { value: 'option3', label: '选项三', 'aria-checked': 'false' },
                        content: '选项三'
                    }
                ]
            },

            init() {
                this.on('change:attributes:value', this.handleSelectedChange);
                this.on('change:attributes:direction', this.handleDirectionChange);
                this.on('change:attributes:size', this.handleSizeChange);
                this.on('change:attributes:disabled', this.handleDisabledChange);
                this.on('change:attributes:columns', this.handleColumnsChange);
                this.on('change:attributes:horizontalGap', this.handleGapChange);
                this.on('change:attributes:verticalGap', this.handleGapChange);
                this.on('component:add', this.handleChildAdd);

                // 初始化时应用列数设置
                this.handleColumnsChange();
            },

            handleDirectionChange() {
                const direction = this.getAttributes().direction || 'horizontal';
                this.addStyle({
                    'flex-direction': direction === 'vertical' ? 'column' : 'row'
                });
                this.handleColumnsChange();
            },

            handleSizeChange() {
                const size = this.getAttributes().size || 'medium';
                const sizeMap = {
                    small: { padding: '8px 16px', 'font-size': '12px' },
                    medium: { padding: '12px 24px', 'font-size': '14px' },
                    large: { padding: '16px 32px', 'font-size': '16px' }
                };
                
                this.components().forEach((child: Component) => {
                    if (child.get('type') === typeRadioButton) {
                        child.addStyle(sizeMap[size]);
                    }
                });
            },

            handleDisabledChange() {
                const disabled = this.getAttributes().disabled === 'true';
                this.components().forEach((child: Component) => {
                    if (child.get('type') === typeRadioButton) {
                        child.addAttributes({ disabled: disabled });
                        child.addStyle({
                            'opacity': disabled ? '0.5' : '1',
                            'cursor': disabled ? 'not-allowed' : 'pointer'
                        });
                    }
                });
            },

            handleGapChange() {
                const horizontalGap = this.getAttributes().horizontalGap || 12;
                const verticalGap = this.getAttributes().verticalGap || 12;
                this.addStyle({ 
                    'column-gap': `${horizontalGap}px`,
                    'row-gap': `${verticalGap}px`
                });
                // 重新计算列宽
                this.handleColumnsChange();
            },

            handleColumnsChange() {
                const columns = parseInt(this.getAttributes().columns) || 3; // 默认3列
                const direction = this.getAttributes().direction || 'horizontal';
                const horizontalGap = parseInt(this.getAttributes().horizontalGap) || 12;
                
                if (direction === 'vertical') {
                    this.components().forEach((child: Component) => {
                        if (child.get('type') === typeRadioButton) {
                            child.addStyle({ width: 'auto' });
                        }
                    });
                } else {
                    const width = `calc((100% - ${(columns - 1) * horizontalGap}px) / ${columns})`;
                    this.components().forEach((child: Component) => {
                        if (child.get('type') === typeRadioButton) {
                            child.addStyle({ width });
                        }
                    });
                }
            },

            handleSelectedChange() {
                const selected = this.getAttributes().value;
                this.components().forEach((child: Component) => {
                    if (child.get('type') === typeRadioButton) {
                        const isSelected = child.getAttributes().value === selected;
                        if (isSelected) {
                            child.addClass(radioButtonActiveClass);
                            child.addAttributes({ 'aria-checked': 'true' });
                        } else {
                            child.removeClass(radioButtonActiveClass);
                            child.addAttributes({ 'aria-checked': 'false' });
                        }
                        child.addStyle({
                            'background-color': isSelected ? '#e6f7ff' : '#fff',
                            'border-color': isSelected ? '#1890ff' : '#ddd',
                            color: isSelected ? '#1890ff' : '#000',
                        });
                    }
                });
            },

            handleChildAdd(child: Component) {
                if (child.get('type') === typeRadioButton) {
                    const selected = this.getAttributes().value;
                    const isSelected = child.getAttributes().value === selected;
                    child.addAttributes({
                        'aria-checked': isSelected ? 'true' : 'false',
                        role: 'radio'
                    });
                    
                    // 应用当前的尺寸
                    const size = this.getAttributes().size || 'medium';
                    this.handleSizeChange();
                    
                    // 应用当前的禁用状态
                    const disabled = this.getAttributes().disabled === 'true';
                    if (disabled) {
                        this.handleDisabledChange();
                    }

                    // 应用当前的列数设置
                    this.handleColumnsChange();
                }
            },
        }
    });
}