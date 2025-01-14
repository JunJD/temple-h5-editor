import type { BlockProperties, Editor } from 'grapesjs';
import { PluginOptions } from '.';
import { typeFormatTempList } from './components';

export default function (editor: Editor, opt: Required<PluginOptions>) {
  const opts = opt;
  const bm = editor.BlockManager;
  
  const addBlock = (id: string, def: BlockProperties) => {
    opts.blocks?.indexOf(id)! >= 0 && bm.add(id, {
      ...def,
      category: opts.category,
      select: true,
      ...opt.block(id),
    });
  }

  addBlock(typeFormatTempList, {
    label: '格式化模板列表',
    media: `<svg viewBox="0 0 24 24">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>
    </svg>`,
    content: {
      type: typeFormatTempList,
      classes: ['format-temp-list']
    }
  });
} 