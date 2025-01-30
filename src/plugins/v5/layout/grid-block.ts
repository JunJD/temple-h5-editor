import { BaseLoadBlocks } from "../base";
import { GRID_BLOCKS } from "./constants";
import { Editor, PluginOptions } from "grapesjs";

export class GridBlocks extends BaseLoadBlocks {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const blockManager = this.editor.Blocks;

        // 基础三列布局
        blockManager.add('grid-3-cols', {
            label: '三列布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '列 1'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '列 2'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '列 3'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });

        // 两列布局（比例 1:1）
        blockManager.add('grid-2-cols', {
            label: '两列布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        classes: ['col-6'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '50%'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-6'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '50%'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });

        // 两列布局（比例 1:2）
        blockManager.add('grid-1-2', {
            label: '1:2布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        classes: ['col-4'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '33%'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-8'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '66%'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });

        // 四列布局
        blockManager.add('grid-4-cols', {
            label: '四列布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        classes: ['col-3'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '25%'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-3'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '25%'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-3'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '25%'
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-3'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '25%'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });

        // 单列布局
        blockManager.add('grid-1-col', {
            label: '单列布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        classes: ['col-12'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '100%'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });

        // 嵌套布局
        blockManager.add('grid-nested', {
            label: '嵌套布局',
            content: {
                type: 'bs-row',
                components: [
                    {
                        type: 'bs-col',
                        classes: ['col-8'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '主列'
                            },
                            {
                                type: 'bs-row',
                                components: [
                                    {
                                        type: 'bs-col',
                                        classes: ['col-6'],
                                        components: [
                                            {
                                                tagName: 'div',
                                                style: { padding: '10px', textAlign: 'center' },
                                                content: '嵌套列'
                                            }
                                        ]
                                    },
                                    {
                                        type: 'bs-col',
                                        classes: ['col-6'],
                                        components: [
                                            {
                                                tagName: 'div',
                                                style: { padding: '10px', textAlign: 'center' },
                                                content: '嵌套列'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'bs-col',
                        classes: ['col-4'],
                        components: [
                            {
                                tagName: 'div',
                                style: { padding: '10px', textAlign: 'center' },
                                content: '侧边列'
                            }
                        ]
                    }
                ]
            },
            category: '布局',
            attributes: { class: 'fa fa-columns' }
        });
    }
}