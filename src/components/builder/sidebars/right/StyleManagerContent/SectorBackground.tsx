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
  GoSquareFill 
} from "react-icons/go"
import StackField from '@/components/ui/StackField'
import PropertyComposite from './PropertyComposite'
import functionName from '@/lib/parsers/functionName'
import { X } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface Props extends React.HTMLProps<HTMLDivElement> {
  sector: any
}

export enum BackgroundType {
  Image = 'image',
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

const getColorValueFromImage = (value: string) => value || ''

const getImageUrl = (value: string) => {
  const { value: url } = functionName(value)
  return url.replace(/^"(.+)"$/, '$1') // 移除首尾的双引号
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

  const propTypeValue = propType.getValue()
  const isImage = propTypeValue === 'image'
  const propImageValue = propImage.getValue()

  const openAssets = () => {
    const am = editor.Assets;
    if (!am) {
      console.error('资产管理器未初始化');
      return;
    }

    am.open({
      types: ['image'],
      select(asset: { getSrc: () => string; getType: () => string }) {
        try {
          // 验证资产类型
          if (asset.getType() !== 'image') {
            console.error('请选择图片类型的资产');
            return;
          }

          const src = asset.getSrc();
          if (!src) {
            console.error('无效的图片源');
            return;
          }

          // 更新背景图片
          const selectedComponent = editor.getSelected();
          if (selectedComponent) {
            selectedComponent.addStyle({
              'background-image': `url("${src}")`,
            });
          }
          am.close();
        } catch (error) {
          console.error('选择图片时发生错误:', error);
        }
      }
    });
  }

  const onTypeChange = (value: string) => {
    let image = 'none'
    let bgSize = '100%'
    if (value === BackgroundType.Image) {
      image = `url("${BG_IMAGE}")`
      bgSize = BG_IMAGE_SIZE
    } else if (value === BackgroundType.Color) {
      image = 'rgba(0, 0, 0, 0.5)'
    }
    propImage.upValue(image)
    propType.upValue(value)
    propPos.upValue('0 0')
    propSize.upValue(`${bgSize} ${bgSize}`)
  }

  const backgroundOptions = {
    repeat: [
      { id: 'repeat', label: '重复(Repeat)' },
      { id: 'repeat-x', label: '水平重复(Repeat X)' },
      { id: 'repeat-y', label: '垂直重复(Repeat Y)' },
      { id: 'no-repeat', label: '不重复(No Repeat)' },
      { id: 'space', label: '等间距(Space)' },
      { id: 'round', label: '自适应(Round)' },
    ],
    attachment: [
      { id: 'scroll', label: '滚动(Scroll)' },
      { id: 'fixed', label: '固定(Fixed)' },
      { id: 'local', label: '局部滚动(Local)' },
    ],
    origin: [
      { id: 'padding-box', label: '内边距框(Padding Box)' },
      { id: 'border-box', label: '边框框(Border Box)' },
      { id: 'content-box', label: '内容框(Content Box)' },
    ],
    clip: [
      { id: 'border-box', label: '边框框(Border Box)' },
      { id: 'padding-box', label: '内边距框(Padding Box)' },
      { id: 'content-box', label: '内容框(Content Box)' },
      { id: 'text', label: '文本(Text)' },
    ],
  }

  const renderBackgroundField = (prop: any, type: 'repeat' | 'attachment' | 'origin' | 'clip') => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/70">
        {type === 'repeat' && '背景重复'}
        {type === 'attachment' && '背景附着'}
        {type === 'origin' && '背景原点'}
        {type === 'clip' && '背景裁剪'}
      </Label>
      <Select
        value={prop.getValue()}
        onValueChange={value => prop.upValue(value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {backgroundOptions[type].map((opt) => (
            <SelectItem 
              key={opt.id} 
              value={opt.id}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

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
        <div className="flex gap-2 mb-4">
          <Button
            variant={propTypeValue === BackgroundType.Image ? 'default' : 'outline'}
            size="icon"
            onClick={() => onTypeChange(BackgroundType.Image)}
          >
            <GoImage className="h-4 w-4" />
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
          <div className="space-y-4">
            <div className="p-2 border rounded-lg bg-muted/30">
              <div className="flex flex-col gap-2">
                <div className="flex justify-center">
                  <Avatar className="w-16 h-16 border">
                    <AvatarImage src={getImageUrl(propImageValue)} className="object-cover" />
                    <AvatarFallback>图片</AvatarFallback>
                  </Avatar>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={openAssets}
                >
                  选择图片
                </Button>
                <p className="text-xs text-muted-foreground truncate text-center">
                  {getImageUrl(propImageValue)}
                </p>
              </div>
            </div>

            {/* Image Position & Size */}
            <div className="space-y-4 p-3 border rounded-lg">
              <PropertyComposite property={propPos} />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground/70">
                  背景尺寸
                </Label>
                <Select
                  value={propSize.getValue()}
                  onValueChange={value => {
                    if (value === 'custom') {
                      propSize.upValue('100% 100%');
                    } else {
                      propSize.upValue(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">填充(Cover)</SelectItem>
                    <SelectItem value="contain">包含(Contain)</SelectItem>
                    <SelectItem value="100% 100%">拉伸(100%)</SelectItem>
                    <SelectItem value="auto">自动</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
                {propSize.getValue() === 'custom' && (
                  <PropertyComposite property={propSize} />
                )}
              </div>
            </div>

            {/* Image Display Settings */}
            <div className="space-y-4 p-3 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {renderBackgroundField(propRepeat, 'repeat')}
                {renderBackgroundField(propAttachment, 'attachment')}
              </div>
              {renderBackgroundField(propOrigin, 'origin')}
            </div>
          </div>
        )}

        {propTypeValue === BackgroundType.Color && (
          <div className="p-3 border rounded-lg">
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
      </StackField>

      <Separator />

      {/* Background Color & Clip */}
      <div className="grid grid-cols-2 gap-4">
        {renderField(propBgColor, 'color')}
        {renderBackgroundField(propBgClip, 'clip')}
      </div>
    </div>
  )
}