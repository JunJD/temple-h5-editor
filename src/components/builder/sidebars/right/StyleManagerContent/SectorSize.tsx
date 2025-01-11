import NumberField from '@/components/ui/NumberField'
import { Label } from '@/components/ui/label'
import { getNumberProps } from '.'

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

export default function SectorSize({ sector }: Props) {
  const propW = sector.getProperty('width')
  const propMinW = sector.getProperty('min-width')
  const propMaxW = sector.getProperty('max-width')
  const propH = sector.getProperty('height')
  const propMinH = sector.getProperty('min-height')
  const propMaxH = sector.getProperty('max-height')

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
      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propW)}
        {renderField(propH)}
      </div>

      {/* Min Width & Height */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propMinW)}
        {renderField(propMinH)}
      </div>

      {/* Max Width & Height */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propMaxW)}
        {renderField(propMaxH)}
      </div>
    </div>
  )
}