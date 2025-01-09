'use client'

import { Canvas, useEditorMaybe } from '@grapesjs/react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useState, useEffect } from 'react'

export default function CenterArea() {
  const editor = useEditorMaybe()
  const [device, setDevice] = useState({
    width: 375,
    height: 812
  })
  
  useEffect(() => {
    if (editor) {
      const updateDevice = () => {
        const selectedDevice = editor.Devices.getSelected()
        console.log('Available devices:', editor.Devices.getAll().toArray())
        console.log('Selected device:', selectedDevice)
        if (selectedDevice) {
          setDevice({
            width: Number(selectedDevice.get('widthMedia') || selectedDevice.get('width')) || 375,
            height: Number(selectedDevice.get('height')) || 812
          })
        }
      }
      
      // 初始化时获取一次设备信息
      updateDevice()
      
      // 监听设备变化
      editor.on('device:select', updateDevice)
      
      // 清理函数
      return () => {
        editor.off('device:select', updateDevice)
      }
    }
  }, [editor])
  
  return (
    <div className="flex justify-center items-center bg-background/50 p-2">
      <TransformWrapper
        centerOnInit
        maxScale={2}
        minScale={0.4}
        initialScale={0.8}
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        wheel={{
          wheelDisabled: true
        }}
        panning={{
          disabled: true
        }}
      >
        <TransformComponent
          wrapperClass="!w-screen !h-full"
          contentClass="grid items-start justify-center"
          contentStyle={{
            width: `${device.width + 20}px`,
            height: `${device.height + 20}px`
          }}
        >
          <div className="relative size-full">
            <div
              className="bg-background rounded-lg shadow-lg border border-border overflow-hidden size-full"
            >
              <Canvas className="gjs-custom-editor-canvas" id="mobilePortrait"/>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
