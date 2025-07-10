'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GoOrganization, GoStack, GoDatabase } from 'react-icons/go'
import { CustomBlockManager } from './block-manager'
import { LayerManager } from './layer-manager'
import { ImageLibrary } from './image-library'
import { AudioLibrary } from './audio-library'
import { BlocksProvider } from '@grapesjs/react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type TabType = 'blocks' | 'layers' | 'assets'

export const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState<TabType>('blocks')

  return (
    <TooltipProvider>
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex flex-col items-center justify-between border-r bg-background p-2">
          <div className="space-y-2 flex flex-col items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTab === 'blocks' ? 'default' : 'ghost'}
                  className="size-8 rounded-full"
                  onClick={() => setActiveTab('blocks')}
                >
                  <GoOrganization size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">组件</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTab === 'layers' ? 'default' : 'ghost'}
                  className="size-8 rounded-full"
                  onClick={() => setActiveTab('layers')}
                >
                  <GoStack size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">图层</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTab === 'assets' ? 'default' : 'ghost'}
                  className="size-8 rounded-full"
                  onClick={() => setActiveTab('assets')}
                >
                  <GoDatabase size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">资源库</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-background p-4">
          {activeTab === 'blocks' ? (
            <BlocksProvider>
              {(props) => <CustomBlockManager {...props} />}
            </BlocksProvider>
          ) : activeTab === 'layers' ? (
            <LayerManager />
          ) : activeTab === 'assets' ? (
            <Tabs defaultValue="image" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image">图片</TabsTrigger>
                <TabsTrigger value="audio">音频</TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="flex-1 overflow-y-auto pt-4">
                <ImageLibrary />
              </TabsContent>
              <TabsContent value="audio" className="flex-1 overflow-y-auto pt-4">
                <AudioLibrary />
              </TabsContent>
            </Tabs>
          ) : (
            <div>Unknown view</div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
