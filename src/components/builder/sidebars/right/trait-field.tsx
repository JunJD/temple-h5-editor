'use client'

import { useEditor } from '@grapesjs/react'
import type { Trait } from 'grapesjs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface TraitFieldProps {
  trait: Trait
}

export function TraitField({ trait }: TraitFieldProps) {
  const editor = useEditor()

  const handleChange = (value: string) => {
    trait.setValue(value)
  }

  const type = trait.getType()
  const value = trait.getValue()
  const defaultValue = trait.getDefault()

  switch (type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>{trait.getLabel()}</Label>
          <Input
            value={value}
            placeholder={defaultValue}
            onChange={(e) => handleChange(e.target.value)}
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
            onCheckedChange={(checked) => trait.setValue(checked)}
          />
          <Label htmlFor={trait.getId() as string}>{trait.getLabel()}</Label>
        </div>
      )

    case 'button':
      return (
        <Button
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

    default:
      return null
  }
} 