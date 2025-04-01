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
            
            // 初始加载时更新表单组件
            setTimeout(() => {
                this.updateFormComponent();
                this.updateFormDataAndColumns();
                // 初始化时也更新格式化模板列表组件的mentionItems
                this.updateFormatTempListMentionItems();
            }, 200); // 延迟执行，确保组件已加载
        }
    }

    /**
     * 更新格式化模板列表组件的mentionItems
     */
    private updateFormatTempListMentionItems() {
        try {
            console.log('正在获取格式化模板组件...');
            
            // 递归查找所有组件，包括嵌套组件
            const getAllComponents = (components: any[]): any[] => {
                let allComps: any[] = [];
                components.forEach(comp => {
                    allComps.push(comp);
                    const children = comp.get('components');
                    if (children && children.length) {
                        allComps = allComps.concat(getAllComponents(children.models));
                    }
                });
                return allComps;
            };
            
            const allComponents = getAllComponents(this.editor.Components.getComponents().models);
            const formatTempComponents = allComponents.filter(comp => comp.get('type') === 'format-temp-list');
            console.log('找到格式化模板组件数量:', formatTempComponents.length);
            
            if (formatTempComponents.length > 0) {
                // 从字段中提取字段名
                const fieldNames = this.config.fields.map(field => field.name);

                fieldNames.push('goods1')
                fieldNames.push('goods2')
                fieldNames.push('name')
                fieldNames.push('name1')
                fieldNames.push('date1')
                fieldNames.push('date2')
                
                // 更新每个格式化模板列表组件的mentionItems
                formatTempComponents.forEach((component: any) => {
                    try {
                        const traits = component.get('traits');
                        if (!traits || typeof traits.where !== 'function') {
                            console.log('组件traits不存在或不是预期类型');
                            return;
                        }
                        
                        const templateTrait = traits.where({ name: 'template' })[0];
                        
                        if (templateTrait) {
                            templateTrait.set('attributes', { 
                                ...templateTrait.get('attributes'),
                                mentionItems: fieldNames 
                            });
                            console.log('已更新格式化模板组件mentionItems:', fieldNames);
                        } else {
                            console.log('未找到模板trait');
                        }
                    } catch (compError) {
                        console.error('处理组件时出错:', compError);
                    }
                });
            } else {
                console.log('未找到任何格式化模板列表组件');
            }
        } catch (error) {
            console.error('更新格式化模板列表组件mentionItems失败:', error);
        }
    }

    load(): void {
        this._loadCommands();
    }

    /**
     * 更新表单组件的formData和columns数据
     * @param config 可选，自定义配置，默认使用this.config
     */
    private updateFormDataAndColumns(config = this.config) {
        // 更新表单组件的formData和columns
        const wrapper = this.editor.Components.getWrapper();
        const formComponent = wrapper?.find('form')[0];
        if (formComponent) {
            // 获取表单DOM元素
            const formEl = formComponent.getEl();
            // 通过类型断言访问gForm属性
            const gForm = formEl && (formEl as any).gForm;
            
            if (gForm) {
                // 将表单字段转换为formData格式
                const formData: Record<string, any> = {};
                
                // 构建columns数据，表示字段名和标签的关系
                const columns: Array<{label: string, value: string, required: boolean}> = [];
                
                config.goodsOptions?.level1.forEach(item => {
                    columns.push({
                        label: item.label,
                        value: item.value as string,
                        required: false
                    });
                })
                Object.values(config.goodsOptions?.level2 || {}).forEach(item => {
                    item.forEach(item => {
                        columns.push({
                            label: item.label,
                            value: item.value as string,
                            required: false
                        });
                    })
                })
                
                config.fields.forEach(field => {
                    // 更新formData
                    formData[field.name] = field.defaultValue || '';
                    
                    // 更新columns
                    columns.push({
                        label: field.label,
                        value: field.name,
                        required: true
                    });
                });
                
                // 调用form组件的方法更新数据
                gForm.setData(formData);
                gForm.columns = columns;
                
                console.log('表单数据已更新:', { formData, columns });
            }
        }
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
                        editor={this.editor}
                        open={true}
                        onOpenChange={() => {
                            this.editor.Commands.stop('configurable-form');
                        }}
                        onSave={(newConfig) => {
                            this.config = newConfig;
                            this.options.updateFormConfig!(newConfig as any)
                            this.updateFormComponent();
                            this.updateFormDataAndColumns(newConfig);
                            // 保存时更新格式化模板列表组件的mentionItems
                            this.updateFormatTempListMentionItems();
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