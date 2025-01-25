import type { BlockProperties, Plugin } from 'grapesjs';
import loadBlocks from './blocks';
import loadComponents from './components';
import loadTraits from './traits';

export interface PluginOptions {
    /**
     * 要添加的块类型
     * @default ['form', 'input']
     */
    blocks?: string[];

    /**
     * 块的分类名称
     * @default '表单'
     */
    category?: BlockProperties["category"];

    /**
     * 添加自定义块选项
     * @default (blockId) => ({})
     */
    block?: (blockId: string) => ({});
}

const plugin: Plugin<PluginOptions> = (editor, opts = {}) => {
    const config: Required<PluginOptions> = {
        blocks: ['form', 'input', 'amount-input', 'radio-button-group'],
        category: { id: 'forms', label: '表单' },
        block: () => ({}),
        ...opts
    };

    loadComponents(editor);
    loadTraits(editor);
    loadBlocks(editor, config);
};

export default plugin;