'use client'

import { useEditor } from '@grapesjs/react'
import type { Property, PropertyStack, PropertyComposite, PropertySelect } from 'grapesjs'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { GoChevronUp, GoChevronDown, GoPlus, GoX } from 'react-icons/go'

interface StyleFieldProps {
  prop: Property
}

export function StyleField({ prop }: StyleFieldProps) {
  const editor = useEditor()
  const type = prop.getType()
  const value = prop.getValue()
  const canClear = prop.canClear()

  switch (type) {
    case 'composite':
      return (
        <div className="space-y-2 w-full">
          <Label>{prop.getLabel()}</Label>
          <div className="space-y-2 p-2 bg-muted rounded-md">
            {(prop as PropertyComposite).getProperties().map((p) => (
              <StyleField key={p.getId()} prop={p} />
            ))}
          </div>
        </div>
      )

    case 'stack':
      const stackProp = prop as PropertyStack
      const layers = stackProp.getLayers()
      
      return (
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between">
            <Label>{prop.getLabel()}</Label>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => stackProp.addLayer({}, { at: 0 })}
            >
              <GoPlus className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div 
                key={layer.getId()} 
                className="border rounded-md overflow-hidden"
              >
                <div className="flex items-center gap-2 p-2 bg-muted">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => layer.move(layer.getIndex() - 1)}
                  >
                    <GoChevronUp className="size-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => layer.move(layer.getIndex() + 1)}
                  >
                    <GoChevronDown className="size-4" />
                  </Button>
                  <span 
                    className="flex-grow cursor-pointer"
                    onClick={() => layer.select()}
                  >
                    {layer.getLabel()}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => layer.remove()}
                  >
                    <GoX className="size-4" />
                  </Button>
                </div>
                {layer.isSelected() && (
                  <div className="p-2 space-y-2">
                    {stackProp.getProperties().map((p) => (
                      <StyleField key={p.getId()} prop={p} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )

    case 'select':
      const selectProp = prop as PropertySelect
      return (
        <div className="space-y-2">
          <Label>{prop.getLabel()}</Label>
          <Select 
            value={value} 
            onValueChange={v => prop.setValue(v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectProp.getOptions().map(opt => (
                <SelectItem key={selectProp.getOptionId(opt)} value={selectProp.getOptionId(opt)}>
                  {selectProp.getOptionLabel(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'slider':
      return (
        <div className="space-y-2">
          <Label>{prop.getLabel()}</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[Number(value) || 0]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => prop.setValue(v.toString())}
            />
            <Input
              type="number"
              value={value}
              className="w-20"
              onChange={e => prop.setValue(e.target.value)}
            />
          </div>
        </div>
      )

    default:
      return (
        <div className="space-y-2">
          <Label>{prop.getLabel()}</Label>
          <Input
            value={value}
            onChange={e => prop.setValue(e.target.value)}
          />
        </div>
      )
  }
} 