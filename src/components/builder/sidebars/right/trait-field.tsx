'use client'

import { useEditor } from '@grapesjs/react'
import { useEffect, useState } from 'react'
import type { Trait } from 'grapesjs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { PopoverPicker } from './PopoverPicker'
import { RichInput } from '@/components/ui/rich-input'
import { OptionsManager } from './OptionsManager'

interface TraitFieldProps {
  trait: Trait
}

export function TraitField({ trait }: TraitFieldProps) {
  const editor = useEditor()
  const [disabled, setDisabled] = useState(trait.get('attributes')?.disabled)
  const [visible, setVisible] = useState(trait.get('attributes')?.visible !== false)

  useEffect(() => {
    // 使用 trait:value 事件来监听值变化
    const onTraitValue = ({ trait: changedTrait }: { trait: Trait }) => {
      if (changedTrait.getId() === trait.getId()) {
        setDisabled(trait.get('attributes')?.disabled)
        setVisible(trait.get('attributes')?.visible !== false)
      }
    }

    editor.on('trait:value', onTraitValue)
    return () => { editor.off('trait:value', onTraitValue) }
  }, [editor, trait])

  const handleChange = (value: string | number) => {
    trait.setValue(value)
  }

  const type = trait.getType()
  const value = trait.getValue()
  const defaultValue = trait.getDefault()

  if (!visible) return null

  switch (type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <Input
            defaultValue={value}
            placeholder={defaultValue}
            className='border-input focus-visible:ring-1 focus-visible:ring-offset-0'
            disabled={disabled}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
                handleChange(target.value);
            }}
          />
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <Select
            value={value}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trait.getOptions().map((option) => (
                <SelectItem
                  key={trait.getOptionId(option)}
                  value={trait.getOptionId(option)}
                >
                  {trait.getOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={trait.getId() as string}
            checked={value}
            disabled={disabled}
            onCheckedChange={(checked) => trait.setValue(checked)}
          />
          <Label htmlFor={trait.getId() as string}>{trait.getLabel()}</Label>
        </div>
      )

    case 'button':
      return (
        <Button
          className="w-full"
          onClick={() => {
            const command = trait.get('command')
            if (command) {
              typeof command === 'string'
                ? editor.runCommand(command)
                : command(editor, trait)
            }
          }}
        >
          {trait.getLabel()}
        </Button>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <Input
            type="number"
            value={value}
            placeholder={defaultValue}
            disabled={disabled}
            min={trait.get('min')}
            max={trait.get('max')}
            step={trait.get('step') || 1}
            onChange={(e) => handleChange(Number(e.target.value))}
          />
        </div>
      )

    case 'slider':
      const min = trait.get('min') || 0
      const max = trait.get('max') || 100
      const step = trait.get('step') || 1
      const currentValue = Number(value) || Number(defaultValue) || min

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{trait.getLabel()}</Label>
            <span className="text-sm text-gray-500">{currentValue}</span>
          </div>
          <div className="flex gap-4">
            <Slider
              value={[currentValue]}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              onValueChange={(values) => handleChange(values[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={currentValue}
              className="w-20"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              onChange={(e) => handleChange(Number(e.target.value))}
            />
          </div>
        </div>
      )

    case 'custom-options-manager':
      return <OptionsManager trait={trait} />

    case 'color':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <PopoverPicker
            color={value || defaultValue}
            onChange={(color) => handleChange(color)}
          />
        </div>
      )

    case 'rich-input':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <RichInput
            content={value}
            className="focus-visible:ring-1 focus-visible:ring-offset-0 border-input"
            onChange={(value) => {
              handleChange(value);
            }}
            {...trait.get('attributes')}
          />
        </div>
      )

    default:
      return '未知'
  }
} 
