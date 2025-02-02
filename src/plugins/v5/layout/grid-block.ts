import { BaseLoadBlocks } from "../common/base";
import { GRID_BLOCKS } from "./constants";
import { Editor, PluginOptions } from "grapesjs";
import type { BlockProperties } from "grapesjs";
import { GridTraitsFactory } from "./grid-components";

// 布局块工厂类
class LayoutBlockFactory {
    // 创建基础列组件
    private static createColumn(width: string = 'col', content: string = ''): any {
        const traits = GridTraitsFactory.getColumnTraits();
        // 设置列宽的默认值
        const colBaseTrait = traits.find(t => t.name === 'col-base');
        if (colBaseTrait) {
            colBaseTrait.value = width;
        }

        return {
            type: GRID_BLOCKS['bs-col'],
            classes: [width],
            traits,
            components: [
                {
                    tagName: 'div',
                    style: { 
                        padding: '10px', 
                        textAlign: 'center',
                        minHeight: '50px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    },
                    components: [
                        {
                            tagName: 'span',
                            content
                        }
                    ]
                }
            ]
        };
    }

    // 创建行组件
    private static createRow(columns: any[]): any {
        return {
            type: GRID_BLOCKS['bs-row'],
            traits: GridTraitsFactory.getRowTraits(),
            components: columns
        };
    }

    // 创建布局块配置
    private static createBlockConfig(
        label: string,
        content: any,
        category: string = '布局',
        icon: string = 'fa fa-columns'
    ): BlockProperties {
        return {
            label,
            content,
            category,
            attributes: { class: icon },
            id: '',  // 这个会被GrapeJS自动设置
            activate: true,
            select: true,
            resetId: true
        };
    }

    // 创建三列布局
    static createThreeColumnsLayout(): BlockProperties {
        const columns = [
            this.createColumn('col', '列 1'),
            this.createColumn('col', '列 2'),
            this.createColumn('col', '列 3')
        ];

        return this.createBlockConfig(
            '三列布局',
            this.createRow(columns)
        );
    }

    // 创建两列等宽布局
    static createTwoEqualColumnsLayout(): BlockProperties {
        const columns = [
            this.createColumn('col-6', '50%'),
            this.createColumn('col-6', '50%')
        ];

        return this.createBlockConfig(
            '两列布局',
            this.createRow(columns)
        );
    }

    // 创建1:2布局
    static createOneToTwoLayout(): BlockProperties {
        const columns = [
            this.createColumn('col-4', '33.33%'),
            this.createColumn('col-8', '66.67%')
        ];

        return this.createBlockConfig(
            '1:2布局',
            this.createRow(columns)
        );
    }

    // 创建2:1布局
    static createTwoToOneLayout(): BlockProperties {
        const columns = [
            this.createColumn('col-8', '66.67%'),
            this.createColumn('col-4', '33.33%')
        ];

        return this.createBlockConfig(
            '2:1布局',
            this.createRow(columns)
        );
    }

    // 创建单列布局
    static createSingleColumnLayout(): BlockProperties {
        const columns = [
            this.createColumn('col-12', '100%')
        ];

        return this.createBlockConfig(
            '单列布局',
            this.createRow(columns)
        );
    }

    // 创建四列布局
    static createFourColumnsLayout(): BlockProperties {
        const columns = [
            this.createColumn('col-3', '25%'),
            this.createColumn('col-3', '25%'),
            this.createColumn('col-3', '25%'),
            this.createColumn('col-3', '25%')
        ];

        return this.createBlockConfig(
            '四列布局',
            this.createRow(columns)
        );
    }
}

export class GridBlocks extends BaseLoadBlocks {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const blockManager = this.editor.Blocks;

        // 注册所有布局块
        blockManager.add('grid-3-cols', LayoutBlockFactory.createThreeColumnsLayout());
        blockManager.add('grid-2-cols', LayoutBlockFactory.createTwoEqualColumnsLayout());
        blockManager.add('grid-1-2', LayoutBlockFactory.createOneToTwoLayout());
        blockManager.add('grid-2-1', LayoutBlockFactory.createTwoToOneLayout());
        blockManager.add('grid-1-col', LayoutBlockFactory.createSingleColumnLayout());
        blockManager.add('grid-4-cols', LayoutBlockFactory.createFourColumnsLayout());
    }
}