'use client'

import { StylesProvider } from '@grapesjs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StyleField } from './style-field'

// 样式分组
const styleSections = {
  dimension: {
    name: '尺寸',
    properties: ['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height']
  },
  spacing: {
    name: '间距',
    properties: ['margin', 'padding']
  },
  typography: {
    name: '文字',
    properties: ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'text-align']
  },
  decorations: {
    name: '装饰',
    properties: ['background-color', 'border', 'border-radius', 'box-shadow']
  },
  layout: {
    name: '布局',
    properties: ['display', 'flex-direction', 'justify-content', 'align-items', 'gap']
  }
}

export function StyleManager() {
  return (
    <TabsContent value="styles">
      <StylesProvider>
        {({ sectors }) => (
          <Tabs defaultValue="dimension" className="w-full">
            <TabsList className="grid grid-cols-5">
              {Object.entries(styleSections).map(([key, section]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {section.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(styleSections).map(([key, section]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                {sectors?.map(sector => (
                  <div key={sector.getId()} className="space-y-4">
                    {sector.getProperties()
                      .filter(prop => section.properties.includes(prop.getName()))
                      .map(prop => (
                        <StyleField key={prop.getId()} prop={prop} />
                      ))}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </StylesProvider>
    </TabsContent>
  )
} 