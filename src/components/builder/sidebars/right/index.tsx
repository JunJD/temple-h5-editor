'use client'

import { TraitsProvider } from '@grapesjs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TraitField } from './trait-field'
import { StyleManager } from './style-manager'
import { SelectorsManager } from './selector-manager'
import { ScrollArea } from '@/components/ui'

export function RightSidebar() {
  return (
    <div className="h-full flex flex-col p-4">
      <Tabs defaultValue="styles">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="styles">样式</TabsTrigger>
          <TabsTrigger value="traits">属性</TabsTrigger>
        </TabsList>

        <TabsContent value="traits">
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <TraitsProvider>
              {({ traits }) => (
                <div className="space-y-4">
                  {traits?.length ? (
                    traits.map((trait) => (
                      <TraitField key={trait.cid} trait={trait} />
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      请选择一个组件
                    </div>
                  )}
                </div>
              )}
            </TraitsProvider>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="styles" className="h-full">
          <div className='h-full'>
            <div>
              <SelectorsManager />
            </div>
            <div>
              <StyleManager />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 