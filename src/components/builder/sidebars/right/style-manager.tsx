'use client'

import { StylesProvider, StylesResultProps } from '@grapesjs/react'
import { StyleField } from './style-field'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

function StyleManagerContent({ sectors }: StylesResultProps) {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set())

  const togglePanel = (sectorId: string) => {
    setOpenPanels(prev => {
      const next = new Set(prev)
      if (next.has(sectorId)) {
        next.delete(sectorId)
      } else {
        next.add(sectorId)
      }
      return next
    })
  }

  return (
    <div className="space-y-1 p-1">
      {sectors.map(sector => {
        const properties = sector.getProperties()
        if (properties.length === 0) return null

        const isOpen = openPanels.has(sector.getId())

        return (
          <div key={sector.getId()} className="border-b border-border/50">
            <button
              className={cn(
                "w-full px-2 py-1.5 text-sm text-left",
                "hover:bg-accent/50 transition-colors",
                "flex items-center justify-between",
                isOpen && "bg-accent/30"
              )}
              onClick={() => togglePanel(sector.getId())}
            >
              {sector.getName()}
              <span className={cn(
                "transition-transform",
                isOpen && "rotate-180"
              )}>
                ▼
              </span>
            </button>
            <div className={cn(
              "grid transition-all",
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}>
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-3 p-3">
                  {properties.map(prop => (
                    <div
                      key={prop.getId()}
                      className={cn(
                        prop.isFull() ? 'w-full' : 'w-[calc(50%-0.375rem)]',
                        'min-w-[120px]'
                      )}
                    >
                      <StyleField prop={prop} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function StyleManager() {
  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <StylesProvider>
        {(props) => <StyleManagerContent {...props} />}
      </StylesProvider>
    </ScrollArea>
  )
} 