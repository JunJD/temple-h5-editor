'use client'

import { useEditorMaybe } from '@grapesjs/react';
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
  GoEye,
} from 'react-icons/go'
import { GridIcon, Rotate3dIcon } from 'lucide-react'
import { Button, Separator } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export const BuilderToolbar = () => {
  const editor = useEditorMaybe();
  const [rulerVisible, setRulerVisible] = useState(false);
  const [guidesVisible, setGuidesVisible] = useState(false);
  const [transformVisible, setTransformVisible] = useState(false);

  // 命令处理函数
  const handleCommand = (command: string) => () => {
    editor?.runCommand(command);
  };

  // 缩放处理函数
  const handleZoom = (delta: number) => () => {
    const zoom = editor?.Canvas.getZoom() || 1;
    editor?.Canvas.setZoom(zoom + delta);
  };

  // 复制链接
  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    // TODO: 添加提示
  };

  // 处理标尺显示/隐藏
  const handleToggleRuler = () => {
    if (rulerVisible) {
      editor?.runCommand('ruler-visibility:stop');
    } else {
      editor?.runCommand('ruler-visibility');
    }
    setRulerVisible(!rulerVisible);
  };
  
  const handleToggleGuides = () => {
    if (guidesVisible) {
      editor?.runCommand('guides-disable');
    } else {
      editor?.runCommand('guides-enable');
    }
    setGuidesVisible(!guidesVisible);
  };

  // 处理自由变换开关
  const handleToggleTransform = () => {
    if (transformVisible) {
      editor?.setDragMode('translate');
    } else {
      editor?.setDragMode('absolute');
    }
    setTransformVisible(!transformVisible);
  };

  return (
    <TooltipProvider>
      <motion.div className="z-50 fixed inset-x-0 bottom-0 mx-auto hidden py-6 text-center md:block">
        <div className="inline-flex items-center justify-center rounded-full bg-background px-4 shadow-xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none"
                onClick={handleCommand('core:undo')}
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
                onClick={handleCommand('core:redo')}
              >
                <GoArrowRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重做</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleZoom(30)}
              >
                <GoZoomIn />
              </Button>
            </TooltipTrigger>
            <TooltipContent>放大</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleZoom(-30)}
              >
                <GoZoomOut />
              </Button>
            </TooltipTrigger>
            <TooltipContent>缩小</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCommand('core:canvas-clear')}
              >
                <GoClock />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重置缩放</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCommand('core:canvas-center')}
              >
                <GoScreenFull />
              </Button>
            </TooltipTrigger>
            <TooltipContent>居中画布</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCommand('core:preview')}
              >
                <GoEye />
              </Button>
            </TooltipTrigger>
            <TooltipContent>预览</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCopyLink}
              >
                <GoLink />
              </Button>
            </TooltipTrigger>
            <TooltipContent>复制链接</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCommand('form-config')}
              >
                <GoListUnordered />
              </Button>
            </TooltipTrigger>
            <TooltipContent>表单配置</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-none"
                onClick={handleCommand('payment-config')}
              >
                <GoGear />
              </Button>
            </TooltipTrigger>
            <TooltipContent>支付配置</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "rounded-none",
                  guidesVisible && "bg-accent"
                )}
                onClick={handleToggleGuides}
              >
                <GridIcon className={guidesVisible ? 'text-primary' : ''} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {guidesVisible ? '关闭参考线' : '开启参考线'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "rounded-none",
                  transformVisible && "bg-accent"
                )}
                onClick={handleToggleTransform}
              >
                <Rotate3dIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>自由变换</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
