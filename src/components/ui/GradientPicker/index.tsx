import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { PopoverPicker } from '@/components/builder/sidebars/right/PopoverPicker'
import { Button } from '@/components/ui/button'
import { GoX } from 'react-icons/go'

export interface Props {
  className?: string
  value: string
  onChange?(value: string, partial?: boolean): void
}

export type ColorStop = {
  color: string
  hint: number | null
}

export type Selection = {
  stop: ColorStop
  x: number
  y: number
  w: number
  h: number
}

const getImage = ({
  stops,
  angle = 90,
}: { 
  stops: ColorStop[]
  angle?: number 
}) => {
  const stopsArr = stops.length === 1 ? [
    { color: stops[0].color, hint: 0 },
    { color: stops[0].color, hint: 100 },
  ] : stops

  const colors = stopsArr
    .map(s => `${s.color} ${s.hint}%`)
    .join(', ')

  return colors ? `linear-gradient(${angle}deg, ${colors})` : 'none'
}

const sortStops = (stops: ColorStop[]) => {
  return stops.slice().sort((a, b) => (a.hint || 0) - (b.hint || 0))
}

export function GradientPicker({
  className,
  value,
  onChange,
}: Props) {
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#000000', hint: 0 },
    { color: '#ffffff', hint: 100 }
  ])
  const [select, setSelect] = useState<Selection | null>(null)
  const prvRef = useRef<HTMLDivElement>(null)
  const min = 0
  const max = 100

  const upStops = (stops: ColorStop[], partial = false) => {
    const newValue = sortStops(stops)
    setStops(newValue)
    onChange?.(getImage({ stops: newValue }), partial)
  }

  useEffect(() => {
    if (!select) return
    const posInit = select.stop.hint || 0

    const handleMove = (ev: PointerEvent) => {
      const delta = ev.clientX - select.x
      let pos = delta * 100
      pos = pos / select.w
      pos = posInit + pos
      pos = Math.min(Math.max(pos, min), max)
      select.stop.hint = Math.round(pos)
      upStops(stops, true)
    }

    const handleUp = () => {
      setSelect(null)
      upStops(stops)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [select]) // eslint-disable-line

  const selectStop = (ev: React.PointerEvent, stop: ColorStop) => {
    const el = prvRef.current
    if (!el) return
    setSelect({
      stop,
      w: el.clientWidth,
      h: el.clientHeight,
      x: ev.clientX,
      y: ev.clientY,
    })
  }

  const addStop = (ev: React.MouseEvent) => {
    const el = prvRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ev.clientX - rect.left
    const hint = Math.round((x / rect.width) * 100)
    upStops([...stops, { color: '#000000', hint }])
  }

  const removeStop = (stop: ColorStop) => {
    if (stops.length <= 2) return
    upStops(stops.filter(s => s !== stop))
  }

  const updateColor = (stop: ColorStop, value: string) => {
    stop.color = value
    upStops(stops)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-8" ref={prvRef}>
        <div 
          className="absolute inset-0 rounded-md cursor-pointer"
          style={{ backgroundImage: getImage({ stops }) }}
          onClick={addStop}
        />
        {stops.map((stop, i) => (
          <div 
            key={i} 
            className="absolute top-0 h-full" 
            style={{ left: `${stop.hint}%` }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -translate-x-1/2 -top-2 h-4 w-4"
              onClick={() => removeStop(stop)}
            >
              <GoX className="h-3 w-3" />
            </Button>
            <div
              onPointerDown={(ev) => selectStop(ev, stop)}
              className={cn(
                "h-full w-1 -translate-x-1/2 cursor-pointer",
                select?.stop === stop ? "bg-primary" : "bg-muted-foreground"
              )}
            />
            <div className="absolute -translate-x-1/2 -bottom-6">
              <PopoverPicker
                color={stop.color}
                onChange={color => updateColor(stop, color)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}