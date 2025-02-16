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
import { Rotate3dIcon, Music2Icon } from 'lucide-react'
import { Button, Separator } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { Fragment, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { IconType } from 'react-icons'
import { RxBorderNone } from "react-icons/rx";
import { BsEyeFill } from "react-icons/bs";
import { HiOutlineCodeBracketSquare } from "react-icons/hi2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ToolbarButton {
  id: string
  icon: IconType | any  // 支持 lucide 图标
  tooltip: string
  command?: string
  options?: Record<string, any>  // 添加 options 类型
  onClick?: () => void
  isActive?: () => boolean
  disabled?: () => boolean
}

interface ToolbarButtonGroup {
  id: string
  buttons: ToolbarButton[]
}

export const BuilderToolbar = () => {
  const editor = useEditorMaybe();
  const [, setUpdateCounter] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toolbarGroups: ToolbarButtonGroup[] = [
    {
      id: 'history',
      buttons: [
        {
          id: 'undo',
          icon: GoArrowLeft,
          tooltip: '撤销',
          command: 'core:undo'
        },
        {
          id: 'redo',
          icon: GoArrowRight,
          tooltip: '重做',
          command: 'core:redo'
        },
      ]
    },
    {
      id: 'canvas',
      buttons: [
        {
          id: 'zoom-in',
          icon: GoZoomIn,
          tooltip: '放大',
          onClick: () => {
            const zoom = editor?.Canvas.getZoom() || 1;
            editor?.Canvas.setZoom(zoom + 30);
          }
        },
        {
          id: 'zoom-out',
          icon: GoZoomOut,
          tooltip: '缩小',
          onClick: () => {
            const zoom = editor?.Canvas.getZoom() || 1;
            editor?.Canvas.setZoom(zoom - 30);
          }
        },
        {
          id: 'reset-zoom',
          icon: GoClock,
          tooltip: '清空画布',
          onClick: () => {            
            setShowClearConfirm(true);
          }
        },
        {
          id: 'center-canvas',
          icon: GoScreenFull,
          tooltip: '居中画布',
          onClick: () => {
            // 重置缩放和位置
            editor?.Canvas.setZoom(100);
            editor?.Canvas.setCoords(0, 0);
          }
        },
      ]
    },
    {
      id: 'view',
      buttons: [
        {
          id: 'outline',
          icon: RxBorderNone,
          tooltip: '组件轮廓',
          command: 'core:component-outline',
          isActive: () => editor?.Commands.isActive('core:component-outline') ?? false
        },
        {
          id: 'preview',
          icon: BsEyeFill,
          tooltip: '预览',
          command: 'core:preview',
          options: { target: '#root' },
          isActive: () => editor?.Commands.isActive('core:preview') ?? false
        },
        {
          id: 'code',
          icon: HiOutlineCodeBracketSquare,
          tooltip: '查看代码',
          command: 'core:open-code',
          isActive: () => editor?.Commands.isActive('core:open-code') ?? false
        },
      ]
    },
    {
      id: 'config',
      buttons: [
        {
          id: 'copy-link',
          icon: GoLink,
          tooltip: '复制链接',
          onClick: async () => {
            await navigator.clipboard.writeText(window.location.href);
          }
        },
        {
          id: 'form-config',
          icon: GoListUnordered,
          tooltip: '表单配置',
          command: 'configurable-form'
        },
        {
          id: 'payment-config',
          icon: GoGear,
          tooltip: '支付配置',
          command: 'payment-config'
        },
        {
          id: 'audio-config',
          icon: Music2Icon,
          tooltip: '背景音乐',
          command: 'audio-config'
        },
      ]
    },
    {
      id: 'transform',
      buttons: [
        {
          id: 'transform',
          icon: Rotate3dIcon,
          tooltip: '自由变换',
          isActive: () => {
            const selected = editor?.getSelected();
            return selected?.getDragMode() === 'absolute';
          },
          onClick: () => {
            const selected = editor?.getSelected();
            const isAbsolute = selected?.getDragMode() === 'absolute';
            selected?.setDragMode(isAbsolute ? '' : 'absolute');
          }
        },
      ]
    },
  ];

  useEffect(() => {
    if (!editor) return;
    
    const cmdEvent = 'run stop';
    const updateEvent = 'update';
    const updateCounter = () => setUpdateCounter(v => v + 1);
    
    editor.on(cmdEvent, updateCounter);
    editor.on(updateEvent, updateCounter);

    return () => {
      editor.off(cmdEvent, updateCounter);
      editor.off(updateEvent, updateCounter);
    };
  }, [editor]);

  const handleClick = (button: ToolbarButton) => {
    if (button.onClick) {
      button.onClick();
    } else if (button.command && editor) {
      const isActive = editor.Commands.isActive(button.command);
      isActive
        ? editor.Commands.stop(button.command)
        : editor.Commands.run(button.command, button.options);
    }
  };

  const handleClear = () => {
    editor?.runCommand('core:canvas-clear');
    setShowClearConfirm(false);
  };

  return (
    <>
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空画布？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将清空画布上的所有内容，且无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>确认清空</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TooltipProvider>
        <motion.div className="z-50 fixed bottom-0 left-1/2 -translate-x-1/2 hidden py-6 text-center md:block">
          <div className="inline-flex items-center justify-center rounded-full bg-background px-4 shadow-xl">
            {toolbarGroups.map((group, groupIndex) => (
              <Fragment key={group.id}>
                {groupIndex > 0 && <Separator orientation="vertical" className="h-9" />}
                {group.buttons.map((button) => (
                  <Tooltip key={button.id}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "rounded-none",
                          button.isActive?.() && "bg-accent"
                        )}
                        onClick={() => handleClick(button)}
                        disabled={button.disabled?.()}
                      >
                        <button.icon className={button.isActive?.() ? 'text-primary' : ''} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{button.tooltip}</TooltipContent>
                  </Tooltip>
                ))}
              </Fragment>
            ))}
          </div>
        </motion.div>
      </TooltipProvider>
    </>
  );
};
