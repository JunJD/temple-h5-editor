'use client'

import { Canvas as MobileCanvas, useEditorMaybe } from '@grapesjs/react'
// import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// import { useState, useEffect } from 'react'

export default function CenterArea() {
  return (
    <MobileCanvas className="mt-16 flex-grow gjs-custom-editor-canvas" id="desktop"/>
  )
}
