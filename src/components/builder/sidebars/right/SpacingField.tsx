'use client'

import { PropertyComposite } from 'grapesjs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GoX } from 'react-icons/go'

interface SpacingFieldProps {
  prop: PropertyComposite
  className?: string
}

export function SpacingField({ prop, className }: SpacingFieldProps) {
  const name = prop.getName()
  const props = prop.getProperties()
  const [top, right, bottom, left] = props
  const canClear = prop.canClear()
  const hasValue = prop.hasValue()

  const handleClear = () => {
    prop.clear()
  }

  const inputClasses = "h-6 w-16 text-xs bg-background border-border/50 focus:border-accent"

  return (
    <div className={cn("space-y-2 w-full rounded-md", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs font-medium text-foreground/70">{prop.getLabel()}</Label>
        {canClear && hasValue && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-4 hover:bg-accent/30"
            onClick={handleClear}
          >
            <GoX className="size-3" />
          </Button>
        )}
      </div>
      <div className="relative p-8 bg-card rounded-md border border-border/50">
        {/* 外边框 */}
        <div className="absolute inset-0 border border-dashed border-border/50 m-8 rounded-sm" />
        
        {/* 四个方向的输入框 */}
        <Input
          value={top.getValue()}
          onChange={e => top.setValue(e.target.value)}
          className={cn("absolute top-0 left-1/2 -translate-x-1/2", inputClasses)}
          placeholder="0"
        />
        <Input
          value={right.getValue()}
          onChange={e => right.setValue(e.target.value)}
          className={cn("absolute right-0 top-1/2 -translate-y-1/2", inputClasses)}
          placeholder="0"
        />
        <Input
          value={bottom.getValue()}
          onChange={e => bottom.setValue(e.target.value)}
          className={cn("absolute bottom-0 left-1/2 -translate-x-1/2", inputClasses)}
          placeholder="0"
        />
        <Input
          value={left.getValue()}
          onChange={e => left.setValue(e.target.value)}
          className={cn("absolute left-0 top-1/2 -translate-y-1/2", inputClasses)}
          placeholder="0"
        />
        
        {/* 中间显示名称 */}
        <div className="absolute inset-8 flex items-center justify-center text-xs text-muted-foreground/70 select-none">
          {name}
        </div>
      </div>
    </div>
  )
} 