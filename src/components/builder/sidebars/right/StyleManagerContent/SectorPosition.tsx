import { getButtonsProps, getNumberProps } from "."
import NumberField from '@/components/ui/NumberField'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

const PRESETS_OPTIONS = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'left',
  'right',
  'bottom',
  'top',
  'full',
] as const

export default function SectorPosition({ sector }: Props) {
  const propPos = sector.getProperty('position')
  const posValue = propPos.getValue()
  const propTop = sector.getProperty('top')
  const propRight = sector.getProperty('right')
  const propBottom = sector.getProperty('bottom')
  const propLeft = sector.getProperty('left')
  const propZIndex = sector.getProperty('z-index')

  const presetOptions = PRESETS_OPTIONS.map(id => ({ id, label: id }))
  const showPresets = ['absolute', 'fixed'].includes(posValue)

  const onPresetChange = (value: typeof PRESETS_OPTIONS[number]) => {
    let top = 'auto'
    let right = 'auto'
    let bottom = 'auto'
    let left = 'auto'

    switch (value) {
      case 'topLeft': top = '0%'; left = '0%'; break
      case 'topRight': top = '0%'; right = '0%'; break
      case 'bottomLeft': bottom = '0%'; left = '0%'; break
      case 'bottomRight': bottom = '0%'; right = '0%'; break
      case 'left': top = '0%'; bottom = '0%'; left = '0%'; break
      case 'right': top = '0%'; bottom = '0%'; right = '0%'; break
      case 'bottom': left = '0%'; bottom = '0%'; right = '0%'; break
      case 'top': left = '0%'; top = '0%'; right = '0%'; break
      case 'full': left = '0%'; top = '0%'; right = '0%'; bottom = '0%'; break
    }

    propTop.upValue(top)
    propRight.upValue(right)
    propBottom.upValue(bottom)
    propLeft.upValue(left)
  }

  const renderField = (prop: any) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/70">
        {prop.getLabel()}
      </Label>
      <NumberField {...getNumberProps(prop)} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Position Type */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs font-medium text-foreground/70 mb-1.5 block">
            Position
          </Label>
          <Select
            value={propPos.getValue()}
            onValueChange={value => propPos.upValue(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="relative">Relative</SelectItem>
              <SelectItem value="absolute">Absolute</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="sticky">Sticky</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showPresets && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  <Select
                    value=""
                    onValueChange={onPresetChange}
                  >
                    <SelectTrigger className="w-12">
                      <SelectValue placeholder="P" />
                    </SelectTrigger>
                    <SelectContent>
                      {presetOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Position Presets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {posValue !== 'static' && (
        <>
          {/* Position Values */}
          <div className="space-y-4">
            {/* Top */}
            <div className="w-1/2 mx-auto">
              {renderField(propTop)}
            </div>

            {/* Left & Right */}
            <div className="grid grid-cols-2 gap-4">
              {renderField(propLeft)}
              {renderField(propRight)}
            </div>

            {/* Bottom */}
            <div className="w-1/2 mx-auto">
              {renderField(propBottom)}
            </div>
          </div>

          {/* Z-Index */}
          <div>
            {renderField(propZIndex)}
          </div>
        </>
      )}
    </div>
  )
}