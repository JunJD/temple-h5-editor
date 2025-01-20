'use client'

import { Canvas as MobileCanvas } from '@grapesjs/react'

export default function CenterArea() {
  return (
    <div className='flex-1'>
      <MobileCanvas className="pt-16 flex-grow gjs-custom-editor-canvas" id="desktop"/>
    </div>
  )
}
