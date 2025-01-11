'use client'

import { StylesProvider } from '@grapesjs/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StyleManagerContent } from './StyleManagerContent'

export function StyleManager() {
  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <StylesProvider>
        {(props) => <StyleManagerContent {...props} />}
      </StylesProvider>
    </ScrollArea>
  )
} 