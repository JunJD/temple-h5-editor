'use client'

import { GoListUnordered, GoPackage, GoImage } from 'react-icons/go'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BlocksProvider } from '@grapesjs/react'
import { CustomBlockManager } from './block-manager'
import { useState } from 'react'
import { LayerManager } from './layer-manager'
import { ImageLibrary } from './image-library'

type TabType = 'blocks' | 'layers' | 'images'

export const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState<TabType>('blocks')

  return (
    <TooltipProvider>
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* 左侧Tab切换 */}
        <div className="basis-12 flex flex-col items-center py-4 bg-secondary/30">
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTab === 'blocks' ? 'default' : 'ghost'}
                  className="size-8 rounded-full"
                  onClick={() => setActiveTab('blocks')}
                >
                  <GoPackage size={14} />
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
                  <GoListUnordered size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">大纲树</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTab === 'images' ? 'default' : 'ghost'}
                  className="size-8 rounded-full"
                  onClick={() => setActiveTab('images')}
                >
                  <GoImage size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">图片库</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 p-4">
          {activeTab === 'blocks' ? (
            <BlocksProvider>
              {(props) => <CustomBlockManager {...props} />}
            </BlocksProvider>
          ) : activeTab === 'layers' ? (
            <LayerManager />
          ) : (
            <ImageLibrary />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
