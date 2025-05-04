import { Editor } from 'grapesjs';
import { FormConfigDialog } from '@/components/builder/form-config-dialog';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import BasePluginV5 from '../common/base';
import { LINKAGE_FORM_TYPES } from '../linkage-form/constants';
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
            },
            {
                name: 'name',
                label: '姓名',
                type: 'input-group-text',
                required: true,
                expression: '',
                suffix: '',
                placeholder: ''
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

                const traits = component.get('traits');
                if (!traits || typeof traits.where !== 'function') {
                    return;
                }
                
                const templateTrait = traits.where({ name: 'template' })[0];
                
                if (templateTrait) {
                    templateTrait.set('attributes', { 
                        ...templateTrait.get('attributes'),
                        mentionItems: fieldNames 
                    });
                }
            });
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
                // If the form doesn't exist, create a new one
                wrapper?.append([{
                    type: 'form',
                    components: this.generateFormComponents()
                }]);
                return;
            }

            // Get all current form items
            const allItems = existingForm.components();
            if (allItems.length < 2) {
                console.error('Form structure is invalid. Requires at least header and footer form-items.');
                // Optionally attempt to rebuild if structure is broken
                existingForm.components().reset(this.generateFormComponents());
                return;
            }

            // Identify header, footer, and middle items
            const headerComponent = allItems.models[0];
            const footerComponent = allItems.models[allItems.length - 1];
            const currentMiddleItems = allItems.slice(1, -1); // Get GrapesJS Collection view

            // --- Update Header (Cascade Selector Options) ---
            if (headerComponent) {
                const cascadeSelector = headerComponent.findType(CASCADE_SELECTOR_TYPES['cascade-selector'])[0];
                if (cascadeSelector && this.config.goodsOptions) {
                    // Only update if options actually changed to potentially avoid unnecessary rerenders
                    const currentOptions = cascadeSelector.get('options');
                    // Simple deep comparison (could be improved for performance if needed)
                    if (JSON.stringify(currentOptions) !== JSON.stringify(this.config.goodsOptions)) {
                        cascadeSelector.set('options', this.config.goodsOptions);
                        // The change:options event should ideally handle internal updates
                        cascadeSelector.trigger('change:options', cascadeSelector, this.config.goodsOptions);
                    }
                }
            }

            // --- Process Middle Fields (The configurable ones) ---
            const existingFieldsMap = new Map<string, any>(); // Map field name to component instance
            currentMiddleItems.forEach(item => {
                const fieldName = item.getAttributes()['data-field-name'];
                if (fieldName) {
                    existingFieldsMap.set(fieldName, item);
                } else {
                     // If an item lacks the identifier, we might want to remove it or log a warning
                     console.warn('Found form-item without data-field-name attribute, it might be removed or ignored.', item);
                }
            });

            const newFieldsConfig = this.config.fields;
            const finalMiddleComponents: any[] = []; // Will hold updated/new component instances or definitions
            const processedFieldNames = new Set<string>();

            // Iterate through the new config to determine the final order and update/create items
            newFieldsConfig.forEach(field => {
                const fieldName = field.name;
                processedFieldNames.add(fieldName);
                const existingItem = existingFieldsMap.get(fieldName);

                if (existingItem) {
                    // --- Update Existing Item ---
                    // Ensure outer form-item attributes are consistent (though maybe not necessary if only data-field-name is used for matching)
                     existingItem.addAttributes({
                         name: field.name, // Keep form-item's name consistent if it matters elsewhere
                         'data-field-name': field.name // Already used for matching, but ensure it's correct
                     });

                    // Find the *actual* input component inside form-item
                    // This assumes a structure where the primary input is identifiable, e.g., by type.
                    // Adjust filter logic if structure is different (e.g., input is nested deeper)
                    let innerInputComponent = existingItem.components().filter(c => Object.values(LINKAGE_FORM_TYPES).includes(c.get('type')) )[0];
                    
                    const expectedInnerType = LINKAGE_FORM_TYPES[field.type] || 'input-group'; // Determine expected type

                    // Check if the inner component type matches the new config
                    if (innerInputComponent && innerInputComponent.get('type') === expectedInnerType) {
                         // Type matches, update properties/attributes of the existing inner component
                         innerInputComponent.set({ // Use set for GrapesJS model properties
                             label: `${field.label}：`,
                             suffix: field.suffix || '',
                             required: field.required, // Component's own required property
                             placeholder: field.placeholder,
                             defaultValue: field.defaultValue, // May need specific handling in component's 'onRender' or similar
                             expression: field.expression,

                             'input-type': field.type === 'input-group' ? 'number' : 'text' 
                         });

                          innerInputComponent.addAttributes({

                             required: field.required ? true : undefined, // Use undefined to remove attribute
                             placeholder: field.placeholder || ''
                          });

                     } else {

                         console.log(`Replacing inner component for field "${fieldName}" due to type change or missing component.`);
                         const newInnerComponentDefinition = {
                             type: expectedInnerType,
                             label: `${field.label}：`,
                             suffix: field.suffix || '',
                             required: field.required,
                             placeholder: field.placeholder,
                             defaultValue: field.defaultValue,
                             expression: field.expression,
                             // Add attributes directly here too if needed by the component on creation
                             'input-type': field.type === 'input-group' ? 'number' : 'text',
                             attributes: {
                                required: field.required ? true : undefined,
                                placeholder: field.placeholder || ''
                             }
                         };
                          // Replace all components inside the form-item with the new definition
                          // This is simpler but might remove decorative elements if they exist.
                          // A more sophisticated approach could try to preserve other elements.
                          existingItem.components().reset([newInnerComponentDefinition]);
                     }
                     finalMiddleComponents.push(existingItem); // Add the updated component instance to the final list
                     existingFieldsMap.delete(fieldName); // Mark as processed

                } else {
                    // --- Create New Item ---
                    console.log(`Creating new form item for field "${fieldName}"`);
                    const newItemDefinition = { // Create definition for GrapesJS append/reset
                        type: 'form-item',
                        attributes: {
                            name: field.name,
                            label: '', // Usually label is on the inner component
                            'data-field-name': field.name
                        },
                        components: [{
                            type: LINKAGE_FORM_TYPES[field.type] || 'input-group',
                            label: `${field.label}：`,
                            suffix: field.suffix || '',
                            // Set the 'input-type' property based on field.type
                            'input-type': field.type === 'input-group' ? 'number' : 'text', 
                            required: field.required,
                            placeholder: field.placeholder,
                            defaultValue: field.defaultValue,
                            expression: field.expression,
                            // Attributes are for HTML, keep minimal or based on other logic
                            attributes: {
                                required: field.required ? true : undefined,
                                placeholder: field.placeholder || ''
                            }
                        }]
                    };
                    finalMiddleComponents.push(newItemDefinition); // Add definition to the final list
                }
            });

            // --- Identify Items to Remove ---
            // Items remaining in existingFieldsMap were not in the new config.
            // GrapesJS's reset below will handle the removal implicitly
            // because we don't include them in `finalComponents`.
            existingFieldsMap.forEach((itemToRemove, name) => {
                 console.log(`Field "${name}" removed from config, will be removed from form.`);
                 // No need to explicitly call itemToRemove.remove(), reset will handle it.
            });


            // --- Reconstruct Form Components ---
            // Combine header, the processed middle components, and footer IN ORDER
            const finalComponents = [
                headerComponent, // Keep the existing header component instance
                ...finalMiddleComponents, // Add the updated instances and new definitions
                footerComponent  // Keep the existing footer component instance
            ];

             // Use reset to replace the form's components with the new structure
             // This efficiently handles additions, removals, and reordering.
             existingForm.components().reset(finalComponents);

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
                        type: 'text',
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
                    label: `${field.label}：`,
                    suffix: field.suffix || '',
                    // Set the 'input-type' property based on field.type
                    'input-type': field.type === 'input-group' ? 'number' : 'text', 
                    required: field.required,
                    placeholder: field.placeholder,
                    defaultValue: field.defaultValue,
                    expression: field.expression,
                    // Attributes are for HTML, keep minimal or based on other logic
                    attributes: {
                        required: field.required ? true : undefined,
                        placeholder: field.placeholder || ''
                    }
                }]
            })),
            // 尾部 - 提交按钮
            {
                type: 'form-item',
                attributes: { name: 'submit', label: '' },
                style: {
                    'width': '100%',
                    'display': 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                },
                components: [{
                    type: PAY_BUTTON_TYPE,
                    label: '立即支付'
                }]
            }
        ];
    }
}

export {
    ConfigurableFormPlugin
}