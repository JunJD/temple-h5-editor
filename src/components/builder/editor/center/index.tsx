'use client'

import { Canvas as MobileCanvas, useEditorMaybe } from '@grapesjs/react'

export default function CenterArea() {
  return (
    <MobileCanvas className="pt-16 flex-grow gjs-custom-editor-canvas" id="desktop"/>
  )
}
