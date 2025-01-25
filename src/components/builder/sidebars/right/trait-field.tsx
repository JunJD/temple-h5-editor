'use client'

import { useEditor } from '@grapesjs/react'
import { useEffect, useState } from 'react'
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

  const handleChange = (value: string) => {
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
            value={value}
            placeholder={defaultValue}
            disabled={disabled}
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

    case 'linkage':
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${trait.getId()}-enabled`}
              checked={value?.enabled || false}
              onCheckedChange={(checked) => {
                trait.setValue({
                  ...value,
                  enabled: checked
                });
              }}
            />
            <Label htmlFor={`${trait.getId()}-enabled`}>参与数据联动</Label>
          </div>
          
          {value?.enabled && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>字段值</Label>
                <Input
                  value={value.fieldValue || ''}
                  onChange={(e) => {
                    trait.setValue({
                      ...value,
                      fieldValue: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>字段值类型</Label>
                <Select
                  value={value.sourceType || 'fixed'}
                  onValueChange={(sourceType) => {
                    trait.setValue({
                      ...value,
                      sourceType: sourceType as 'fixed' | 'user-input'
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">固定值</SelectItem>
                    <SelectItem value="user-input">用户输入</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {value.sourceType === 'user-input' && (
                <div className="space-y-2">
                  <Label>用户输入字段</Label>
                  <Input
                    value={value.sourceValue || ''}
                    onChange={(e) => {
                      trait.setValue({
                        ...value,
                        sourceValue: e.target.value
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )

    default:
      return '未知'
  }
} 