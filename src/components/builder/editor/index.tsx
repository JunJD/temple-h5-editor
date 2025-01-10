'use client'

import GjsEditor from '@grapesjs/react'
import grapesjs from 'grapesjs';
import type { Editor, EditorConfig, ObjectAny } from 'grapesjs'
import { devices } from '@/lib/constants/devices'
import { blocks } from './blocks'
import { registerComponents } from '@/lib/components'
import { useState } from 'react'

import gjsblockbasic from 'grapesjs-blocks-basic';

import gjsPluginExport from 'grapesjs-plugin-export';
import gjsForms from 'grapesjs-plugin-forms';
import gjsStyleBg from 'grapesjs-style-bg';
import gjsStyleFilter from 'grapesjs-style-filter';
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import 'grapesjs/dist/css/grapes.min.css';

export default function BuilderEditor({ children, projectData }: { children: React.ReactNode, projectData: ObjectAny }) {
  const [isLoading, setIsLoading] = useState(true)

  const onEditor = (editor: Editor) => {
    console.log('Editor loaded')
    ;(window as any).editor = editor
    
    // 注册组件
    registerComponents(editor)
  }

  const onReady = (editor: Editor) => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            加载编辑器...
          </div>
        </div>
      )}
      <GjsEditor
        className="gjs-custom-editor"
        grapesjs={grapesjs}
        options={{
          ...gjsOptions,
          projectData
        }}
        plugins={[
          gjsblockbasic,
          gjsPluginExport,
          gjsForms,
          gjsStyleBg,
          gjsStyleFilter,
          gjsStyleGradient,
          gjsTuiImageEditor,
        ]}
        onEditor={onEditor}
        onReady={onReady}
      >
        {children}
      </GjsEditor>
    </>
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

