'use client'

import { LayersProvider, useEditor } from '@grapesjs/react'
import { cn } from '@/lib/utils'
import { GoChevronDown, GoChevronRight } from 'react-icons/go'
import { useState, useRef } from 'react'
import type { Component } from 'grapesjs'
import { LayerItem } from './layer-item'

interface DragRect {
  y: number
  h: number
  pointerInside: boolean
}

interface CanMove {
  result?: boolean
  target?: Component
  source?: Component | null
  index?: number
  canMoveInside?: { result: boolean }
}

export function LayerManager() {
  const editor = useEditor()
  const [dragging, setDragging] = useState<Component>()
  const [dragParent, setDragParent] = useState<Component>()
  const [dragRect, setDragRect] = useState<DragRect>()
  const [canMoveRes, setCanMoveRes] = useState<CanMove>({})
  const indicatorRef = useRef<HTMLDivElement>(null)

  const onDragStart = (cmp: Component) => {
    setDragging(cmp)
  }

  const onDragEnd = () => {
    if (canMoveRes?.result && canMoveRes.source) {
      canMoveRes.source.move(canMoveRes.target!, { at: canMoveRes.index })
    }
    setDragging(undefined)
    setDragParent(undefined)
    setDragRect(undefined)
    setCanMoveRes({})
  }

  return (
    <LayersProvider>
      {({ root }) => (
        <div 
          className="relative space-y-1"
          onPointerUp={onDragEnd}
        >
          {root && (
            <LayerItem
              component={root}
              level={0}
              dragging={dragging}
              dragParent={dragParent}
              onDragStart={onDragStart}
            />
          )}
          {dragRect && canMoveRes.result && !dragRect.pointerInside && (
            <div
              ref={indicatorRef}
              className="absolute w-full h-0.5 bg-yellow-400"
              style={{ 
                top: dragRect.y,
                left: 0,
              }}
            />
          )}
        </div>
      )}
    </LayersProvider>
  )
} 