'use client'

import { 
  GoZoomIn,
  GoZoomOut,
  GoClock,
  GoScreenFull,
  GoArrowLeft,
  GoArrowRight,
  GoLink,
  GoGear,
  GoListUnordered,
  GoEye
} from 'react-icons/go'
import { Button, Separator } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

const noop = () => {}

export const BuilderToolbar = () => {
  return (
    <TooltipProvider>
      <motion.div className="fixed inset-x-0 bottom-0 mx-auto hidden py-6 text-center md:block">
        <div className="inline-flex items-center justify-center rounded-full bg-background px-4 shadow-xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none"
                onClick={noop}
              >
                <GoArrowLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>撤销</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none"
                onClick={noop}
              >
                <GoArrowRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重做</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoZoomIn />
              </Button>
            </TooltipTrigger>
            <TooltipContent>放大</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoZoomOut />
              </Button>
            </TooltipTrigger>
            <TooltipContent>缩小</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoClock />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重置缩放</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoScreenFull />
              </Button>
            </TooltipTrigger>
            <TooltipContent>居中画布</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoEye />
              </Button>
            </TooltipTrigger>
            <TooltipContent>预览</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoLink />
              </Button>
            </TooltipTrigger>
            <TooltipContent>复制链接</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoListUnordered />
              </Button>
            </TooltipTrigger>
            <TooltipContent>表单配置</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-none" onClick={noop}>
                <GoGear />
              </Button>
            </TooltipTrigger>
            <TooltipContent>支付配置</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
