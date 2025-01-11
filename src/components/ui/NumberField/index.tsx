import { useState, KeyboardEvent, useEffect } from "react"
import { cn, isDef } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { GripVertical } from "lucide-react"
import { panNumberValue } from "./utils"

export interface Props {
    className?: string
    value: string
    valueUnit?: string
    units?: string[]
    placeholder?: string
    pan?: React.ReactNode | boolean
    label?: React.ReactNode
    size?: 'm' | 's'
    onChange?(value: string | null, partial?: boolean): void
    onChangeUnit?(value: string | null): void
}

const getValue = (value: string) => isDef(value) ? value : ''

export const getMinMaxValue = ({ min, max, value }: {
  min?: string | number
  max?: string | number
  value: string | number
}) => {
  const nValue = parseFloat(`${value}`)
  let newValue = nValue || 0

  if (typeof min !== 'undefined') {
    newValue = Math.max(newValue, parseFloat(`${min}`) || 0)
  }

  if (typeof max !== 'undefined') {
    newValue = Math.min(newValue, parseFloat(`${max}`) || 0)
  }

  return `${`${nValue}` !== `${value}` ? value : newValue}`
}

export const getValueUpDown = ({ 
  value, 
  key, 
  shiftKey, 
  min, 
  max, 
  step = 1 
}: {
  value: string
  key: string
  shiftKey?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
}) => {
  const isUp = key === 'ArrowUp'
  const isDown = key === 'ArrowDown'
  let newValue: string | null = null

  if (isUp || isDown) {
    const numValue = Number(value)
    let tempValue = numValue
    if (isUp) tempValue += (shiftKey ? 10 : 1) * parseFloat(`${step}`)
    if (isDown) tempValue -= (shiftKey ? 10 : 1) * parseFloat(`${step}`)
    newValue = getMinMaxValue({ min, max, value: tempValue })
  }

  return newValue
}

export default function NumberField({
  className,
  value,
  units,
  valueUnit,
  label,
  size = 'm',
  pan = true,
  placeholder,
  onChange,
  onChangeUnit,
}: Props) {
  const [stateValue, setStateValue] = useState(getValue(value))
  const [panOverlay, setPanOverlay] = useState(false)
  const unitsOpts = units?.map(id => ({ id, label: id })) || []

  useEffect(() => {
    setStateValue(getValue(value))
  }, [value, valueUnit])

  const handleChange = (value: string | null, partial?: boolean) => {
    onChange?.(value, partial)
  }

  const onPanMouseDown: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    setPanOverlay(true)
    const update = (value: string, partial?: boolean) => {
      handleChange(value, !!partial)
      !partial && setPanOverlay(false)
    }
    panNumberValue(stateValue, evt.clientY, update, {})
  }

  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    const { key, shiftKey } = ev

    switch(key) {
      case 'Escape':
        return setStateValue(value)
      case 'Enter':
        return handleChange(stateValue)
    }

    const newValue = getValueUpDown({ value, key, shiftKey })

    if (newValue !== null) {
      ev.preventDefault()
      handleChange(newValue)
    }
  }

  const handleBlur = () => {
    handleChange(stateValue)
  }

  return (
    <div className={cn("relative flex items-center gap-1", className)}>
      {panOverlay && <div className="fixed inset-0 z-50 cursor-ns" />}
      
      {pan && (
        <div 
          onMouseDown={onPanMouseDown}
          className="cursor-ns opacity-50 hover:opacity-70"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <Input
        value={stateValue}
        onChange={ev => setStateValue(ev.target.value)}
        placeholder={placeholder}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-8",
          unitsOpts.length && "rounded-r-none border-r-0"
        )}
      />

      {!!unitsOpts.length && (
        <Select
          value={valueUnit}
          onValueChange={value => onChangeUnit?.(value)}
        >
          <SelectTrigger className={cn(
            "h-8 w-16 rounded-l-none border-l-0",
            unitsOpts.length === 1 && "opacity-50 pointer-events-none"
          )}>
            {valueUnit || '-'}
          </SelectTrigger>
          <SelectContent>
            {unitsOpts.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}