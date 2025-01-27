'use client'

import GjsEditor from '@grapesjs/react'
import zh from 'grapesjs/locale/zh';
import grapesjs from 'grapesjs';
import type { Editor, EditorConfig, ObjectAny } from 'grapesjs'
import { devices } from '@/lib/constants/devices'
import { registerComponents } from '@/lib/components'
import { useState } from 'react'
import LinkageForm from '@/plugins/linkageForm'
import gjsWrapper from '@/plugins/wrapper'
import Linkage from '@/plugins/linkage'
import gjsblockbasic from 'grapesjs-blocks-basic';
import gjsStyleEasing from 'grapesjs-style-easing';
import gjsPluginGoogleMaterialIcons from 'grapesjs-google-material-icons'
import grapesjsScriptEditor from 'grapesjs-script-editor';

// import tailwindPlugin from 'grapesjs-tailwind'
import formatTempList from '@/plugins/formatTempList'
import customCodePlugin from "grapesjs-custom-code";
import grapesjsTabs from 'grapesjs-tabs';
import grapesRulers from 'grapesjs-rulers';
import grapesUserBlocks from 'grapesjs-user-blocks';
// @ts-ignore
import gjsPluginExport from 'grapesjs-plugin-export';
// import gjsForms from 'grapesjs-plugin-forms';
import gjsStyleBg from 'grapesjs-style-bg';
import gjsStyleFilter from 'grapesjs-style-filter';
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import { styleManager } from './config/styleManager';
import 'grapesjs/dist/css/grapes.min.css';
import '@/styles/grapesjs.css';
import '@/styles/fonts.css';

export default function BuilderEditor({ children, projectData }: { children: React.ReactNode, projectData: ObjectAny }) {
  const [isLoading, setIsLoading] = useState(true)

  const onEditor = (editor: Editor) => {
    console.log('Editor loaded')
      ; (window as any).editor = editor

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
          gjsStyleEasing,
          grapesjsScriptEditor,
          gjsPluginGoogleMaterialIcons,
          {
            id: 'grapesjs-grid-system',
            src: '/grapesjs-grid-system.min.js',
          },
          // @ts-ignore
          gjsPluginExport,
          LinkageForm,
          Linkage,
          gjsWrapper,
          formatTempList,
          customCodePlugin,
          grapesjsTabs,
          grapesRulers,
          grapesUserBlocks,
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
  showOffsets: true,
  showOffsetsSelected: true,
  fromElement: true,
  i18n: {
    locale: 'zh',
    localeFallback: 'en',
    detectLocale: true,
    messages: {
      zh: zh
    }
  },
  height: '100vh',
  storageManager: false,
  undoManager: { trackSelection: false },
  selectorManager: {
    componentFirst: true,
    states: [
      { name: 'hover', label: '悬浮' },
      { name: 'active', label: '激活' },
      { name: 'focus', label: '聚焦' },
      { name: 'selected', label: '选中' },
      { name: 'disabled', label: '禁用' },
    ],
  },
  canvas: {
    styles: [
      `
        * {
          font-family: 'weiruanyahei', 'Microsoft YaHei', sans-serif !important;
        }
        body {
          height: 100vh;
          background-color: #fff;
        }
      `
    ],
    infiniteCanvas: true,
  },
  deviceManager: {
    devices: Object.values(devices).map(device => ({
      id: device.id,
      name: device.name,
      width: `${device.width}px`,
      height: `${device.height}px`,
      widthMedia: undefined
    }))
  },
  pluginsOpts: {
    // @ts-ignore
    [gjsPluginExport as string]: {
      root: {
        css: {
          'style.css': (editor: Editor) => `
            @font-face {
              font-family: 'weiruanyahei';
              src: url('/fonts/weiruanyahei.ttf') format('truetype');
            }
            * {
              font-family: 'weiruanyahei', 'Microsoft YaHei', sans-serif !important;
            }
            ${editor.getCss()}
          `,
        },
        fonts: {
          'weiruanyahei.ttf': '/fonts/weiruanyahei.ttf',  // 这里是字体文件的路径
        },
        'index.html': (editor: Editor) =>
          `<!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {}
                  }
                }
              </script>
              <link rel="stylesheet" href="./css/style.css">
            </head>
            <body>
              ${editor.getHtml()}
            </body>
          </html>`
      },
    },
    // @ts-ignore
    [gjsblockbasic as string]: {
      // 启用的
      blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'image'],
      // 使用 flexbox 布局
      flexGrid: true,
      // 使用基础 CSS
      addBasicStyle: true,
      // 分类名称
      category: '基础组件',
    }
  },
  styleManager
}

