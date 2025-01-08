'use client'

import { Panel, PanelGroup, PanelResizeHandle } from "@/components/ui/resizable-panel"
import { BuilderToolbar } from "@/components/builder/toolbar"
import { BuilderHeader } from "@/components/builder/builder-header"
import { cn } from "@/lib/utils"
import { useBuilderStore } from "@/store/builder"
import { LeftSidebar } from "@/components/builder/sidebars/left"
import CenterArea from "@/components/builder/editor/center"
import { RightSidebar } from '@/components/builder/sidebars/right'

const OutletSlot = ({ children }: { children: React.ReactNode }) => (
  <>
    <BuilderHeader />
    <div className="relative size-full overflow-hidden mt-16">
      {children}
    </div>
    <BuilderToolbar />
  </>
)

export default function EditIssuePage() {
  const leftSetSize = useBuilderStore((state) => state.panel.left.setSize)
  const rightSetSize = useBuilderStore((state) => state.panel.right.setSize)
  const leftHandle = useBuilderStore((state) => state.panel.left.handle)
  const rightHandle = useBuilderStore((state) => state.panel.right.handle)

  return (
      <div className="relative size-full overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* 左侧组件面板 */}
          <Panel
            minSize={25}
            maxSize={55}
            defaultSize={35}
            className={cn(
              "z-10 bg-background mt-16",
              !leftHandle.isDragging && "transition-[flex]"
            )}
            onResize={leftSetSize}
          >
            <LeftSidebar />
          </Panel>

          <PanelResizeHandle
            isDragging={leftHandle.isDragging}
            onDragging={leftHandle.setDragging}
          />

          {/* 中间画布 */}
          <Panel className="flex-1">
            <OutletSlot>
              <CenterArea />
            </OutletSlot>
          </Panel>

          <PanelResizeHandle
            isDragging={rightHandle.isDragging}
            onDragging={rightHandle.setDragging}
          />

          {/* 右侧属性面板 */}
          <Panel
            minSize={25}
            maxSize={40}
            defaultSize={25}
            className={cn(
              "z-10 bg-background mt-16",
              !rightHandle.isDragging && "transition-[flex]"
            )}
            onResize={rightSetSize}
          >
            {/* 右侧属性面板 */}
            <RightSidebar />
          </Panel>
        </PanelGroup>
      </div>
  )
}