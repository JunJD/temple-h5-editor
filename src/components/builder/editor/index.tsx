'use client'

import GjsEditor from '@grapesjs/react'
import zh from 'grapesjs/locale/zh';
import grapesjs from 'grapesjs';
import type { Editor, EditorConfig, ObjectAny } from 'grapesjs'
import { devices } from '@/lib/constants/devices'
import { toast } from '@/hooks/use-toast'

// import { useState } from 'react'
import LinkageForm from '@/plugins/linkageForm'
import gjsWrapper from '@/plugins/wrapper'
import v5 from '@/plugins/v5'
// import Linkage from '@/plugins/linkage'
import gjsblockbasic from 'grapesjs-blocks-basic';
import gjsStyleEasing from 'grapesjs-style-easing';
// import gjsPluginGoogleMaterialIcons from 'grapesjs-google-material-icons'
// import grapesjsScriptEditor from 'grapesjs-script-editor';

// import tailwindPlugin from 'grapesjs-tailwind'
import formatTempList from '@/plugins/formatTempList'
import customCodePlugin from "grapesjs-custom-code";
// import grapesjsTabs from 'grapesjs-tabs';
import grapesRulers from '@/plugins/customRules';
// import grapesUserBlocks from 'grapesjs-user-blocks';
// @ts-ignore
import gjsPluginExport from 'grapesjs-plugin-export';
// import gjsForms from 'grapesjs-plugin-forms';
import gjsStyleBg from 'grapesjs-style-bg';
import gjsStyleFilter from 'grapesjs-style-filter';
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import autoSavePlugin from '@/plugins/autoSave';
import { styleManager } from './config/styleManager';
import 'grapesjs/dist/css/grapes.min.css';
import '@/styles/grapesjs.css';
import '@/styles/fonts.css';
import { FormConfig } from '@/schemas';
import { useUpdateFormConfigField } from '@/contexts/issue-context';

export default function BuilderEditor({ children, projectData, id, formConfig }: { 
  children: React.ReactNode, 
  projectData: ObjectAny, 
  id: string ,
  formConfig: FormConfig
}) {
  const updateFormConfig = useUpdateFormConfigField()
  const onEditor = (editor: Editor) => {
    // 仅使用全局设备（不生成 @media），并迁移历史 430px 断点到全局
    try {
      const dm = (editor as any).DeviceManager || (editor as any).Devices
      if (dm && typeof dm.select === 'function') dm.select('global')

      const cssc = (editor as any).Css || (editor as any).CssComposer
      const rules = cssc?.getAll?.() || []
      rules.forEach((rule: any) => {
        try {
          const mt = rule.get && (rule.get('mediaText') || rule.get('media'))
          if (typeof mt === 'string' && /\(max-width:\s*\d+px\)/i.test(mt)) {
            // 将任意 max-width 媒体查询扁平化为全局，避免历史阈值残留/重复
            rule.set && rule.set('mediaText', '')
          }
        } catch {}
      })
    } catch {}
  }

  return (
    <>
      <GjsEditor
        waitReady={<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            加载编辑器...
          </div>
        </div>}
        className="gjs-custom-editor"
        grapesjs={grapesjs}
        grapesjsCss='/css/gjsCss.css'
        options={{
          ...gjsOptions,
          storageManager: {
            id
          },
          projectData,
          pluginsOpts: {
            ...gjsOptions.pluginsOpts,
            [v5 as unknown as string]: {
              formConfig,
              updateFormConfig
            },
            [autoSavePlugin as unknown as string]: {
              debounceTime: 1000, // 设置为1秒防抖时间
              beforeSave: () => console.log('准备自动保存...'),
              afterSave: () => {
                console.log('自动保存成功');
                // 不在这里显示toast，交由builder-header组件处理
              },
              onError: (error: any) => {
                console.error('自动保存失败:', error);
                // 不在这里显示toast，交由builder-header组件处理
              },
              pageId: id, // 将页面ID传递给自动保存插件
              showToast: false // 不显示每次自动保存的提示，避免过多通知干扰用户
            }
          }
        }}
        style={{
          overflow: 'hidden',
        }}
        plugins={[
          gjsblockbasic,
          gjsStyleEasing,
          // grapesjsScriptEditor,
          // tailwindPlugin,
          // gjsPluginGoogleMaterialIcons,
          // {
          //   id: 'grapesjs-grid-system',
          //   src: '/grapesjs-grid-system.min.js',
          // },
          // @ts-ignore
          gjsPluginExport,
          LinkageForm,
          // Linkage,
          gjsWrapper,
          v5,
          formatTempList,
          customCodePlugin,
          // grapesjsTabs,
          grapesRulers,
          // grapesUserBlocks,
          gjsStyleBg,
          gjsStyleFilter,
          gjsStyleGradient,
          gjsTuiImageEditor,
          autoSavePlugin,
        ]}
        onReady={onEditor}
      >
        {children}
      </GjsEditor>
    </>
  )
}
const gjsOptions: EditorConfig = {
  telemetry: false,
  showOffsets: true,
  showOffsetsSelected: true,
  fromElement: true,
  assetManager: {
    assets: [
    ]
  },
  i18n: {
    locale: 'zh',
    localeFallback: 'en',
    detectLocale: true,
    messages: {
      zh: zh
    }
  },
  height: '100vh',
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
    frameStyle: `
      * {
        font-family: 'weiruanyahei', 'Microsoft YaHei', sans-serif !important;
      }
    `,
    infiniteCanvas: true,
  },
  deviceManager: {
    // 仅注册一个全局设备，不设置 widthMedia -> 样式落在全局，不生成 @media
    devices: [
      { id: 'global', name: 'Global', width: 'auto', height: 'auto' }
    ]
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
      blocks: ['text', 'image'],
      // 使用 flexbox 布局
      flexGrid: true,
      // 使用基础 CSS
      addBasicStyle: true,
      // 分类名称
      category: '基础组件',
    },
  },
  styleManager
}
