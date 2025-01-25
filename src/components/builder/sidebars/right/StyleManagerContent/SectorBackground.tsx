import { getColorProps, getStackProps } from "."
import { useEditor } from '@grapesjs/react'
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
import { Button } from "@/components/ui/button"
import { 
  GoImage,
  GoGrabber,
  GoSquareFill 
} from "react-icons/go"
import { GradientPicker } from '@/components/ui/GradientPicker'
import { parseGradient } from '@/components/builder/utils/parseGradient'
import StackField from '@/components/ui/StackField'
import PropertyComposite from './PropertyComposite'
import functionName from '@/lib/parsers/functionName'
import { X } from 'lucide-react'

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

export enum BackgroundType {
  Image = 'image',
  Gradient = 'gradient',
  Color = 'color',
}

export const PROPERTY_IMAGE = 'background-image'
export const PROPERTY_BG_TYPE = '__background-type'
export const PROPERTY_BG_IMAGE = PROPERTY_IMAGE

const BG_IMAGE = 'https://placehold.co/150/777/white.png?text=IMAGE'
const BG_IMAGE_SIZE = '50px'

const bgDef = {
  [PROPERTY_BG_TYPE]: 'image',
  'background-image': `url("${BG_IMAGE}")`,
  'background-size': `${BG_IMAGE_SIZE} ${BG_IMAGE_SIZE}`,
  'background-repeat': 'repeat',
  'background-position': '0px 0px',
}

const getColorValueFromImage = (value: string) => {
  const result = value.includes('gradient(') ? 
    parseGradient(value).colorStops[0].color : 
    value
  return result || ''
}

export default function SectorBackground({ sector }: Props) {
  const editor = useEditor()
  const propBg = sector.getProperty('background')
  const propType = propBg.getProperty(PROPERTY_BG_TYPE)
  const propImage = propBg.getProperty('background-image')
  const propPos = propBg.getProperty('background-position')
  const propSize = propBg.getProperty('background-size')
  const propBgColor = sector.getProperty('background-color')
  const propBgClip = sector.getProperty('background-clip')
  const propRepeat = propBg.getProperty('background-repeat')
  const propAttachment = propBg.getProperty('background-attachment')
  const propOrigin = propBg.getProperty('background-origin')
  const layerIndex = propBg.getSelectedLayer()?.getIndex() || -1

  const propTypeValue = propType.getValue()
  const isImage = propTypeValue === 'image'
  const propImageValue = propImage.getValue()

  const openAssets = () => {
    const am = editor.Assets
    am.open({
      select(asset: any) {
        const src = asset.getSrc()
        propImage.upValue(`url("${src}")`)
        am.close()
      }
    })
  }

  const onTypeChange = (value: string) => {
    let image = 'none'
    let bgSize = '100%'
    if (value === BackgroundType.Image) {
      image = `url("${BG_IMAGE}")`
      bgSize = BG_IMAGE_SIZE
    } else if (value === BackgroundType.Gradient) {
      image = 'linear-gradient(90deg, black 10%, white 90%)'
    } else if (value === BackgroundType.Color) {
      image = 'rgba(0, 0, 0, 0.5)'
    }
    propImage.upValue(image)
    propType.upValue(value)
    propPos.upValue('0 0')
    propSize.upValue(`${bgSize} ${bgSize}`)
  }

  const renderField = (prop: any, type: 'color' | 'select', label?: string) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground/70">
          {label || prop.getLabel()}
        </Label>
        {type === 'color' && prop.getValue() && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => prop.upValue('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
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

  return (
    <div className="space-y-4">
      <StackField 
        {...getStackProps(propBg, bgDef)} 
        previewStyle={l => propBg.getStyleFromLayer(l, { camelCase: true })}
      >
        {/* Background Type */}
        <div className="flex gap-2">
          <Button
            variant={propTypeValue === BackgroundType.Image ? 'default' : 'outline'}
            size="icon"
            onClick={() => onTypeChange(BackgroundType.Image)}
          >
            <GoImage className="h-4 w-4" />
          </Button>
          <Button
            variant={propTypeValue === BackgroundType.Gradient ? 'default' : 'outline'}
            size="icon"
            onClick={() => onTypeChange(BackgroundType.Gradient)}
          >
            <GoGrabber className="h-4 w-4" />
          </Button>
          <Button
            variant={propTypeValue === BackgroundType.Color ? 'default' : 'outline'}
            size="icon"
            onClick={() => onTypeChange(BackgroundType.Color)}
          >
            <GoSquareFill className="h-4 w-4" />
          </Button>
        </div>

        {/* Background Value */}
        {isImage && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={openAssets}
          >
            {functionName(propImageValue).value || '选择图片'}
          </Button>
        )}
        {propTypeValue === BackgroundType.Color && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-medium text-foreground/70">
                颜色
              </Label>
              {propImageValue && propImageValue !== 'none' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => {
                    propImage.upValue('none');
                    propType.upValue('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <ColorField 
              {...getColorProps(propImage)} 
              value={getColorValueFromImage(propImageValue)}
            />
          </div>
        )}
        {propTypeValue === BackgroundType.Gradient && (
          <GradientPicker
            key={layerIndex}
            value={propImageValue}
            onChange={(v, partial) => propImage.upValue(v, { partial })}
          />
        )}

        {/* Image Settings */}
        {isImage && (
          <>
            <PropertyComposite property={propPos} />
            <PropertyComposite property={propSize} />
            <div className="grid grid-cols-2 gap-4">
              {renderField(propRepeat, 'select')}
              {renderField(propAttachment, 'select')}
            </div>
            {renderField(propOrigin, 'select')}
          </>
        )}
      </StackField>

      <Separator />

      {/* Background Color & Clip */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propBgColor, 'color')}
        {renderField(propBgClip, 'select')}
      </div>
    </div>
  )
}