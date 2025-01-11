import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type Option = {
  id: string
  label: React.ReactNode
  title?: React.ReactNode
}

export interface Props {
  className?: string
  value: Option["id"]
  options: Option[]
  size?: 'm' | 's' | 'xs'
  onChange(value: Option["id"]): void
}

export default function ButtonGroupField({
  className,
  options,
  value,
  size = 'm',
  onChange,
}: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onChange}
      className={cn(
        "flex w-full",
        className
      )}
    >
      {options.map(({ id, label, title }) => (
        <TooltipProvider key={id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={id}
                className={cn(
                  "flex-1 data-[state=on]:bg-accent",
                  size === 'm' && "px-4 py-2",
                  size === 's' && "px-2 py-1.5",
                  size === 'xs' && "px-2 py-1",
                )}
              >
                <div className="flex justify-center">
                  {label}
                </div>
              </ToggleGroupItem>
            </TooltipTrigger>
            {title && (
              <TooltipContent>
                {title}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}
    </ToggleGroup>
  )
} 