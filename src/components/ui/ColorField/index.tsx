import { useState, KeyboardEvent, useEffect } from "react"
import { cn, isDef } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { PopoverPicker } from "@/components/builder/sidebars/right/PopoverPicker"

export interface Props {
  className?: string
  value: string
  placeholder?: string
  label?: React.ReactNode
  size?: 'm' | 's'
  onChange?(value: string | null, partial?: boolean): void
}

const getValue = (value: string) => isDef(value) ? value : ''

export default function ColorField({
  className,
  value,
  label,
  size = 'm',
  placeholder,
  onChange,
}: Props) {
  const [stateValue, setStateValue] = useState(getValue(value))

  useEffect(() => {
    setStateValue(getValue(value))
  }, [value])

  const handleChange = (value: string | null, partial?: boolean) => {
    onChange?.(value, partial)
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <Label className={size === 's' ? 'text-xs' : 'text-sm'}>
          {label}
        </Label>
      )}
      <PopoverPicker
        color={stateValue}
        onChange={(color) => {
          setStateValue(color)
          handleChange(color)
        }}
      />
    </div>
  )
}