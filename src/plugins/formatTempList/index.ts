import type { Plugin } from 'grapesjs';
import { MarqueeTextComponent } from './components';
import { MarqueeTextBlock } from './blocks';
import './styles.css';
export interface PluginOptions {
  // 组件名称
  componentName?: string;
  // block名称
  blockName?: string;
  // 默认数据源
  defaultDataSource?: Array<any>;
  // 默认格式化模板
  defaultTemplate?: string;
}

const plugin: Plugin<PluginOptions> = (editor, opts = {}) => {
  const options: PluginOptions = {
    componentName: 'format-temp-list',
    blockName: '格式化模板列表',
    defaultDataSource: [
      { name: '项目1', value: 100 },
      { name: '项目2', value: 200 },
      { name: '项目3', value: 300 }
    ],
    defaultTemplate: '${name}: ${value}',
    ...opts
  };

  const componentName = options.componentName || 'format-temp-list';

  // 添加组件
  editor.Components.addType(componentName, MarqueeTextComponent(editor));

  // 添加区块
  editor.Blocks.add(componentName, MarqueeTextBlock(options));
};

export default plugin;