import { BaseTraitsFactory } from "../../../common/traits-factory";
import type { TraitProperties } from "grapesjs";

export class CascadeSelectorTraitsFactory extends BaseTraitsFactory {
    constructor() {
        super();
    }

    // 级联组件的标签设置
    static getCascadeLabelTrait() {
        return {
            type: 'text',
            label: '组件标签',
            name: 'cascade-label',
            default: '级联选择器',
            changeProp: true
        };
    }

    // 选项组显示模式设置
    static getDisplayModeTrait() {
        return {
            type: 'select',
            name: 'display-mode',
            label: '显示模式',
            options: [
                { id: 'image', value: 'image', name: '图片模式' },
                { id: 'button', value: 'button', name: '按钮模式' }
            ],
            default: 'image',
            changeProp: true
        };
    }

    // 选项组行列数设置
    static getRowColsTrait(): Partial<TraitProperties> {
        return {
            type: 'select',
            name: 'row-cols',
            label: '每行列数',
            options: [
                { id: 'row-cols-2', value: 'row-cols-2', name: '2列' },
                { id: 'row-cols-3', value: 'row-cols-3', name: '3列' },
                { id: 'row-cols-4', value: 'row-cols-4', name: '4列' },
                { id: 'row-cols-5', value: 'row-cols-5', name: '5列' },
                { id: 'row-cols-6', value: 'row-cols-6', name: '6列' },
                { id: 'row-cols-auto', value: 'row-cols-auto', name: '自动' }
            ],
            default: 'row-cols-3',
            changeProp: true
        };
    }

    // 选项组间距设置
    static getSpacingTrait(): Partial<TraitProperties> {
        return {
            type: 'select',
            name: 'gap',
            label: '选项间距',
            options: [
                { id: 'g-1', value: 'g-1', name: '小' },
                { id: 'g-2', value: 'g-2', name: '中' },
                { id: 'g-3', value: 'g-3', name: '大' },
                { id: 'g-4', value: 'g-4', name: '特大' }
            ],
            default: 'g-2',
            changeProp: true
        };
    }

    // 添加选项按钮
    static getAddOptionTrait() {
        return {
            type: 'button',
            label: '添加选项',
            name: 'add-option',
            text: '添加',
            command: (editor, trait) => {
                const component = trait.target;
                if (component) {
                    component.addNewOption();
                }
            }
        };
    }

    // 删除选项按钮
    static getRemoveOptionTrait() {
        return {
            type: 'button',
            label: '删除选项',
            name: 'remove-option',
            text: '删除',
            command: (editor, trait) => {
                const component = trait.target;
                if (component) {
                    component.remove();
                }
            }
        };
    }

    // 选项基本设置
    static getOptionSettingTraits() {
        return [
            {
                type: 'text',
                label: '选项标签',
                name: 'label',
                default: '新选项',
                changeProp: true
            }
        ];
    }

    // 图片模式特有设置
    static getImageSettingTraits() {
        return [
            {
                type: 'text',
                label: '图片地址',
                name: 'image',
                changeProp: true
            },
            {
                type: 'select',
                label: '图片填充模式',
                name: 'object-fit',
                options: [
                    { id: 'cover', value: 'cover', name: '覆盖' },
                    { id: 'contain', value: 'contain', name: '包含' },
                    { id: 'fill', value: 'fill', name: '填充' }
                ],
                default: 'cover',
                changeProp: true
            }
        ];
    }

    // 按钮样式设置相关的 traits
    static getButtonStyleTraits() {
        return [
            {
                type: 'number',
                name: 'button-padding-x',
                label: '按钮水平内边距',
                default: 16,
                changeProp: true
            },
            {
                type: 'number',
                name: 'button-padding-y',
                label: '按钮垂直内边距',
                default: 8,
                changeProp: true
            },
            {
                type: 'color',
                name: 'button-bg-color',
                label: '按钮背景色',
                default: '#ffffff',
                changeProp: true
            },
            {
                type: 'color',
                name: 'button-text-color',
                label: '按钮文字颜色',
                default: '#666666',
                changeProp: true
            },
            {
                type: 'color',
                name: 'button-border-color',
                label: '按钮边框颜色',
                default: '#d9d9d9',
                changeProp: true
            },
            {
                type: 'number',
                name: 'button-border-radius',
                label: '按钮圆角',
                default: 4,
                changeProp: true
            }
        ];
    }
} 