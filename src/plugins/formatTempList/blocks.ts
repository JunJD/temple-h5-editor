import { PluginOptions } from './index';

export const MarqueeTextBlock = (opts: PluginOptions) => {
  return {
    label: opts.blockName || '格式化模板列表',
    media: `<svg viewBox="0 0 24 24">
      <path d="M4 7v10l8-5z"></path>
    </svg>`,
    content: {
      type: opts.componentName,
      style: {
        padding: '10px',
        width: '100%',
        'min-height': '50px',
        'background-color': '#f5f5f5',
      },
    },
  };
}; 