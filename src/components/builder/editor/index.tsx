'use client'

import GjsEditor from '@grapesjs/react'
import type { Editor, EditorConfig, ObjectAny } from 'grapesjs'
import { devices } from '@/lib/constants/devices'
import { blocks } from './blocks'
import { registerComponents } from '@/lib/components'
import { useEffect } from 'react'

export default function BuilderEditor({ children, projectData }: { children: React.ReactNode, projectData: ObjectAny }) {
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
      options={{
        ...gjsOptions,
        projectData
      }}
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
  canvas: {
    infiniteCanvas: true
  },
  // 使用基础 blocks
  // blockManager: {
  //   custom: true,
  //   blocks
  // },
  deviceManager: {
    devices: Object.values(devices).map(device => ({
      id: device.id,
      name: device.name,
      width: `${device.width}px`,
      height: `${device.height}px`,
      widthMedia: undefined
    }))
  }
}

