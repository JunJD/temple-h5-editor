import { Editor, PluginOptions } from 'grapesjs';
import { FormConfigDialog } from '@/components/builder/form-config-dialog';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import BasePluginV5 from '../common/base';
import { LINKAGE_FORM_TYPES, PRESETS } from '../linkage-form/constants';
import { CASCADE_SELECTOR_TYPES } from '../linkage-form/constants';
import { FormField } from '@/schemas';
import { OPtion } from '..';
import { PAY_BUTTON_TYPE } from '../pay-button';
import { CascadeSelectorOptions, DEFAULT_OPTIONS } from '../linkage-form/form-item/cascade-selector/constants';

interface FormComponent {
    type: string;
    attributes?: Record<string, any>;
    components?: any[];
    style?: Record<string, string>;
    content?: string;
    [key: string]: any;
}

interface FormConfig {
    fields: FormField[];
    goodsOptions?: CascadeSelectorOptions;
}

class ConfigurableFormPlugin extends BasePluginV5 {
    private dialogRoot: Root | null = null;
    private config: FormConfig = {
        fields: [
            {
                name: 'amount',
                label: '金额',
                type: 'input-group',
                required: true,
                suffix: '元',
                placeholder: '请输入金额',
                expression: ''
            }
        ],
        goodsOptions: DEFAULT_OPTIONS
    };

    constructor(editor: Editor,  options: OPtion) {
        super(editor, options);
        this.options = options
        if(options.formConfig) {
            if(options.formConfig.fields.length > 0) {
                this.config.fields = options.formConfig.fields;
            }
            if(options.formConfig.goodsOptions) {
                this.config.goodsOptions = options.formConfig.goodsOptions;
            }
        }
    }

    load(): void {
        this._loadCommands();
    }

    _loadCommands(): void {
        this.editor.Commands.add('configurable-form', {
            run: () => {
                if (!this.dialogRoot) {
                    const el = document.createElement('div');
                    document.body.appendChild(el);
                    this.dialogRoot = createRoot(el);
                }

                this.dialogRoot.render(
                    <FormConfigDialog
                        open={true}
                        onOpenChange={() => {
                            this.editor.Commands.stop('configurable-form');
                        }}
                        onSave={(newConfig) => {
                            this.config = newConfig;
                            this.options.updateFormConfig!(newConfig as any)
                            this.updateFormComponent();
                        }}
                        initialConfig={this.config}
                    />
                );
            },
            stop: () => {
                if (this.dialogRoot) {
                    this.dialogRoot.render(
                        <FormConfigDialog
                            open={false}
                            onOpenChange={() => {}}
                            onSave={() => {}}
                            initialConfig={this.config}
                        />
                    );
                }
            }
        });
    }

    private updateFormComponent() {
        try {
            const wrapper = this.editor.Components.getWrapper();
            const existingForm = wrapper?.find('form')[0];
            
            if (!existingForm) {
                // 如果表单不存在，创建新表单
                wrapper?.append([{
                    type: 'form',
                    components: this.generateFormComponents()
                }]);
                return;
            }

            // 获取所有表单项
            const existingFields = existingForm.components().filter(comp => 
                comp.get('type') === 'form-item'
            );

            if (existingFields.length < 2) {
                console.error('Form structure is invalid');
                return;
            }

            // 保持头部和尾部不变
            const headerComponent = existingFields[0];
            const footerComponent = existingFields[existingFields.length - 1];

            // 更新头部商品选择器组件的配置
            if (headerComponent) {
                const cascadeSelector = headerComponent.findType(CASCADE_SELECTOR_TYPES['cascade-selector'])[0];
                if (cascadeSelector) {
                    // 直接设置新的选项数据，不再使用traits
                    cascadeSelector.set('options', this.config.goodsOptions);
                    // 触发重渲染
                    cascadeSelector.trigger('rerender');
                    // 触发change:options事件，这会自动调用updateComponents
                    cascadeSelector.trigger('change:options', cascadeSelector, this.config.goodsOptions);
                }
            }

            // 清除中间的字段（保留头尾）
            const currentFieldComponents = existingFields.slice(1, -1);
            currentFieldComponents.forEach(comp => comp.remove());

            // 插入新的字段到头部和尾部之间
            const newFieldComponents = this.config.fields.map(field => ({
                type: 'form-item',
                attributes: { name: field.name, label: '' },
                components: [{
                    type: LINKAGE_FORM_TYPES[field.type],
                    label: `${field.label}:`,
                    suffix: field.suffix || '',
                    'input-type': field.type === 'input-group' ? 'number' : undefined,
                    required: field.required,
                    placeholder: field.placeholder,
                    defaultValue: field.defaultValue,
                    expression: field.expression,
                }]
            }));

            // 重新组织表单组件顺序
            existingForm.components().reset([
                headerComponent,
                ...newFieldComponents.map(comp => comp as any),
                footerComponent
            ]);
        } catch (error) {
            console.error('Error updating form component:', error);
        }
    }

    private generateFormComponents(): FormComponent[] {
        return [
            // 头部 - 选择项目
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
                        required: true,
                        options: this.config.goodsOptions
                    }
                ],
            },
            // 用户配置的字段
            ...this.config.fields.map(field => ({
                type: 'form-item',
                attributes: { name: field.name, label: '' },
                components: [{
                    type: LINKAGE_FORM_TYPES[field.type] || 'input-group',
                    label: `${field.label}:`,
                    suffix: field.suffix || '',
                    'input-type': field.type === 'input-group' ? 'number' : undefined,
                    required: field.required,
                    placeholder: field.placeholder,
                    defaultValue: field.defaultValue,
                    expression: field.expression,
                }]
            })),
            // 尾部 - 提交按钮
            {
                type: 'form-item',
                attributes: { name: 'submit', label: '' },
                style: {
                    'display': 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                },
                components: [{
                    type: 'form-item',
                    components: [{
                        type: PAY_BUTTON_TYPE,
                        label: '立即支付',
                        style: {
                            'background-color': '#a67c37',
                            'border-radius': '10px 10px 0 0',
                            'padding': '20px 0',
                            'box-sizing': 'border-box'
                        }
                    }]
                }]
            }
        ];
    }
}

export {
    ConfigurableFormPlugin
}