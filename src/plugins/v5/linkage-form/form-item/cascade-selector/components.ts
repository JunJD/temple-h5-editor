import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../../../common/base";
import { CASCADE_SELECTOR_TYPES, CascadeSelectorOptions, DEFAULT_OPTION_IMAGE, DEFAULT_OPTIONS } from "./constants";
import { CascadeSelectorTraitsFactory } from "./traits-factory";
// import { GRID_BLOCKS } from "../../../layout/constants";

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

                        // 等待DOM准备完成后再初始化
                        function initializeSelector() {
                            // 初始化时设置默认显示的二级选项组
                            const level2Group = el.querySelector('.level-2-group');
                            if (level2Group) {
                                level2Group.dispatchEvent(new CustomEvent('update-visible-options', {
                                    detail: { parentId: 'l1_1' }
                                }));

                                // 模拟点击第一个一级选项
                                const firstLevel1Option = el.querySelector('.level-1-group [data-id="l1_1"]');
                                if (firstLevel1Option) {
                                    firstLevel1Option.click();
                                }
                            }
                        }

                        // 使用 requestAnimationFrame 确保DOM已经渲染完成
                        requestAnimationFrame(() => {
                            initializeSelector();
                        });

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

                            const formItem = el.closest('.form-item');
                            if (formItem) {
                                if (level === '2') {

                                    const event = new CustomEvent('field:change', {
                                        detail: { value: Number(state.value.level2) || 0 }
                                    });
                                    formItem.dispatchEvent(event);
                                }
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
                            'selected-color': '#a67c37',
                            'display-mode': 'image',
                            components: [{
                                type: 'bs-row',
                                attributes: { class: 'level-1-group', 'display-mode': 'image' },
                                components: DEFAULT_OPTIONS.level1.map(it => ({
                                    type: 'bs-col',
                                    'col-base': `col-${Math.floor(12 / DEFAULT_OPTIONS.level1.length)}`,
                                    style: {
                                        padding: 0,
                                        'border-color': 'transparent'
                                    },
                                    components: [
                                        {
                                            type: CASCADE_SELECTOR_TYPES['option'],
                                            attributes: { 'data-id': it.id, 'data-level': 1 },
                                            label: it.label,
                                            value: it.value,
                                            image: it.image,
                                            defaultImage: it.image
                                        }
                                    ]
                                }))
                            }]
                        },
                        {
                            type: CASCADE_SELECTOR_TYPES['options-group'],
                            classes: ['level-2-group'],
                            attributes: {
                                'data-level': '2',
                                'display-mode': 'button'
                            },
                            'selected-color': '#a67c37',
                            'display-mode': 'button',
                            components: Object.entries(DEFAULT_OPTIONS.level2).map(([parentId, level2Options]) => ({
                                type: 'bs-row',
                                attributes: { class: 'level-2-row', 'data-parent-id': parentId },
                                components: level2Options.map(it => ({
                                    type: 'bs-col',
                                    'col-base': `col-${Math.floor(12 / level2Options.length)}`,
                                    style: {
                                        padding: 0,
                                        'border-color': 'transparent'
                                    },
                                    components: [
                                        {
                                            type: CASCADE_SELECTOR_TYPES['option'],
                                            attributes: { 'data-id': it.id, 'data-level': 2, 'data-parent-id': parentId },
                                            label: it.label,
                                            value: it.value,
                                            defaultImage: it.image
                                        }
                                    ]
                                }))
                            }))
                        }
                    ],
                    style: {
                        padding: '23px 5%',
                        border: '1px solid #ccc',
                        'border-top': 'none',
                        'background-color': '#fff',
                        'border-radius': '0 0 10px 10px',
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

                    // 更新一级选项组
                    const level1Group = this.find('.level-1-group')[0];
                    if (level1Group) {
                        const level1Row = level1Group.find('.row')[0];
                        if (level1Row) {
                            const newColSum = options.level1.length
                            const colBase = `col-${Math.floor(12 / newColSum)}`
                            // 清空现有选项
                            level1Row.empty();

                            // 添加新选项
                            options.level1.forEach(option => {
                                level1Row.append({
                                    'col-base': colBase,
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
                            const newColSum = level2Options.length
                            const colBase = `col-${Math.floor(12 / newColSum)}`
                            level2Group.append({
                                type: 'bs-row',
                                attributes: {
                                    class: 'level-2-row',
                                    'data-parent-id': parentId,
                                    style: parentId === 'l1_1' ? 'display: flex' : 'display: none'
                                },
                                components: level2Options.map(option => ({
                                    type: 'bs-col',
                                    'col-base': colBase,
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
                    traits: [
                        {
                            type: 'color',
                            name: 'selected-color',
                            label: '选中颜色',
                            default: '#a67c37',
                            changeProp: true
                        }
                    ],
                    'script-props': ['selected-color'],
                    script: function (props) {
                        const el = this;
                        const level = el.getAttribute('data-level');
                        const selectedColor = props['selected-color'] || '#a67c37';
                        const groupId = Math.random().toString(36).substr(2, 9);

                        el.setAttribute('data-group-id', groupId);

                        const state = {
                            selectedId: null,
                            visibleParentId: level === '2' ? 'l1_1' : null
                        };

                        // 设置 CSS 变量
                        el.style.setProperty('--selected-color', selectedColor);

                        // 处理选项点击事件
                        el.addEventListener('option-click', (event) => {
                            const detail = event.detail;
                            // 检查是否是发给当前 group 的事件
                            if (detail.groupId !== groupId) {
                                return;
                            }

                            state.selectedId = detail.id;

                            // 移除所有选项的选中状态
                            const options = el.querySelectorAll('[data-id]');
                            options.forEach((opt) => {
                                opt.classList.remove('selected');
                                // 移除选中样式
                                opt.style.borderColor = 'transparent';
                            });

                            // 为当前选中项添加选中状态
                            const selectedOption = el.querySelector(`[data-id="${detail.id}"]`);
                            if (selectedOption) {
                                selectedOption.classList.add('selected');
                                // 添加选中样式
                                selectedOption.style.borderColor = 'var(--selected-color)';
                            }

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

                        // 处理选中状态更新 样式
                        el.addEventListener('update-selection', (event) => {
                            state.selectedId = event.detail.selectedId;

                            const options = el.querySelectorAll('[data-id]');

                            options.forEach((opt) => {
                                const isSelected = opt.getAttribute('data-id') === state.selectedId;

                                opt.classList.toggle('selected', isSelected);
                                // 更新选中样式
                                if (level === '1') {
                                    opt.style.borderColor = isSelected ? selectedColor : 'transparent';
                                } else {
                                    if (!opt.querySelector('button')) return
                                    if (isSelected) {
                                        opt.querySelector('button').style.backgroundColor = selectedColor;
                                        opt.querySelector('button').style.color = '#fff'
                                    } else {
                                        opt.querySelector('button').style.backgroundColor = '#fff';
                                        opt.querySelector('button').style.color = '#8c8d8d'
                                    }
                                    opt.style.borderColor = 'transparent';
                                }
                            });
                        });

                        // 处理二级选项组显示状态更新事件
                        if (level === '2') {
                            el.addEventListener('update-visible-options', (event) => {
                                state.visibleParentId = event.detail.parentId;

                                updateVisibleOptions();
                            });
                        }

                        // 更新二级选项组的显示状态
                        function updateVisibleOptions() {
                            if (level !== '2') return;
                            el.querySelectorAll('.row').forEach((row) => {
                                const parentId = row.getAttribute('data-parent-id');
                                const isVisible = parentId === state.visibleParentId;
                                row.style.display = isVisible ? 'flex' : 'none';

                                // 只有当row是显示状态时，才点击第一个option
                                if (isVisible) {
                                    const option = row.querySelector('[data-id]');
                                    if (option) {
                                        option.click();
                                    }
                                }
                            });
                        }

                        // 初始化时设置二级选项组的显示状态
                        if (level === '2') {
                            updateVisibleOptions();
                        }
                    },

                    init() {
                        // 初始化时设置默认值
                        this.set('selected-color', '#a67c37');
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
                            name: 'button-size',
                            label: '按钮大小',
                            options: [
                                { id: 'btn-sm', name: '小', value: 'btn-sm' },
                                { id: 'btn-md', name: '中', value: '' },
                                { id: 'btn-lg', name: '大', value: 'btn-lg' }
                            ],
                            default: 'btn-md',
                            changeProp: true
                        }
                    ],
                    style: {
                        'text-align': 'center',
                        border: `1px solid transparent`,
                        'border-radius': '4px',
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'box-sizing': 'border-box',
                    },
                    defaultImage: DEFAULT_OPTION_IMAGE,
                    'script-props': [
                        'label', 'image', 'object-fit', 'defaultImage',
                        'button-variant', 'button-size', 'value', 'selected'
                    ],
                    script: function (props) {
                        const el = this;
                        const parent = el.closest('.level-1-group, .level-2-group');
                        const mode = parent?.getAttribute('display-mode') || 'image';

                        const selectedColor = getComputedStyle(parent).getPropertyValue('--selected-color').trim() || '#a67c37';

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
                                // 按钮基础样式
                                const buttonStyle = {
                                    padding: '7.67px 15.33px', // 0.2rem 0.4rem
                                    'border-radius': '6px', // 0.15rem
                                    'text-align': 'center',
                                    'font-size': '15px', // 0.39rem
                                    color: '#8c8d8d',
                                    border: `1px solid ${selectedColor}`,
                                    'background': 'transparent',
                                    'transition': 'all 0.3s ease',
                                    cursor: 'pointer'
                                };

                                // 选中状态样式
                                if (el.classList.contains('selected')) {
                                    buttonStyle.background = selectedColor;
                                    buttonStyle.color = '#fff';
                                }

                                el.innerHTML = `<button type="button" style="${Object.entries(buttonStyle).map(([k, v]) => `${k}:${v}`).join(';')}">${props.label}</button>`;
                            }
                        }

                        // 初始渲染
                        renderOption();

                        el.onclick = () => {
                            const groupId = parent?.getAttribute('data-group-id');

                            el.dispatchEvent(new CustomEvent('option-click', {
                                detail: {
                                    id: el.getAttribute('data-id'),
                                    label: props.label,
                                    image: props.image,
                                    value: props.value || props.label,
                                    level: el.dataset.level,
                                    groupId
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