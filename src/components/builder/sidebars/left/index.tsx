'use client'

import { GoListUnordered, GoPackage } from 'react-icons/go'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BlocksProvider } from '@grapesjs/react'
import { CustomBlockManager } from './block-manager'
import { useState } from 'react'
import { LayerManager } from './layer-manager'

type TabType = 'blocks' | 'layers'

export const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState<TabType>('blocks')

  return (
    <TooltipProvider>
      <div className="flex h-full">
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
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 p-4">
          {activeTab === 'blocks' ? (
            <BlocksProvider>
              {(props) => <CustomBlockManager {...props} />}
            </BlocksProvider>
          ) : (
            <LayerManager />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
