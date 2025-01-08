'use client'

import { Canvas } from '@grapesjs/react'
import { devices, DeviceType } from '@/lib/constants/devices'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export default function CenterArea() {
  const device = {
    width: 375,
    height: 812
  }

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
          step: 0.1,
          wheelDisabled: false,
          activationKeys: ['Alt']
        }}
        panning={{
          disabled: false,
          velocityDisabled: true,
          activationKeys: ['Alt'],
        }}
      >
        <TransformComponent
          wrapperClass="!w-screen !h-screen"
          contentClass="grid items-start justify-center"
          contentStyle={{
            width: `${device.width}px`,
            height: `${device.height}px`
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
