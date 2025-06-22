'use client'

import { cn } from '@/lib/utils'
import { 
  GoChevronDown, 
  GoChevronRight, 
  GoEye, 
  GoEyeClosed,
  GoCopy,
  GoTrash 
} from 'react-icons/go'
import type { Component } from 'grapesjs'
import { useEditor } from '@grapesjs/react'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  const componentsIds = components.map(cmp => cmp.getId())
  const isDragging = dragging === component
  const isHovered = dragParent === component
  const cmpHash = componentsIds.join('-')

  // 使用 useMemo 优化子组件渲染
  const childComponents = useMemo(() => {
    return components.map(child => (
      <LayerItem
        key={child.getId()}
        component={child}
        level={level + 1}
        dragging={dragging}
        dragParent={dragParent}
        onDragStart={onDragStart}
      />
    ))
  }, [cmpHash, dragging, dragParent, onDragStart])

  useEffect(() => {
    level === 0 && setLayerData(Layers.getLayerData(component))
    if (layerRef.current) {
      (layerRef.current as any).__cmp = component
    }
  }, [component, level])

  useEffect(() => {
    const up = (cmp: Component) => {
      cmp === component && setLayerData({ ...Layers.getLayerData(cmp) })
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
    const { visible: currentVisible } = Layers.getLayerData(component)
    Layers.setLayerData(component, { visible: !currentVisible })
  }

  const select = (e: React.MouseEvent) => {
    e.stopPropagation()
    Layers.setLayerData(component, { selected: true }, { event: e })
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    editor.Commands.run('core:copy-component', { component })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    editor.Commands.run('core:component-delete', { component })
  }

  return (
    <div className={cn(
      "flex flex-col group/item",
      (!visible || isDragging) && "opacity-50"
    )}>
      {components.length > 0 ? (
        <Collapsible open={open} onOpenChange={open => Layers.setLayerData(component, { open })}>
          <div 
            ref={layerRef}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5",
              "hover:bg-accent/50 cursor-move group",
              selected && "bg-accent",
              isHovered && "bg-accent/70"
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={select}
            onPointerDown={() => onDragStart(component)}
            data-layer-item
          >
            <CollapsibleTrigger asChild>
              <button className="cursor-pointer">
                {open ? (
                  <GoChevronDown className="size-4" />
                ) : (
                  <GoChevronRight className="size-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <span className="text-sm flex-grow truncate">{name}</span>
            <div className="flex items-center gap-1">
              <button
                className={cn(
                  "opacity-0 group-hover:opacity-100",
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
              <button
                className="opacity-0 group-hover:opacity-100 hover:text-accent-foreground"
                onClick={handleCopy}
              >
                <GoCopy className="size-4" />
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                onClick={handleDelete}
              >
                <GoTrash className="size-4" />
              </button>
            </div>
          </div>
          <CollapsibleContent>
            {childComponents}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div 
          ref={layerRef}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5",
            "hover:bg-accent/50 cursor-move group",
            selected && "bg-accent",
            isHovered && "bg-accent/70"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={select}
          onPointerDown={() => onDragStart(component)}
          data-layer-item
        >
          <span className="text-sm flex-grow truncate">{name}</span>
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "opacity-0 group-hover:opacity-100",
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
            <button
              className="opacity-0 group-hover:opacity-100 hover:text-accent-foreground"
              onClick={handleCopy}
            >
              <GoCopy className="size-4" />
            </button>
            <button
              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
              onClick={handleDelete}
            >
              <GoTrash className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 