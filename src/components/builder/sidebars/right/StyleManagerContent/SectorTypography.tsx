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

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

export default function SectorTypography({ sector }: Props) {
  const renderField = (prop: any, type: 'number' | 'color' | 'select') => {
    if (!prop) return null;
    
    return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/70">
        {prop.getLabel()}
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
  )}

  const textAlignLastProp = sector.getProperty('text-align-last');

  return (
    <div className="space-y-4">
      {/* Font Family */}
      {/* {renderField(sector.getProperty('font-family'), 'select')} */}

      {/* Color */}
      {renderField(sector.getProperty('color'), 'color')}

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(sector.getProperty('font-size'), 'number')}
        {renderField(sector.getProperty('font-weight'), 'select')}
      </div>

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(sector.getProperty('line-height'), 'number')}
        {renderField(sector.getProperty('letter-spacing'), 'number')}
      </div>

      {/* Text Align & Decoration */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(sector.getProperty('text-align'), 'select')}
        {renderField(sector.getProperty('text-decoration'), 'select')}
        {textAlignLastProp && renderField(textAlignLastProp, 'select')}
      </div>

      {/* Text Transform & Direction */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(sector.getProperty('text-transform'), 'select')}
        {renderField(sector.getProperty('direction'), 'select')}
      </div>

      {/* White Space */}
      {renderField(sector.getProperty('white-space'), 'select')}
    </div>
  )
}