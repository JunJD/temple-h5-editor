'use client'

import { useEditor } from '@grapesjs/react'
import type { 
  Property, 
  PropertyStack, 
  PropertyComposite, 
  PropertySelect,
  PropertyNumber,
  PropertyRadio
} from 'grapesjs'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { GoChevronUp, GoChevronDown, GoPlus, GoX } from 'react-icons/go'
import { PopoverPicker } from './PopoverPicker'
import { SpacingField } from './SpacingField'

interface StyleFieldProps {
  prop: Property
  className?: string
}

const fontSizeOptions = [
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 24, label: '24px' },
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
  { value: 36, label: '36px' },
  { value: 48, label: '48px' },
]

const letterSpacingOptions = [
  { value: '0', label: 'Normal' },
  { value: -0.05, label: 'Tight' },
  { value: 0.05, label: 'Wide' },
  { value: 0.1, label: 'Wider' },
  { value: 0.2, label: 'Widest' },
]

export function StyleField({ prop, className }: StyleFieldProps) {
  const editor = useEditor()
  const type = prop.getType()
  const value = prop.getValue()
  const defValue = prop.getDefaultValue()
  const canClear = prop.canClear()
  const hasValue = prop.hasValue()

  const handleClear = () => {
    prop.clear()
  }

  const renderLabel = () => (
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
  )

  const commonFieldClasses = "bg-card border-border/50 rounded-md"
  const commonInputClasses = "h-8 text-xs bg-background border-border/50 focus:border-accent"

  const handleUnitInput = (value: string) => {
    if (!value) {
      prop.clear()
      return
    }
    prop.setValue(value)
  }

  const needsUnit = ['font-size', 'letter-spacing', 'line-height'].includes(prop.getName())

  switch (type) {
    case 'composite':
      const compositeProp = prop as PropertyComposite
      const name = compositeProp.getName()
      
      if (name === 'margin' || name === 'padding') {
        return <SpacingField prop={compositeProp} className={className} />
      }

      return (
        <div className={cn("space-y-2 w-full", className)}>
          {renderLabel()}
          <div className="space-y-2 p-2 bg-muted/50 rounded-md">
            {compositeProp.getProperties().map((p) => (
              <StyleField key={p.getId()} prop={p} />
            ))}
          </div>
        </div>
      )

    case 'stack':
      const stackProp = prop as PropertyStack
      const layers = stackProp.getLayers()
      
      return (
        <div className={cn("space-y-2 w-full", className)}>
          <div className="flex items-center justify-between">
            {renderLabel()}
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs hover:bg-accent/30 border-border/50"
              onClick={() => stackProp.addLayer({}, { at: 0 })}
            >
              <GoPlus className="size-3 mr-1" />
              添加
            </Button>
          </div>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div 
                key={layer.getId()} 
                className={cn("border rounded-md overflow-hidden", commonFieldClasses)}
              >
                <div className="flex items-center gap-1 p-1.5 bg-muted/30">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="size-6 hover:bg-accent/30"
                    onClick={() => layer.move(layer.getIndex() - 1)}
                  >
                    <GoChevronUp className="size-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="size-6 hover:bg-accent/30"
                    onClick={() => layer.move(layer.getIndex() + 1)}
                  >
                    <GoChevronDown className="size-3" />
                  </Button>
                  <button 
                    className="flex-grow text-xs text-left px-1 hover:text-accent"
                    onClick={() => layer.select()}
                  >
                    {layer.getLabel()}
                  </button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="size-6 hover:bg-accent/30"
                    onClick={() => layer.remove()}
                  >
                    <GoX className="size-3" />
                  </Button>
                </div>
                {layer.isSelected() && (
                  <div className="p-2 space-y-2 bg-background/50">
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
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <Select value={value} onValueChange={v => prop.setValue(v)}>
            <SelectTrigger className={cn("h-8", commonInputClasses)}>
              <SelectValue placeholder={defValue} />
            </SelectTrigger>
            <SelectContent className={commonFieldClasses}>
              {selectProp.getOptions().map(opt => (
                <SelectItem 
                  key={selectProp.getOptionId(opt)} 
                  value={selectProp.getOptionId(opt)}
                  className="text-xs hover:bg-accent/30"
                >
                  {selectProp.getOptionLabel(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'radio':
      const radioProp = prop as PropertyRadio
      return (
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <div className={cn("p-2", commonFieldClasses)}>
            <RadioGroup 
              value={value} 
              onValueChange={v => prop.setValue(v)}
              className="flex gap-3"
            >
              {radioProp.getOptions().map(opt => (
                <div className="flex items-center space-x-1" key={radioProp.getOptionId(opt)}>
                  <RadioGroupItem 
                    value={radioProp.getOptionId(opt)} 
                    id={radioProp.getOptionId(opt)}
                    className="size-3 border-border/50"
                  />
                  <Label 
                    htmlFor={radioProp.getOptionId(opt)}
                    className="text-xs text-foreground/70"
                  >
                    {radioProp.getOptionLabel(opt)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )

    case 'color':
      return (
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <PopoverPicker
            color={value || defValue}
            onChange={v => prop.setValue(v)}
          />
        </div>
      )

    case 'slider':
      const numberProp = prop as PropertyNumber
      return (
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <div className={cn("flex items-center gap-3 p-2", commonFieldClasses)}>
            <Slider
              value={[Number(value) || 0]}
              min={numberProp.getMin()}
              max={numberProp.getMax()}
              step={numberProp.getStep()}
              className="flex-1"
              onValueChange={([v]) => prop.setValue(v.toString())}
            />
            <Input
              type="number"
              value={value}
              className={cn("w-16", commonInputClasses)}
              onChange={e => prop.setValue(e.target.value)}
              min={numberProp.getMin()}
              max={numberProp.getMax()}
              step={numberProp.getStep()}
            />
          </div>
        </div>
      )

    case 'file':
      return (
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <div className={cn("p-2 space-y-2", commonFieldClasses)}>
            {value && (
              <div 
                className="w-full h-20 bg-cover bg-center bg-no-repeat rounded-md border border-border/50"
                style={{ backgroundImage: `url(${value})` }}
              />
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs hover:bg-accent/30 border-border/50"
              onClick={() => {
                editor.Assets.open({
                  select: (asset, complete) => {
                    prop.setValue(asset.getSrc())
                    complete && editor.Assets.close()
                  },
                  types: ['image'],
                  accept: 'image/*',
                })
              }}
            >
              选择图片
            </Button>
          </div>
        </div>
      )

    default:
      if (prop.getName() === 'font-size') {
        const selectedOption = fontSizeOptions.find(opt => opt.value === value) ?? fontSizeOptions[0]
        return (
          <div className={cn("space-y-2", className)}>
            {renderLabel()}
            <Select 
              value={value || ''} 
              onValueChange={v => prop.setValue(v)}
            >
              <SelectTrigger className={cn("h-8", commonInputClasses)}>
                <SelectValue placeholder="选择字号">
                  {selectedOption?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map(opt => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value.toString()}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      if (prop.getName() === 'letter-spacing') {
        const selectedOption = letterSpacingOptions.find(opt => opt.value === value) ?? letterSpacingOptions[0]
        console.log('selectedOption', selectedOption)
        return (
          <div className={cn("space-y-2", className)}>
            {renderLabel()}
            <Select 
              value={value || ''} 
              onValueChange={v => prop.setValue(v)}
            >
              <SelectTrigger className={cn("h-8", commonInputClasses)}>
                <SelectValue placeholder="选择字间距">
                  {selectedOption?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {letterSpacingOptions.map(opt => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value.toString()}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      return (
        <div className={cn("space-y-2", className)}>
          {renderLabel()}
          <Input
            value={value || ''}
            onChange={e => prop.setValue(e.target.value)}
            className={commonInputClasses}
            placeholder={defValue}
          />
        </div>
      )
  }
} 