import { Editor, PluginOptions } from "grapesjs";
import { GRID_BLOCKS } from "./constants";
import { BaseLoadComponents } from "../common/base";
import { BaseTraitsFactory } from "../common/traits-factory";
import type { TraitProperties } from "grapesjs";

// Traits工厂类
export class GridTraitsFactory extends BaseTraitsFactory {
    constructor() {
        super()
    }

    // 列宽相关traits
    static getColumnWidthTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '基础列宽',
            'col-base',
            [
                { value: 'col', name: '自动' },
                { value: 'col-1', name: '1/12' },
                { value: 'col-2', name: '2/12' },
                { value: 'col-3', name: '3/12' },
                { value: 'col-4', name: '4/12' },
                { value: 'col-5', name: '5/12' },
                { value: 'col-6', name: '6/12' },
                { value: 'col-7', name: '7/12' },
                { value: 'col-8', name: '8/12' },
                { value: 'col-9', name: '9/12' },
                { value: 'col-10', name: '10/12' },
                { value: 'col-11', name: '11/12' },
                { value: 'col-12', name: '12/12' },
                { value: 'col-auto', name: '内容宽度' },
            ],
            true
        );
    }

    // 间距相关traits
    static getSpacingTraits(): Partial<TraitProperties>[] {
        return [
            this.createSelectTrait(
                '水平间距',
                'gx',
                [
                    { value: '', name: '默认' },
                    { value: 'gx-0', name: '无间距' },
                    { value: 'gx-1', name: '小' },
                    { value: 'gx-2', name: '中' },
                    { value: 'gx-3', name: '大' },
                    { value: 'gx-4', name: '特大' },
                    { value: 'gx-5', name: '超大' },
                ],
                true
            ),
            this.createSelectTrait(
                '垂直间距',
                'gy',
                [
                    { value: '', name: '默认' },
                    { value: 'gy-0', name: '无间距' },
                    { value: 'gy-1', name: '小' },
                    { value: 'gy-2', name: '中' },
                    { value: 'gy-3', name: '大' },
                    { value: 'gy-4', name: '特大' },
                    { value: 'gy-5', name: '超大' },
                ],
                true
            )
        ];
    }

    // 行列数相关traits
    static getRowColsTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '列数',
            'row-cols',
            [
                { value: '', name: '自动' },
                { value: 'row-cols-1', name: '1列' },
                { value: 'row-cols-2', name: '2列' },
                { value: 'row-cols-3', name: '3列' },
                { value: 'row-cols-4', name: '4列' },
                { value: 'row-cols-5', name: '5列' },
                { value: 'row-cols-6', name: '6列' },
                { value: 'row-cols-auto', name: '自动宽度' },
            ],
            true
        );
    }

    // 对齐相关traits
    static getAlignmentTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '垂直对齐',
            'align-self',
            [
                { value: '', name: '默认' },
                { value: 'align-self-start', name: '顶部对齐' },
                { value: 'align-self-center', name: '居中对齐' },
                { value: 'align-self-end', name: '底部对齐' },
            ],
            true
        );
    }

    // 偏移相关traits
    static getOffsetTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '列偏移',
            'offset',
            [
                { value: '', name: '无偏移' },
                { value: 'offset-1', name: '偏移1格' },
                { value: 'offset-2', name: '偏移2格' },
                { value: 'offset-3', name: '偏移3格' },
                { value: 'offset-4', name: '偏移4格' },
                { value: 'offset-5', name: '偏移5格' },
                { value: 'offset-6', name: '偏移6格' },
                { value: 'offset-7', name: '偏移7格' },
                { value: 'offset-8', name: '偏移8格' },
                { value: 'offset-9', name: '偏移9格' },
                { value: 'offset-10', name: '偏移10格' },
                { value: 'offset-11', name: '偏移11格' },
            ], 
            true
        );
    }

    // 排序相关traits
    static getOrderTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '排序',
            'order',
            [
                { value: '', name: '默认' },
                { value: 'order-first', name: '最前' },
                { value: 'order-last', name: '最后' },
                { value: 'order-0', name: '0' },
                { value: 'order-1', name: '1' },
                { value: 'order-2', name: '2' },
                { value: 'order-3', name: '3' },
                { value: 'order-4', name: '4' },
                { value: 'order-5', name: '5' },
            ],
            true
        );
    }

    // 外边距相关traits
    static getMarginTraits(): Partial<TraitProperties> {
        return this.createSelectTrait(
            '外边距',
            'margin',
            [
                { value: '', name: '默认' },
                { value: 'ms-auto', name: '左侧自动' },
                { value: 'me-auto', name: '右侧自动' },
                { value: 'mx-auto', name: '水平居中' },
            ],
            true
        );
    }

    // 获取行组件的所有traits
    static getRowTraits(): Partial<TraitProperties>[] {
        return [
            this.getRowColsTraits(),
            ...this.getSpacingTraits()
        ];
    }

    // 获取列组件的所有traits
    static getColumnTraits(): Partial<TraitProperties>[] {
        return [
            this.getColumnWidthTraits(),
            this.getAlignmentTraits(),
            this.getOffsetTraits(),
            this.getOrderTraits(),
            this.getMarginTraits()
        ];
    }
}

