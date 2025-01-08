'use client'

import { BlocksResultProps } from '@grapesjs/react'
import { cn } from '@/lib/utils'

export function CustomBlockManager({ blocks, dragStart, dragStop, mapCategoryBlocks }: BlocksResultProps) {
  return (
    <div className="space-y-4">
      {Array.from(mapCategoryBlocks).map(([category, blocks]) => (
        <div key={category}>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            {category}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {blocks.map(block => {
                console.log('block', block)
                return (
                    (
                        <div
                          key={block.getId()}
                          className={cn(
                            "flex flex-col items-center justify-center p-4",
                            "bg-card hover:bg-accent rounded-lg cursor-move",
                            "border border-border hover:border-border/50",
                            "transition-colors"
                          )}
                          onMouseDown={(e) => dragStart(block, e as any)}
                          onMouseUp={() => dragStop()}
                        >
                          <div 
                            className="text-2xl mb-2"
                            dangerouslySetInnerHTML={{ __html: block.getMedia()! }}
                          />
                          <div className="text-xs text-center text-muted-foreground">
                            {block.getLabel()}
                          </div>
                        </div>
                      )
                )
            })}
          </div>
        </div>
      ))}
    </div>
  )
} 