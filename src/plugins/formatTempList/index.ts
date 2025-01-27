'use client'
import type { BlockProperties, Plugin } from 'grapesjs';
import loadBlocks from './blocks';
import loadComponents from './components';

export type PluginOptions = {
  /**
   * 要添加的块类型
   * @default ['format-temp-list']
   */
  blocks?: string[];

  /**
   * 块的分类名称
   * @default '列表'
   */
  category?: BlockProperties["category"];

  /**
   * 添加自定义块选项
   */
  block?: (blockId: string) => ({});
};

const plugin: Plugin<PluginOptions> = (editor, opts = {}) => {
  const config: Required<PluginOptions> = {
    blocks: ['format-temp-list'],
    category: { id: 'lists', label: '列表' },
    block: () => ({}),
    ...opts
  };

  loadComponents(editor);
  loadBlocks(editor, config);
};

export default plugin;