export class GridComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const editor = this.editor;

        // 注册删除列确认命令
        editor.Commands.add('grid:confirm-remove-cols', {
            run(editor, sender, options: { component: any; targetCols: number }) {
                const { component, targetCols } = options;
                const currentCols = component.components().length;
                const colsToRemove = currentCols - targetCols;

                if (confirm(`确定要删除 ${colsToRemove} 列吗？这个操作可能会丢失内容。`)) {
                    // 执行删除操作
                    for (let i = 0; i < colsToRemove; i++) {
                        const lastCol = component.components().at(component.components().length - 1);
                        if (lastCol) {
                            component.components().remove(lastCol);
                        }
                    }
                } else {
                    // 如果用户取消，恢复之前的值
                    component.set('row-cols', '');
                    // 移除所有现有的 row-cols 类
                    const classes = component.getClasses();
                    const rowColsClasses = classes.filter((cls: string) => cls.startsWith('row-cols-'));
                    component.removeClass(rowColsClasses);
                }
            }
        });

        // 行组件
        editor.Components.addType(GRID_BLOCKS['bs-row'], {
            isComponent: (el) => {
                if (!el.classList) return false;
                return el.classList.contains('row');
            },
            model: {
                defaults: {
                    tagName: 'div',
                    classes: ['row'],
                    droppable: { selector: '.col, [class*="col-"]' },
                    draggable: true,
                    'custom-name': '行',
                    attributes: {
                        'data-gjs-highlightable': true,
                        'data-gjs-type': 'grid-row',
                        'draggable': true,
                        'data-dm-category': 'layout'
                    },
                    traits: GridTraitsFactory.getRowTraits()
                },

                init() {
                    this.on('change:row-cols', this.handleRowColsChange);
                    this.on('change:gx', this.handleGxChange);
                    this.on('change:gy', this.handleGyChange);
                },

                handleRowColsChange() {
                    const value = this.get('row-cols');
                    // 移除所有现有的 row-cols 类
                    const classes = this.getClasses();
                    const rowColsClasses = classes.filter(cls => cls.startsWith('row-cols-'));
                    this.removeClass(rowColsClasses);
                    // 添加新的类
                    if (value) {
                        this.addClass(value);
                    }

                    // 获取目标列数
                    let targetCols = 0;
                    if (value === 'row-cols-auto') return; // 自动模式不处理
                    if (value === '') return; // 默认模式不处理
                    targetCols = parseInt(value.replace('row-cols-', ''));
                    if (!targetCols) return;

                    // 获取当前列数
                    const components = this.components();
                    const currentCols = components.length;

                    // 如果需要添加列
                    if (currentCols < targetCols) {
                        const colsToAdd = targetCols - currentCols;
                        const defaultCol = {
                            type: GRID_BLOCKS['bs-col'],
                            classes: ['col'],
                            style: {
                                minHeight: '50px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }
                        };

                        for (let i = 0; i < colsToAdd; i++) {
                            components.add(defaultCol);
                        }
                    }
                    // 如果需要删除列，触发确认命令
                    else if (currentCols > targetCols) {
                        editor.runCommand('grid:confirm-remove-cols', {
                            component: this,
                            targetCols
                        });
                    }
                },

                handleGxChange() {
                    const value = this.get('gx');
                    // 移除所有现有的 gx 类
                    const classes = this.getClasses();
                    const gxClasses = classes.filter(cls => cls.startsWith('gx-'));
                    this.removeClass(gxClasses);
                    // 添加新的类
                    if (value) {
                        this.addClass(value);
                    }
                },

                handleGyChange() {
                    const value = this.get('gy');
                    // 移除所有现有的 gy 类
                    const classes = this.getClasses();
                    const gyClasses = classes.filter(cls => cls.startsWith('gy-'));
                    this.removeClass(gyClasses);
                    // 添加新的类
                    if (value) {
                        this.addClass(value);
                    }
                }
            }
        });

        // 列组件
        editor.Components.addType(GRID_BLOCKS['bs-col'], {
            isComponent: (el) => {
                if (!el.classList) return false;
                return el.classList.contains('col') || !!el.className.match(/col-[0-9]+/);
            },
            model: {
                defaults: {
                    tagName: 'div',
                    classes: ['col'],
                    draggable: '.row',
                    droppable: true,
                    style: {
                        minHeight: '50px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    },
                    attributes: {
                        'data-gjs-highlightable': true,
                        'data-gjs-type': 'grid-column',
                        'draggable': true,
                        'data-dm-category': 'layout'
                    },
                    traits: GridTraitsFactory.getColumnTraits(),
                    'custom-name': '列2',
                    'script-props': ['col-base', 'align-self', 'offset', 'order', 'margin'],
                    script: function(props) {
                        console.log('props', props);
                        const updateClasses = function(props) {
                            const el = this;
                            
                            // 处理 col-base
                            const colBase = props['col-base'];
                            console.log(colBase, "colBase !== undefined");
                            if (colBase !== undefined) {
                                const colClasses = el.className.split(' ')
                                    .filter(cls => cls.startsWith('col-') || cls === 'col');
                                colClasses.forEach(cls => el.classList.remove(cls));
                                if (colBase) el.classList.add(colBase);
                            }
                            
                            // 处理 align-self
                            const alignSelf = props['align-self'];
                            if (alignSelf !== undefined) {
                                const alignClasses = el.className.split(' ')
                                    .filter(cls => cls.startsWith('align-self-'));
                                alignClasses.forEach(cls => el.classList.remove(cls));
                                if (alignSelf) el.classList.add(alignSelf);
                            }
                            
                            // 处理 offset
                            const offset = props['offset'];
                            if (offset !== undefined) {
                                const offsetClasses = el.className.split(' ')
                                    .filter(cls => cls.startsWith('offset-'));
                                offsetClasses.forEach(cls => el.classList.remove(cls));
                                if (offset) el.classList.add(offset);
                            }
                            
                            // 处理 order
                            const order = props['order'];
                            if (order !== undefined) {
                                const orderClasses = el.className.split(' ')
                                    .filter(cls => cls.startsWith('order-'));
                                orderClasses.forEach(cls => el.classList.remove(cls));
                                if (order) el.classList.add(order);
                            }
                            
                            // 处理 margin
                            const margin = props['margin'];
                            if (margin !== undefined) {
                                const marginClasses = el.className.split(' ')
                                    .filter(cls => cls === 'ms-auto' || cls === 'me-auto' || cls === 'mx-auto');
                                marginClasses.forEach(cls => el.classList.remove(cls));
                                if (margin) el.classList.add(margin);
                            }
                        }
                        
                        // 初始更新
                        updateClasses.call(this, props);
                    },
                },

                // init() {
                //     // 属性名映射
                //     const propMapping = {
                //         'col-base': 'colBase',
                //         'align-self': 'alignSelf',
                //         'offset': 'offset',
                //         'order': 'order',
                //         'margin': 'margin'
                //     };

                //     // 统一的属性变化处理器
                //     const handlePropChange = (prop) => {
                //         const value = this.get(prop);
                //         const scriptProp = propMapping[prop];
                //         this.addAttributes({ 'data-gjs-props': JSON.stringify({ [scriptProp]: value }) });
                //     };

                //     // 监听所有属性变化
                //     Object.keys(propMapping).forEach(prop => {
                //         this.on(`change:${prop}`, () => handlePropChange(prop));
                //     });
                // }
            }
        });
    }
}