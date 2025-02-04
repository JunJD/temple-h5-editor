import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../../../common/base";
import { CASCADE_SELECTOR_TYPES, DEFAULT_OPTION_IMAGE, DEFAULT_OPTIONS } from "./constants";
import { CascadeSelectorTraitsFactory } from "./traits-factory";
import { GRID_BLOCKS } from "../../../layout/constants";

export class CascadeSelectorComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        this.loadCascadeSelector();
        this.loadOptionsGroup();
        this.loadOption();
    }

    private loadCascadeSelector() {
        this.editor.Components.addType(CASCADE_SELECTOR_TYPES['cascade-selector'], {
            model: {
                defaults: {
                    name: 'Cascade Selector',
                    droppable: false,
                    traits: [
                        CascadeSelectorTraitsFactory.getCascadeLabelTrait()
                    ],
                    script: function (props) {
                        const el = this;
                        const selectedData = {
                            level1: null,
                            level2: null,
                            value: {
                                level1: null,
                                level2: null
                            }
                        };

                        // 处理选项组选择事件
                        el.addEventListener('group-option-selected', (event) => {
                            const { level, selectedOption } = event.detail;

                            // 更新选中数据
                            if (level === '1') {
                                selectedData.level1 = selectedOption;
                                selectedData.level2 = null; // 清空二级选中
                                selectedData.value.level1 = selectedOption.value;
                                selectedData.value.level2 = null;

                                // 获取所有二级选项组
                                const level2Groups = el.querySelectorAll('.level-2-group > .row');

                                // 隐藏所有二级选项组
                                level2Groups.forEach(group => {
                                    group.style.display = 'none';
                                });

                                // 显示对应的二级选项组
                                const targetGroup = el.querySelector(`.level-2-group > .row[data-parent-id="${selectedOption.id}"]`);
                                if (targetGroup) {
                                    targetGroup.style.display = 'flex';
                                }

                                // 清空二级选项的选中状态
                                el.querySelectorAll('.level-2-group .option').forEach((opt) => {
                                    opt.classList.remove('selected');
                                });
                            } else if (level === '2') {
                                selectedData.level2 = selectedOption;
                                selectedData.value.level2 = selectedOption.value;
                            }

                            console.log({
                                selectedData,
                                currentLevel: level,
                                currentSelection: selectedOption,
                                value: selectedData.value
                            })

                            // 触发选择变化事件
                            el.dispatchEvent(new CustomEvent('cascade-selection-change', {
                                detail: {
                                    selectedData,
                                    currentLevel: level,
                                    currentSelection: selectedOption,
                                    value: selectedData.value
                                }
                            }));
                        });

                        // 初始化时隐藏所有二级选项组(除了第一个)
                        const level2Groups = el.querySelectorAll('.level-2-group > .row');
                        level2Groups.forEach((group, index) => {
                            if (index !== 0) {
                                group.style.display = 'none';
                            }
                        });
                    },
                    components: [
                        {
                            type: CASCADE_SELECTOR_TYPES['options-group'],
                            classes: ['level-1-group'],
                            attributes: {
                                'data-level': '1',
                                'display-mode': 'image'
                            },
                            'display-mode': 'image',
                            components: [{
                                type: 'bs-row',
                                attributes: { class: 'level-1-group', 'display-mode': 'image' },
                                components: [
                                    {
                                        type: 'bs-col',
                                        style: {
                                            padding: 0,
                                            'border-color': 'transparent'
                                        },
                                        components: [
                                            {
                                                type: CASCADE_SELECTOR_TYPES['option'],
                                                attributes: { 'data-id': 'l1_1', 'data-level': 1 },
                                                label: '花果供佛',
                                                value: '1',
                                                image: DEFAULT_OPTION_IMAGE,
                                                defaultImage: DEFAULT_OPTION_IMAGE
                                            }
                                        ]
                                    },
                                    {
                                        type: 'bs-col',
                                        style: {
                                            padding: 0,
                                            'border-color': 'transparent'
                                        },
                                        components: [
                                            {
                                                type: CASCADE_SELECTOR_TYPES['option'],
                                                attributes: { 'data-id': 'l1_2', 'data-level': 1 },
                                                label: '敬香供灯',
                                                image: DEFAULT_OPTION_IMAGE,
                                                defaultImage: DEFAULT_OPTION_IMAGE
                                            }
                                        ]
                                    },
                                    {
                                        type: 'bs-col',
                                        style: {
                                            padding: 0,
                                            'border-color': 'transparent'
                                        },
                                        components: [
                                            {
                                                type: CASCADE_SELECTOR_TYPES['option'],
                                                attributes: { 'data-id': 'l1_3', 'data-level': 1 },
                                                label: '供斋纳福',
                                                image: DEFAULT_OPTION_IMAGE,
                                                defaultImage: DEFAULT_OPTION_IMAGE
                                            }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            type: CASCADE_SELECTOR_TYPES['options-group'],
                            classes: ['level-2-group'],
                            attributes: {
                                'data-level': '2',
                                'display-mode': 'button'
                            },
                            'display-mode': 'button',
                            components: [
                                {
                                    type: 'bs-row',
                                    attributes: { class: 'level-2-row', 'data-parent-id': 'l1_1' },
                                    components: [
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_1_1', 'data-level': 2 },
                                                    label: '1盆',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_1_2', 'data-level': 2 },
                                                    label: '1殿堂',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_1_3', 'data-level': 2 },
                                                    label: '全寺',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'bs-row',
                                    attributes: { class: 'level-2-row', 'data-parent-id': 'l1_2' },
                                    components: [
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_2_1', 'data-level': 2 },
                                                    label: '1天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_2_2', 'data-level': 2 },
                                                    label: '3天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_2_3', 'data-level': 2 },
                                                    label: '7天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'bs-row',
                                    attributes: { class: 'level-2-row', 'data-parent-id': 'l1_3' },
                                    components: [
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_3_1', 'data-level': 2 },
                                                    label: '1天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_3_2', 'data-level': 2 },
                                                    label: '3天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        },
                                        {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [
                                                {
                                                    type: CASCADE_SELECTOR_TYPES['option'],
                                                    attributes: { 'data-id': 'l2_3_3', 'data-level': 2 },
                                                    label: '7天',
                                                    defaultImage: DEFAULT_OPTION_IMAGE
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
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
            }
        });
    }

    private loadOptionsGroup() {
        this.editor.Components.addType(CASCADE_SELECTOR_TYPES['options-group'], {
            model: {
                defaults: {
                    droppable: true,
                    traits: [
                        {
                            type: 'select',
                            name: 'display-mode',
                            label: '显示模式',
                            options: [
                                { id: 'image', value: 'image', name: '图片' },
                                { id: 'button', value: 'button', name: '按钮' }
                            ],
                            default: 'image',
                            changeProp: true,
                        },
                        {
                            changeProp: true,
                            type: 'button',
                            text: '添加选项',
                            name: 'add-option',
                            label: '添加选项',
                            command: (editor, trait) => {
                                const component = trait.target;
                                if (!component) return;

                                const level = component.getAttributes()['data-level'];

                                // 如果是二级选项组，需要找到当前显示的行
                                if (level === '2') {
                                    const visibleRow = component.find('.row[style*="display: flex"]')[0];
                                    if (visibleRow) {
                                        const timestamp = Date.now();
                                        const optionId = `l2_${timestamp}`;

                                        // 创建新的列
                                        const col = {
                                            type: 'bs-col',
                                            style: {
                                                padding: 0,
                                                'border-color': 'transparent'
                                            },
                                            components: [{
                                                type: CASCADE_SELECTOR_TYPES['option'],
                                                attributes: {
                                                    'data-id': optionId,
                                                    'data-level': level
                                                },
                                                label: '新选项',
                                                defaultImage: DEFAULT_OPTION_IMAGE
                                            }]
                                        };

                                        // 添加新列到当前显示的行
                                        visibleRow.append(col);
                                        return;
                                    }
                                }

                                // 一级选项的处理逻辑
                                let row = component.find('.row')[0];

                                // 如果没有 row，创建一个新的
                                if (!row) {
                                    row = component.append({
                                        type: 'bs-row',
                                        attributes: {
                                            class: 'level-1-row',
                                            'display-mode': component.getAttributes()['display-mode'] || 'image'
                                        }
                                    })[0];
                                }

                                const timestamp = Date.now();
                                const optionId = `l1_${timestamp}`;

                                // 创建新的列
                                const col = {
                                    type: 'bs-col',
                                    style: {
                                        padding: 0,
                                        'border-color': 'transparent'
                                    },
                                    components: [{
                                        type: CASCADE_SELECTOR_TYPES['option'],
                                        attributes: {
                                            'data-id': optionId,
                                            'data-level': level
                                        },
                                        label: '新选项',
                                        defaultImage: DEFAULT_OPTION_IMAGE
                                    }]
                                };

                                // 如果是一级选项，需要同时创建对应的二级选项组
                                const cascadeSelector = component.closest('[data-gjs-type="cascade-selector"]');
                                if (cascadeSelector) {
                                    const level2Group = cascadeSelector.find('.level-2-group')[0];
                                    if (level2Group) {
                                        // 创建新的二级选项行
                                        const level2Row = {
                                            type: 'bs-row',
                                            attributes: {
                                                class: 'level-2-row',
                                                'data-parent-id': optionId,
                                                style: 'display: none'
                                            },
                                            components: [
                                                {
                                                    type: 'bs-col',
                                                    components: [{
                                                        type: CASCADE_SELECTOR_TYPES['option'],
                                                        attributes: {
                                                            'data-id': `${optionId}_1`,
                                                            'data-level': '2'
                                                        },
                                                        label: '子选项1',
                                                        defaultImage: DEFAULT_OPTION_IMAGE
                                                    }]
                                                }
                                            ]
                                        };

                                        // 添加到二级选项组
                                        level2Group.append(level2Row);
                                    }
                                }

                                // 添加新列到行
                                row.append(col);
                            }
                        }
                    ],
                    'script-props': [
                        'display-mode'
                    ],
                    script: function (props) {
                        const el = this;
                        const displayMode = props['display-mode'] || 'image';
                        const level = el.getAttribute('data-level');

                        // 处理选项点击事件
                        el.addEventListener('option-click', (event) => {
                            const detail = event.detail;
                            // 移除其他选项的选中状态
                            el.querySelectorAll('.option').forEach((opt) => {
                                opt.classList.remove('selected');
                            });

                            // 设置当前选项的选中状态
                            const currentOption = event.target;
                            currentOption.classList.add('selected');

                            // 触发选项组的选择事件
                            el.dispatchEvent(new CustomEvent('group-option-selected', {
                                detail: {
                                    level,
                                    selectedOption: detail,
                                    groupEl: el
                                },
                                bubbles: true
                            }));
                        });

                        // 更新所有选项的显示模式
                        function updateOptionsDisplayMode() {
                            el.querySelectorAll('.option').forEach((opt) => {
                                opt.dispatchEvent(new Event('render'));
                            });
                        }

                        // 初始化时设置显示模式
                        el.setAttribute('display-mode', displayMode);
                        updateOptionsDisplayMode();

                        // 当 props 变化时更新显示模式
                        el.__onPropsChange = function(changedProps) {
                            if (changedProps['display-mode'] !== undefined) {
                                el.setAttribute('display-mode', changedProps['display-mode']);
                                updateOptionsDisplayMode();
                            }
                        };
                    }
                },

                init() {
                    this.on('change:display-mode', this.handleDisplayModeChange);
                },

                handleDisplayModeChange() {
                    const value = this.get('display-mode');
                    this.setAttributes({ 'display-mode': value });
                }
            }
        });
    }

    private loadOption() {
        this.editor.Components.addType(CASCADE_SELECTOR_TYPES['option'], {
            model: {
                defaults: {
                    traits: [
                        ...CascadeSelectorTraitsFactory.getOptionSettingTraits(),
                        ...CascadeSelectorTraitsFactory.getImageSettingTraits(),
                        CascadeSelectorTraitsFactory.getRemoveOptionTrait(),
                        {
                            type: 'select',
                            name: 'button-type',
                            label: '按钮类型',
                            options: [
                                { id: 'default', value: 'default', name: '默认' },
                                { id: 'primary', value: 'primary', name: '主要' },
                                { id: 'dashed', value: 'dashed', name: '虚线' },
                                { id: 'text', value: 'text', name: '文本' },
                                { id: 'link', value: 'link', name: '链接' }
                            ],
                            default: 'default'
                        },
                        {
                            type: 'select',
                            name: 'button-size',
                            label: '按钮大小',
                            options: [
                                { id: 'small', value: 'small', name: '小' },
                                { id: 'middle', value: 'middle', name: '中' },
                                { id: 'large', value: 'large', name: '大' }
                            ],
                            default: 'middle'
                        }
                    ],
                    'script-props': [
                        'label', 'image', 'object-fit', 'defaultImage',
                        'button-type', 'button-size', 'value'
                    ],
                    style: {
                        'text-align': 'center',
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'border': '2px solid transparent',
                        'transition': 'all 0.3s'
                    },
                    'style-selected': {
                        'border-color': '#a67c37'
                    },
                    defaultImage: DEFAULT_OPTION_IMAGE,
                    script: function (props) {
                        const el = this;
                        const parent = el.closest('.level-1-group, .level-2-group');
                        const mode = parent?.getAttribute('display-mode') || 'image';
                        
                        if (mode === 'image') {
                            const imageOptionStyle = {
                                display: 'flex',
                                'flex-direction': 'column',
                                'align-items': 'center',
                                gap: '8px',
                                width: '100%'
                            };

                            const imgStyle = {
                                width: '100%',
                                height: '100%',
                                'object-fit': props['object-fit'] || 'cover'
                            };

                            const spanStyle = {
                                'font-size': '14px'
                            };

                            el.innerHTML = `
                                <div style="${Object.entries(imageOptionStyle).map(([k, v]) => `${k}:${v}`).join(';')}">
                                    <img src="${props.image || props.defaultImage}" 
                                         alt="${props.label}"
                                         style="${Object.entries(imgStyle).map(([k, v]) => `${k}:${v}`).join(';')}"
                                         onerror="this.src='${props.defaultImage}'" />
                                    <span style="${Object.entries(spanStyle).map(([k, v]) => `${k}:${v}`).join(';')}">${props.label}</span>
                                </div>
                            `;
                        } else {
                            const buttonType = props['button-type'] || 'default';
                            const buttonSize = props['button-size'] || 'middle';

                            const buttonStyle = {
                                width: '100%',
                                padding: buttonSize === 'small' ? '4px 8px' : buttonSize === 'large' ? '12px 24px' : '8px 16px',
                                border: buttonType === 'dashed' ? '1px dashed #d9d9d9' : buttonType === 'text' || buttonType === 'link' ? 'none' : '1px solid #d9d9d9',
                                'border-radius': '4px',
                                background: buttonType === 'primary' ? '#1890ff' : 'white',
                                color: buttonType === 'primary' ? 'white' : buttonType === 'link' ? '#1890ff' : '#000000d9',
                                'font-size': buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '16px' : '14px',
                                cursor: 'pointer',
                                'text-decoration': buttonType === 'link' ? 'underline' : 'none'
                            };

                            el.innerHTML = `<button style="${Object.entries(buttonStyle).map(([k, v]) => `${k}:${v}`).join(';')}">${props.label}</button>`;
                        }

                        // 设置选中状态的样式
                        if (el.classList.contains('selected')) {
                            el.classList.add('style-selected');
                            if (mode === 'button') {
                                const button = el.querySelector('button');
                                if (button) {
                                    const buttonType = props['button-type'] || 'default';
                                    if (buttonType !== 'primary') {
                                        button.style.color = '#a67c37';
                                    } else {
                                        button.style.background = '#a67c37';
                                        button.style.borderColor = '#a67c37';
                                    }
                                }
                            }
                        } else {
                            el.classList.remove('style-selected');
                        }

                        // 监听父元素的 display-mode 变化
                        if (parent) {
                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    if (mutation.type === 'attributes' && mutation.attributeName === 'display-mode') {
                                        // 重新渲染
                                        el.dispatchEvent(new Event('render'));
                                    }
                                });
                            });

                            observer.observe(parent, {
                                attributes: true,
                                attributeFilter: ['display-mode']
                            });
                        }

                        el.onclick = () => {
                            el.dispatchEvent(new CustomEvent('option-click', {
                                detail: {
                                    id: el.dataset.id,
                                    label: props.label,
                                    image: props.image,
                                    value: props.value || props.label,
                                    level: el.dataset.level
                                },
                                bubbles: true
                            }));
                        };
                    }
                }
            }
        });
    }
} 