import { useEffect, useState } from 'react'
import { useEditor } from '@grapesjs/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GoX,
  GoArrowBoth,
  GoRows,
  GoColumns,
  GoStack,
  GoMoveToStart,
  GoMoveToEnd,
  GoHorizontalRule,
  GoUnfold,
  GoFold
} from 'react-icons/go'
import { getButtonsProps, getNumberProps } from "."
import NumberField from '@/components/ui/NumberField'
import PropertyLabel from "./PropertyLabel"
import ButtonGroupField from "./ButtonGroupField"
import PropertyComposite from "./PropertyComposite"

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

export default function SectorLayout({ sector }: Props) {
  const { editor } = useEditor()
  const [elParentStyle, setElParentStyle] = useState<any>({})

  // 获取属性
  const propDisplay = sector.getProperty('display')
  const propDir = sector.getProperty('flex-direction')
  const propJust = sector.getProperty('justify-content')
  const propAlign = sector.getProperty('align-items')
  const propWrap = sector.getProperty('flex-wrap')
  const propOrder = sector.getProperty('order')

  const displayValue = propDisplay.getValue()
  const isFlex = displayValue === 'flex'
  const isParentFlex = (elParentStyle.display || '').indexOf('flex') >= 0

  const optionsDir = [
    { id: 'row', label: <GoRows className="h-4 w-4" />, title: 'Row' },
    { id: 'row-reverse', label: <GoRows className="h-4 w-4 rotate-180" />, title: 'Row Reverse' },
    { id: 'column', label: <GoColumns className="h-4 w-4" />, title: 'Column' },
    { id: 'column-reverse', label: <GoColumns className="h-4 w-4 rotate-180" />, title: 'Column Reverse' },
  ]

  const optionsJust = [
    { id: 'flex-start', title: 'Start', label: <GoMoveToStart className="h-4 w-4" /> },
    { id: 'center', title: 'Center', label: <GoHorizontalRule className="h-4 w-4" /> },
    { id: 'flex-end', title: 'End', label: <GoMoveToEnd className="h-4 w-4" /> },
    { id: 'space-between', title: 'Space between', label: <GoArrowBoth className="h-4 w-4" /> },
    { id: 'space-around', title: 'Space around', label: <GoStack className="h-4 w-4" /> },
    { id: 'space-evenly', title: 'Space evenly', label: <GoStack className="h-4 w-4 rotate-90" /> },
  ]

  const optionsAlign = [
    { id: 'stretch', title: 'Stretch', label: <GoUnfold className="h-4 w-4" /> },
    { id: 'flex-start', title: 'Start', label: <GoMoveToStart className="h-4 w-4 rotate-90" /> },
    { id: 'center', title: 'Center', label: <GoHorizontalRule className="h-4 w-4 rotate-90" /> },
    { id: 'flex-end', title: 'End', label: <GoMoveToEnd className="h-4 w-4 rotate-90" /> },
  ]

  const optionsFlex = [
    { id: '0 0 auto', label: <GoX className="h-4 w-4" />, title: 'Auto' },
    { id: '1 1 0%', label: <GoUnfold className="h-4 w-4" />, title: 'Fill container' },
    { id: '0 1 auto', label: <GoFold className="h-4 w-4" />, title: 'Hug contents' },
  ]

  useEffect(() => {
    if (!editor) return () => {}
    
    const { Styles } = editor
    const up = () => {
      const selected = editor.getSelected()
      let elParentStyle: any = {}

      if (selected) {
        const el = selected.getEl()
        if (el) {
          const elParent = el.parentElement
          if (elParent) {
            elParentStyle = window.getComputedStyle(elParent)
          }
        }
      }

      setElParentStyle(elParentStyle)
    }

    const ev = Styles.events.target
    editor.on(ev, up)
    up()
    return () => editor.off(ev, up)
  }, [editor])

  return (
    <div className="space-y-4">
      {/* Display 选择器 */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Display</label>
        <Select
          value={propDisplay.getValue()}
          onValueChange={value => propDisplay.upValue(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="flex">Flex</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="inline">Inline</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isFlex && (
        <div className="space-y-4">
          <PropertyLabel property={propDir}>
            <ButtonGroupField {...getButtonsProps(propDir)} options={optionsDir}/>
          </PropertyLabel>

          <PropertyLabel property={propJust}>
            <ButtonGroupField {...getButtonsProps(propJust)} options={optionsJust}/>
          </PropertyLabel>
          
          <PropertyLabel property={propAlign}>
            <ButtonGroupField {...getButtonsProps(propAlign)} options={optionsAlign}/>
          </PropertyLabel>

          <PropertyComposite property={sector.getProperty('gap')}/>

          <PropertyLabel property={propWrap} row>
            <Select
              value={propWrap.getValue()}
              onValueChange={value => propWrap.upValue(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nowrap">No Wrap</SelectItem>
                <SelectItem value="wrap">Wrap</SelectItem>
                <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
              </SelectContent>
            </Select>
          </PropertyLabel>
        </div>
      )}

      {isParentFlex && (
        <div className="pt-4 border-t space-y-4">
          <h3 className="text-sm font-medium">Flex Child</h3>
          
          <PropertyComposite property={sector.getProperty('flex')} options={optionsFlex}/>

          <PropertyLabel property={propOrder} row>
            <NumberField {...getNumberProps(propOrder)} />
          </PropertyLabel>
        </div>
      )}
    </div>
  )
}