'use client'

import GjsEditor from '@grapesjs/react'
import type { Editor, EditorConfig } from 'grapesjs'
import { devices } from '@/lib/constants/devices'
import { blocks } from './blocks'
import { registerComponents } from '@/lib/components'

export default function BuilderEditor({ children }: { children: React.ReactNode }) {
  const onEditor = (editor: Editor) => {
    console.log('Editor loaded')
    ;(window as any).editor = editor
    
    // 注册组件
    registerComponents(editor)
  }

  return (
    <GjsEditor
      className="gjs-custom-editor"
      grapesjs="https://unpkg.com/grapesjs"
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      options={gjsOptions}
      plugins={[
        {
          id: 'gjs-blocks-basic',
          src: 'https://unpkg.com/grapesjs-blocks-basic',
        },
        {
          id: 'gjs-style-gradient',
          src: 'https://unpkg.com/grapesjs-style-gradient',
        },
      ]}
      onEditor={onEditor}
    >
      {children}
    </GjsEditor>
  )
}

const gjsOptions: EditorConfig = {
  height: '100vh',
  storageManager: false,
  undoManager: { trackSelection: false },
  selectorManager: { componentFirst: true },
  projectData: {
    assets: [],
    pages: [
      {
        name: 'Home page',
        component: `
          <section style="min-height: 100vh;">
            <div>拖拽组件到这里开始编辑</div>
          </section>
        `,
      },
    ],
  },
  // 使用基础 blocks
  blockManager: {
    custom: true,
    blocks
  },
  deviceManager: {
    devices: Object.values(devices).map(device => ({
      id: device.id,
      name: device.name,
      width: `${device.width}px`,
      height: `${device.height}px`
    })),
    default: 'iphone14'
  },
  // styleManager: {
  //   sectors: [
  //     {
  //       name: 'Dimension',
  //       properties: [
  //         'width',
  //         'height',
  //         'min-width',
  //         'max-width',
  //         'min-height',
  //         'max-height',
  //       ],
  //     },
  //     {
  //       name: 'Extra',
  //       properties: [
  //         'margin',
  //         'padding',
  //         'display',
  //         'flex-direction',
  //         'justify-content',
  //         'align-items',
  //         'gap',
  //       ],
  //     },
  //     {
  //       name: 'Typography',
  //       properties: [
  //         'font-family',
  //         'font-size',
  //         'font-weight',
  //         'letter-spacing',
  //         'color',
  //         'text-align',
  //       ],
  //     },
  //     {
  //       name: 'Decorations',
  //       properties: [
  //         'background-color',
  //         'border',
  //         'border-radius',
  //         'box-shadow',
  //       ],
  //     },
  //   ],
  // },
}
