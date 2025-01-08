'use client'

import { cn } from '@/lib/utils'
import { GoChevronDown, GoChevronRight, GoEye, GoEyeClosed } from 'react-icons/go'
import type { Component } from 'grapesjs'
import { useEditor } from '@grapesjs/react'
import { useState, useEffect, useRef } from 'react'

interface LayerItemProps {
  component: Component
  level: number
  dragging?: Component
  dragParent?: Component
  onDragStart: (cmp: Component) => void
}

export function LayerItem({ 
  component, 
  level,
  dragging,
  dragParent,
  onDragStart 
}: LayerItemProps) {
  const editor = useEditor()
  const { Layers } = editor
  const layerRef = useRef<HTMLDivElement>(null)
  const [layerData, setLayerData] = useState(Layers.getLayerData(component))
  const { open, selected, visible, name, components } = layerData

  useEffect(() => {
    level === 0 && setLayerData(Layers.getLayerData(component))
    if (layerRef.current) {
      (layerRef.current as any).__cmp = component
    }
  }, [component, level])

  useEffect(() => {
    const up = (cmp: Component) => {
      cmp === component && setLayerData(Layers.getLayerData(cmp))
    }
    const ev = Layers.events.component
    editor.on(ev, up)
    return () => {
        editor.off(ev, up)
    }
  }, [editor, Layers, component])

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    Layers.setLayerData(component, { open: !open })
  }

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    Layers.setLayerData(component, { visible: !visible })
  }

  const select = (e: React.MouseEvent) => {
    e.stopPropagation()
    Layers.setLayerData(component, { selected: true }, { event: e })
  }

  return (
    <div className="flex flex-col">
      <div 
        ref={layerRef}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5",
          "hover:bg-accent/50 cursor-move",
          selected && "bg-accent",
          dragging === component && "opacity-50",
          !visible && "opacity-50"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={select}
        onPointerDown={() => onDragStart(component)}
        data-layer-item
      >
        {components.length > 0 && (
          <button 
            className="cursor-pointer"
            onClick={toggleOpen}
          >
            {open ? (
              <GoChevronDown className="size-4" />
            ) : (
              <GoChevronRight className="size-4" />
            )}
          </button>
        )}
        <span className="text-sm flex-grow truncate">{name}</span>
        <button
          className={cn(
            "opacity-0 hover:opacity-100",
            !visible && "opacity-100"
          )}
          onClick={toggleVisibility}
        >
          {visible ? (
            <GoEye className="size-4" />
          ) : (
            <GoEyeClosed className="size-4" />
          )}
        </button>
      </div>

      {open && components.length > 0 && components.map(child => (
        <LayerItem
          key={child.getId()}
          component={child}
          level={level + 1}
          dragging={dragging}
          dragParent={dragParent}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  )
} 