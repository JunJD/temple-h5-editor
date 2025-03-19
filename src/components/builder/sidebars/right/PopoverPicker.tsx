'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sketch } from '@uiw/react-color'

interface PopoverPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function PopoverPicker({ color, onChange, className }: PopoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const [currentColor, setCurrentColor] = useState(color)
  
  const popover = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((color: { hex: string }) => {
    setCurrentColor(color.hex)
    // onChange(color.hex)
  }, [onChange])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onChange(currentColor)
    }
    setIsOpen(open)
  }, [setIsOpen, currentColor, handleChange])

  return (
    <div ref={popover} className={cn("flex gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange} >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="size-8 p-0 border-2"
            style={{ 
              backgroundColor: currentColor || '#000000',
              borderColor: currentColor ? undefined : 'transparent'
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Sketch
            color={currentColor || '#000000'}
            onChange={handleChange}
            disableAlpha={true}
            style={{ width: '200px' }}
          />
        </PopoverContent>
      </Popover>
      <Input
        value={currentColor}
        onChange={e => {
          setCurrentColor(e.target.value)
          onChange(e.target.value)
        }}
        className="h-8 flex-1"
        placeholder="#000000"
      />
    </div>
  )
} 