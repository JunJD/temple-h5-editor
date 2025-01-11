import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Smartphone,
  X as Close,
  Target,
  Tag,
  Sparkles,
  Info
} from 'lucide-react'

export interface Props {
  property?: any
  label?: string
  empty?: boolean
  hasValue?: boolean
  shallow?: boolean
  row?: boolean
  tooltip?: React.ReactNode
  onClear?: () => void
  children?: React.ReactNode
  className?: string
}

export default function PropertyLabel({ 
  label,
  property,
  hasValue,
  empty,
  onClear,
  children,
  shallow,
  row,
  tooltip,
  className,
  ...rest
}: Props) {
  const labelStr = label || property?.getLabel()
  const parentTarget = property?.getParentTarget()
  const hasVal = hasValue || (!empty && property?.hasValue({ noParent: true }))
  const hasValP = !hasVal && property?.hasValue() && parentTarget
  const parentDevice = parentTarget?.getDevice()
  const parentState = parentTarget?.getState()
  const cmpFirst = parentTarget?.getComponent()
  const clear = () => onClear ? onClear() : property?.clear()

  return (
    <div className={cn(
      "w-full",
      row ? "flex items-center gap-2" : "flex flex-col gap-1",
      className
    )}>
      <div className={cn(
        "flex items-center gap-1.5",
        !row && "mb-1",
        hasVal && !shallow && "text-primary"
      )}>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <span className="text-sm font-medium">
          {empty ? <span>&nbsp;</span> : labelStr}
        </span>

        {hasValP && !shallow && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <div className="mb-1">Value inherited from</div>
                  {parentDevice && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <b>{parentDevice.getName()}</b>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {cmpFirst ? <Target className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                    <div>
                      <b>{cmpFirst ? 'Components' : 'Selectors'}</b>
                      <span className="text-xs opacity-75">
                        {parentTarget?.selectorsToString({ skipState: 1 })}
                      </span>
                    </div>
                  </div>
                  {parentState && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <b>{parentState.getLabel()}</b>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {hasVal && !shallow && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={clear}
                  className="hover:text-destructive"
                >
                  <Close className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Clear value
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  )
}