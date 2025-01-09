'use client'

import { TraitsProvider, StylesProvider } from '@grapesjs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TraitField } from './trait-field'
import { StyleManager } from './style-manager'

export function RightSidebar() {
  return (
    <div className="h-full flex flex-col p-4">
      <Tabs defaultValue="styles">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="styles">样式</TabsTrigger>
          <TabsTrigger value="traits">属性</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traits">
          <TraitsProvider>
            {({ traits }) => (
              <div className="space-y-4">
                {traits?.length ? (
                  traits.map((trait) => (
                    <TraitField key={trait.getId()} trait={trait} />
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    请选择一个组件
                  </div>
                )}
              </div>
            )}
          </TraitsProvider>
        </TabsContent>
        <TabsContent value="styles" className="h-full">
          <StyleManager/>
        </TabsContent>
      </Tabs>
    </div>
  )
} 