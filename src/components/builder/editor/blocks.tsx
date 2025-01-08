'use client'

import type { Block, BlockProperties, Category } from 'grapesjs'

// 从 react-icons/go 复制的 SVG paths
const icons = {
  container: 'M4 4h16v16H4V4zm2 2v12h12V6H6z',
  stack: 'M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z',
  text: 'M13 6v15h-2v-15h-5v-2h12v2h-5z',
  image: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
  table: 'M3 3h18v18H3V3zm16 16V5H5v14h14z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  form: 'M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z'
}

const BlockIcon = (path: string) => `
  <svg viewBox="0 0 24 24" width="24" height="24" class="text-muted-foreground">
    <path fill="currentColor" d="${path}"/>
  </svg>
`

export const blocks: BlockProperties[] = [
  {
    id: 'section',
    label: '区块',
    category: 'layout',
    media: BlockIcon(icons.container),
    content: { 
      type: 'section',
      style: { 
        padding: '20px',
        minHeight: '100px'
      }
    }
  },
  {
    id: 'grid-2',
    label: '两列布局',
    category: 'layout',
    media: BlockIcon(icons.stack),
    content: {
      type: 'div',
      style: {
        display: 'grid',
        'grid-template-columns': '1fr 1fr',
        gap: '20px'
      }
    }
  },

  // 基础组件
  {
    id: 'text',
    label: '文本',
    category: 'basic',
    media: BlockIcon(icons.text),
    content: {
      type: 'text',
      content: '双击编辑文本',
      style: { padding: '10px' }
    }
  },
  {
    id: 'image',
    label: '图片',
    category: 'basic',
    media: BlockIcon(icons.image),
    content: { 
      type: 'image',
      style: { 
        width: '100px',
        height: '100px'
      }
    }
  },
  {
    id: 'table',
    label: '表格',
    category: 'basic',
    media: BlockIcon(icons.table),
    content: {
      type: 'table',
      style: { width: '100%' }
    }
  },

  // 表单组件
  {
    id: 'form',
    label: '表单',
    category: 'form',
    media: BlockIcon(icons.form),
    content: {
      type: 'form',
      attributes: { class: 'form' }
    }
  }
] 