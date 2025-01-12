'use client'

import { BlocksResultProps } from '@grapesjs/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CustomBlockManager({ blocks, dragStart, dragStop, mapCategoryBlocks }: BlocksResultProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (block: any, ev: DragEvent) => {
    setIsDragging(true);
    dragStart(block, ev);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStop(false);
  };
  return (
    <ScrollArea className="h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="space-y-4">
        {Array.from(mapCategoryBlocks).map(([category, blocks]) => (
          <div key={category}>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            {category}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {blocks.map((block) => (
              <div
                key={block.getId()}
                draggable
                className={cn(
                  'flex flex-col items-center justify-center p-2.5',
                  "bg-card hover:bg-accent",
                  'rounded-lg cursor-move',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5 active:scale-95',
                  'h-20 border border-border hover:border-border/50',
                  isDragging && 'opacity-50 scale-95',
                )}
                onDragStart={(ev) => handleDragStart(block, ev.nativeEvent)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={cn(
                    'w-3 h-3 transition-transform duration-200',
                  )}
                  dangerouslySetInnerHTML={{ __html: block.getMedia()! }}
                />
                <div
                  className={cn(
                    'text-xs mt-1.5',
                    'transition-opacity duration-200',
                  )}
                  title={block.getLabel()}
                >
                  {block.getLabel()}
                </div>
              </div>
            ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 