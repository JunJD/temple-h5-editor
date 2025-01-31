import { BaseLoadBlocks } from "../common/base";
import { Editor, PluginOptions } from "grapesjs";
import { TAB_TYPES } from "./constants";
// import type { BlockProperties } from "grapesjs";
// import { TraitsFactory } from "./grid-components";

// 常量定义
// const TAB_TYPES = {
//     'tab-container': 'tab-container',
//     'tabs': 'tabs',
//     'tab': 'tab',
//     'tab-contents': 'tab-contents',
//     'tab-content': 'tab-content'
// };

export class CustomTabBlocks extends BaseLoadBlocks {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const blockManager = this.editor.Blocks;

        // 添加标签页block
        blockManager.add('custom-tab', {
            label: '标签页',
            category: '组件',
            content: {
                type: TAB_TYPES['tab-container'],
                components: [
                    {
                        type: TAB_TYPES['tabs'],
                        components: [
                            {
                                type: TAB_TYPES['tab'],
                                classes: ['nav-item', 'nav-link', 'active'],
                                content: '标签页 1',
                                attributes: {
                                    role: 'tab',
                                    'data-bs-toggle': 'tab',
                                    'data-bs-target': '#tab1',
                                    'aria-selected': 'true'
                                }
                            },
                            {
                                type: TAB_TYPES['tab'],
                                classes: ['nav-item', 'nav-link'],
                                content: '标签页 2',
                                attributes: {
                                    role: 'tab',
                                    'data-bs-toggle': 'tab',
                                    'data-bs-target': '#tab2',
                                    'aria-selected': 'false'
                                }
                            }
                        ]
                    },
                    {
                        type: TAB_TYPES['tab-contents'],
                        components: [
                            {
                                type: TAB_TYPES['tab-content'],
                                classes: ['tab-pane', 'fade', 'show', 'active'],
                                attributes: {
                                    id: 'tab1',
                                    role: 'tabpanel'
                                },
                                components: [
                                    {
                                        type: 'text',
                                        content: '标签页 1 内容'
                                    }
                                ]
                            },
                            {
                                type: TAB_TYPES['tab-content'],
                                classes: ['tab-pane', 'fade'],
                                attributes: {
                                    id: 'tab2',
                                    role: 'tabpanel'
                                },
                                components: [
                                    {
                                        type: 'text',
                                        content: '标签页 2 内容'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            attributes: { class: 'fa fa-folder' }
        });

        // 注册所有布局块
        // blockManager.add('grid-3-cols', LayoutBlockFactory.createThreeColumnsLayout());
        // blockManager.add('grid-2-cols', LayoutBlockFactory.createTwoEqualColumnsLayout());
        // blockManager.add('grid-1-2', LayoutBlockFactory.createOneToTwoLayout());
        // blockManager.add('grid-2-1', LayoutBlockFactory.createTwoToOneLayout());
        // blockManager.add('grid-1-col', LayoutBlockFactory.createSingleColumnLayout());
        // blockManager.add('grid-4-cols', LayoutBlockFactory.createFourColumnsLayout());
    }
}