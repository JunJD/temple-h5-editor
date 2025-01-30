import { Editor, PluginOptions } from "grapesjs";
import { GRID_BLOCKS } from "./constants";
import { BaseLoadComponents } from "../base";

type TraitOption = {
    id: string;
    name: string;
    value: string;
}

export class GridComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    private createTraitOptions(options: { value: string; name: string; }[]): TraitOption[] {
        return options.map(opt => ({
            ...opt,
            id: opt.value || 'default'
        }));
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
                    draggable: true,  // 可以放在任何容器中
                    'custom-name': '行',  // 在组件树中显示的名称
                    attributes: {
                        'data-gjs-highlightable': true,
                        'data-gjs-type': 'grid-row',
                        'draggable': true,
                        'data-dm-category': 'layout'
                    },
                    traits: [
                        {
                            type: 'select',
                            label: '列数',
                            name: 'row-cols',
                            options: this.createTraitOptions([
                                { value: '', name: '自动' },
                                { value: 'row-cols-1', name: '1列' },
                                { value: 'row-cols-2', name: '2列' },
                                { value: 'row-cols-3', name: '3列' },
                                { value: 'row-cols-4', name: '4列' },
                                { value: 'row-cols-5', name: '5列' },
                                { value: 'row-cols-6', name: '6列' },
                                { value: 'row-cols-auto', name: '自动宽度' },
                            ]),
                            changeProp: true
                        },
                        {
                            type: 'select',
                            label: '水平间距',
                            name: 'gx',
                            options: this.createTraitOptions([
                                { value: '', name: '默认' },
                                { value: 'gx-0', name: '无间距' },
                                { value: 'gx-1', name: '小' },
                                { value: 'gx-2', name: '中' },
                                { value: 'gx-3', name: '大' },
                                { value: 'gx-4', name: '特大' },
                                { value: 'gx-5', name: '超大' },
                            ]),
                            changeProp: true
                        },
                        {
                            type: 'select',
                            label: '垂直间距',
                            name: 'gy',
                            options: this.createTraitOptions([
                                { value: '', name: '默认' },
                                { value: 'gy-0', name: '无间距' },
                                { value: 'gy-1', name: '小' },
                                { value: 'gy-2', name: '中' },
                                { value: 'gy-3', name: '大' },
                                { value: 'gy-4', name: '特大' },
                                { value: 'gy-5', name: '超大' },
                            ]),
                            changeProp: true
                        }
                    ]
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
                    traits: [
                        {
                            type: 'select',
                            label: '基础列宽',
                            name: 'col-base',
                            options: this.createTraitOptions([
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
                            ]),
                            changeProp: true
                        }
                    ],
                    'custom-name': '列'  // 在组件树中显示的名称
                },

                init() {
                    this.on('change:col-base', this.handleColBaseChange);
                },

                handleColBaseChange() {
                    const value = this.get('col-base');
                    // 移除所有现有的 col 类
                    const classes = this.getClasses();
                    const colClasses = classes.filter(cls => cls === 'col' || cls.startsWith('col-'));
                    this.removeClass(colClasses);
                    // 添加新的类
                    if (value) {
                        this.addClass(value);
                    }
                }
            }
        });
    }
}