import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../../../common/base";
import { CASCADE_SELECTOR_TYPES, CascadeSelectorOptions, DEFAULT_OPTION_IMAGE, DEFAULT_OPTIONS } from "./constants";
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
                    traits: CascadeSelectorTraitsFactory.getTraits(),
                    'script-props': ['options', 'value'],
                    options: DEFAULT_OPTIONS,
                    script: function (props) {
                        const el = this;
                        const state = {
                            selectedLevel1: null,
                            selectedLevel2: null,
                            value: props.value || {
                                level1: null,
                                level2: null
                            }
                        };

                        // 处理选项组选择事件
                        el.addEventListener('group-option-selected', (event) => {
                            const { level, selectedOption } = event.detail;                            
                            // 更新状态
                            if (level === '1') {
                                state.selectedLevel1 = selectedOption.id;
                                state.selectedLevel2 = null;
                                state.value.level1 = selectedOption.value;
                                state.value.level2 = null;

                                // 通知一级选项组更新选中状态
                                const level1Group = el.querySelector('.level-1-group');
                                level1Group?.dispatchEvent(new CustomEvent('update-selection', {
                                    detail: { selectedId: selectedOption.id }
                                }));

                                // 通知二级选项组更新显示状态
                                const level2Group = el.querySelector('.level-2-group');
                                level2Group?.dispatchEvent(new CustomEvent('update-visible-options', {
                                    detail: { parentId: selectedOption.id }
                                }));
                            } else if (level === '2') {
                                state.selectedLevel2 = selectedOption.id;
                                state.value.level2 = selectedOption.value;

                                // 通知二级选项组更新选中状态
                                const level2Group = el.querySelector('.level-2-group');
                                level2Group?.dispatchEvent(new CustomEvent('update-selection', {
                                    detail: { selectedId: selectedOption.id }
                                }));
                            }

                            // 触发选择变化事件
                            el.dispatchEvent(new CustomEvent('cascade-selection-change', {
                                detail: {
                                    value: state.value,
                                    currentLevel: level,
                                    currentSelection: selectedOption
                                }
                            }));
                        });

                        // 初始化时设置默认显示的二级选项组
                        const level2Group = el.querySelector('.level-2-group');
                        level2Group?.dispatchEvent(new CustomEvent('update-visible-options', {
                            detail: { parentId: 'l1_1' }
                        }));
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
                },

                init() {
                    if (!this.get('options')) {
                        this.set('options', DEFAULT_OPTIONS);
                    }
                    this.on('change:options', this.handleOptionsChange);
                },

                handleOptionsChange() {
                    console.log('options changed:', this.get('options'));
                    this.updateComponents();
                    this.trigger('rerender');

                    const selected = this.em?.get('selected');
                    if (selected === this) {
                        this.em?.trigger('component:deselected');
                        this.em?.trigger('component:selected');
                    }
                },

                updateComponents() {
                    const options = this.get('options') as CascadeSelectorOptions;
                    console.log('Updating components with options:', options);
                    
                    // 更新一级选项组
                    const level1Group = this.find('.level-1-group')[0];
                    if (level1Group) {
                        const level1Row = level1Group.find('.row')[0];
                        if (level1Row) {
                            // 清空现有选项
                            level1Row.empty();
                            
                            // 添加新选项
                            options.level1.forEach(option => {
                                level1Row.append({
                                    type: 'bs-col',
                                    style: {
                                        padding: 0,
                                        'border-color': 'transparent'
                                    },
                                    components: [{
                                        type: CASCADE_SELECTOR_TYPES['option'],
                                        attributes: {
                                            'data-id': option.id,
                                            'data-level': 1
                                        },
                                        label: option.label,
                                        value: option.value,
                                        image: option.image,
                                        defaultImage: DEFAULT_OPTION_IMAGE
                                    }]
                                });
                            });
                        }
                    }

                    // 更新二级选项组
                    const level2Group = this.find('.level-2-group')[0];
                    if (level2Group) {
                        // 清空现有行
                        level2Group.empty();
                        
                        // 为每个一级选项创建对应的二级选项行
                        Object.entries(options.level2).forEach(([parentId, level2Options]) => {
                            level2Group.append({
                                type: 'bs-row',
                                attributes: {
                                    class: 'level-2-row',
                                    'data-parent-id': parentId,
                                    style: parentId === 'l1_1' ? 'display: flex' : 'display: none'
                                },
                                components: level2Options.map(option => ({
                                    type: 'bs-col',
                                    style: {
                                        padding: 0,
                                        'border-color': 'transparent'
                                    },
                                    components: [{
                                        type: CASCADE_SELECTOR_TYPES['option'],
                                        attributes: {
                                            'data-id': option.id,
                                            'data-level': 2
                                        },
                                        label: option.label,
                                        value: option.value,
                                        defaultImage: DEFAULT_OPTION_IMAGE
                                    }]
                                }))
                            });
                        });
                    }

                    // 更新完成后，触发一次选中状态更新
                    if (level1Group && this.get('selectedLevel1')) {
                        level1Group.trigger('update-selection', { selectedId: this.get('selectedLevel1') });
                    }

                    if (level2Group && this.get('selectedLevel2')) {
                        level2Group.trigger('update-selection', { selectedId: this.get('selectedLevel2') });
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
                    traits: [],
                    script: function (props) {
                        const el = this;
                        const level = el.getAttribute('data-level');
                        const state = {
                            selectedId: null,
                            visibleParentId: level === '2' ? 'l1_1' : null
                        };

                        // 处理选项点击事件
                        el.addEventListener('option-click', (event) => {
                            const detail = event.detail;
                            state.selectedId = detail.id;
                            
                            // 更新选项的选中状态
                            updateOptionsSelection();

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

                        // 处理选中状态更新事件
                        el.addEventListener('update-selection', (event) => {
                            state.selectedId = event.detail.selectedId;
                            updateOptionsSelection();
                        });

                        // 处理二级选项组显示状态更新事件
                        if (level === '2') {
                            el.addEventListener('update-visible-options', (event) => {
                                state.visibleParentId = event.detail.parentId;
                                updateVisibleOptions();
                            });
                        }

                        // 更新选项的选中状态
                        function updateOptionsSelection() {
                            el.querySelectorAll('.option').forEach((opt) => {
                                const isSelected = opt.getAttribute('data-id') === state.selectedId;
                                opt.classList.toggle('selected', isSelected);
                                opt.classList.toggle('style-selected', isSelected);
                            });
                        }

                        // 更新二级选项组的显示状态
                        function updateVisibleOptions() {
                            if (level !== '2') return;
                            
                            el.querySelectorAll('.row').forEach((row) => {
                                const parentId = row.getAttribute('data-parent-id');
                                row.style.display = parentId === state.visibleParentId ? 'flex' : 'none';
                            });
                        }

                        // 初始化时设置二级选项组的显示状态
                        if (level === '2') {
                            updateVisibleOptions();
                        }
                    }
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

                        function renderOption() {
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
                        }

                        // 初始渲染
                        renderOption();

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
                    },

                    init() {
                        this.on('change:parent-display-mode', this.handleParentDisplayModeChange);
                    },

                    handleParentDisplayModeChange(mode) {
                        console.log('handleParentDisplayModeChange', mode);
                        // 触发重新渲染
                        this.view.rerender();
                    }
                }
            }
        });
    }
} 