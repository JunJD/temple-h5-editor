import { getButtonsProps, getColorProps, getNumberProps } from "."
import NumberField from '@/components/ui/NumberField'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ColorField from '@/components/ui/ColorField'
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

const previewNumber = (value: string) => Math.min(Math.max(parseFloat(value), -3), 3)

const getNumberFilterProps = (prop: any, name = 'filter') => {
  const propValue = prop.getProperty(`${name}-value`)
  const option = prop.getProperty(`${name}-name`).getOption() || {}
  const units = option.units || []
  const unit = propValue.getUnit()
  const valueUnit = units.includes(unit) ? unit : units[0]

  return {
    ...getNumberProps(propValue),
    units,
    valueUnit,
    onChange: (value: string, partial: boolean) => {
      propValue.upValue(value, {
        partial,
        units,
        min: option.min,
        max: option.max,
      })
    },
  }
}

const getTypeProps = (prop: any, name: string) => {
  const propType = prop.getProperty(`${name}-name`)
  const propValue = prop.getProperty(`${name}-value`)

  return {
    ...getButtonsProps(propType),
    onChange: (value: string) => {
      propType.upValue(value)
      propValue.upValue('')
    },
  }
}

const defTextShadow = {
  'text-shadow-h': '1px',
  'text-shadow-v': '1px',
  'text-shadow-blur': '5px',
}

export default function SectorEffects({ sector }: Props) {
  const propShadow = sector.getProperty('box-shadow')
  const propTextShadow = sector.getProperty('text-shadow')
  const propFilter = sector.getProperty('filter')
  const propBackFilter = sector.getProperty('backdrop-filter')
  const propTrans = sector.getProperty('transition')
  const propTransf = sector.getProperty('transform')
  const propOpacity = sector.getProperty('opacity')
  const propMixBlend = sector.getProperty('mix-blend-mode')
  const propCursor = sector.getProperty('cursor')
  const propBackface = sector.getProperty('backface-visibility')
  const propPerspective = sector.getProperty('perspective')
  const propTransformStyle = sector.getProperty('transform-style')

  const renderField = (prop: any, type: 'number' | 'color' | 'select', label?: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/70">
        {label || prop.getLabel()}
      </Label>
      {type === 'number' && <NumberField {...getNumberProps(prop)} />}
      {type === 'color' && <ColorField {...getColorProps(prop)} />}
      {type === 'select' && (
        <Select
          value={prop.getValue()}
          onValueChange={value => prop.upValue(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prop.getOptions().map((opt: any) => (
              <SelectItem 
                key={prop.getOptionId(opt)} 
                value={prop.getOptionId(opt)}
              >
                {prop.getOptionLabel(prop.getOptionId(opt))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )

  const renderShadowPreview = (layer: any) => {
    const {
      boxShadowH: x,
      boxShadowV: y,
      boxShadowBlur: blur,
      boxShadowColor: color,
      boxShadowSpread: spread,
      boxShadowType: type,
    } = layer.getValues({ camelCase: true })
    const maxH = previewNumber(x)
    const maxV = previewNumber(y)
    const maxB = previewNumber(blur)
    const maxS = previewNumber(spread)
    const boxShadow = `${maxH}px ${maxV}px ${maxB}px ${maxS}px ${color} ${type}`.trim()

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          {x} {y} {blur} {spread}
        </div>
        <div 
          className={cn(
            "w-[15px] h-[15px] bg-white rounded-md border border-border/50",
          )}
          style={{ boxShadow }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Opacity & Mix Blend Mode */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propOpacity, 'number')}
        {renderField(propMixBlend, 'select')}
      </div>

      <Separator />

      {/* Cursor */}
      {renderField(propCursor, 'select')}

      <Separator />

      {/* Box Shadow */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {renderField(propShadow.getProperty('box-shadow-h'), 'number', 'X offset')}
          {renderField(propShadow.getProperty('box-shadow-v'), 'number', 'Y offset')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {renderField(propShadow.getProperty('box-shadow-blur'), 'number', 'Blur')}
          {renderField(propShadow.getProperty('box-shadow-spread'), 'number', 'Spread')}
        </div>
        {renderField(propShadow.getProperty('box-shadow-color'), 'color', 'Color')}
      </div>

      {/* Text Shadow */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {renderField(propTextShadow.getProperty('text-shadow-h'), 'number', 'X offset')}
          {renderField(propTextShadow.getProperty('text-shadow-v'), 'number', 'Y offset')}
        </div>
        {renderField(propTextShadow.getProperty('text-shadow-blur'), 'number', 'Blur')}
        {renderField(propTextShadow.getProperty('text-shadow-color'), 'color', 'Color')}
      </div>

      <Separator />

      {/* Filter */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propFilter.getProperty('filter-name'), 'select', 'Type')}
        <NumberField {...getNumberFilterProps(propFilter)} />
      </div>

      {/* Backdrop Filter */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propBackFilter.getProperty('backdrop-filter-name'), 'select', 'Type')}
        <NumberField {...getNumberFilterProps(propBackFilter, 'backdrop-filter')} />
      </div>

      <Separator />

      {/* Transform */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propTransf.getProperty('transform-name'), 'select', 'Type')}
        <NumberField {...getNumberFilterProps(propTransf, 'transform')} />
      </div>

      {/* Backface Visibility */}
      {renderField(propBackface, 'select')}

      <Separator />

      <h3 className="text-sm font-medium">Children transform</h3>

      <div className="grid grid-cols-2 gap-4">
        {renderField(propPerspective, 'number')}
        {renderField(propTransformStyle, 'select')}
      </div>
    </div>
  )
}
