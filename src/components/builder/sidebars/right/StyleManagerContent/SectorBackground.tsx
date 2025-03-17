import React from 'react'
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
import { X } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import StackField from '@/components/ui/StackField'
import PropertyComposite from './PropertyComposite'
import functionName from '@/lib/parsers/functionName'

// 类型定义
// ---------------------------------------------------
export interface SectorBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  sector: any // TODO: 使用更具体的GrapeJS类型
}

export enum BackgroundType {
  Image = 'image',
  Color = 'color',
}

export const PROPERTY_BG_TYPE = '__background-type'
export const PROPERTY_IMAGE = 'background-image'
export const PROPERTY_BG_IMAGE = PROPERTY_IMAGE

export type BackgroundOptionType = keyof typeof backgroundOptions

// 常量
// ---------------------------------------------------
const BG_IMAGE = 'https://placehold.co/150/777/white.png?text=IMAGE'
const BG_IMAGE_SIZE = '50px'

const bgDef = {
  [PROPERTY_BG_TYPE]: 'image',
  'background-image': `url("${BG_IMAGE}")`,
  'background-size': `${BG_IMAGE_SIZE} ${BG_IMAGE_SIZE}`,
  'background-repeat': 'repeat',
  'background-position': '0px 0px',
}

// 背景选项配置
export const backgroundOptions = {
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
  size: [
    { id: 'cover', label: '填充(Cover)' },
    { id: 'contain', label: '包含(Contain)' },
    { id: '100% 100%', label: '拉伸(100%)' },
    { id: 'auto', label: '自动' },
    { id: 'custom', label: '自定义' },
  ],
} as const;

export const backgroundLabels: Record<BackgroundOptionType, string> = {
  repeat: '背景重复',
  attachment: '背景附着',
  origin: '背景原点',
  clip: '背景裁剪',
  size: '背景尺寸',
};

// 工具函数
// ---------------------------------------------------
const getColorValueFromImage = (value: string): string => value || ''

const getImageUrl = (value: string): string => {
  const { value: url } = functionName(value)
  return url.replace(/^"(.+)"$/, '$1') // 移除首尾的双引号
}

// 子组件
// ---------------------------------------------------
interface BackgroundTypeSelectProps {
  currentType: string
  onTypeChange: (type: string) => void
}

const BackgroundTypeSelect: React.FC<BackgroundTypeSelectProps> = ({ 
  currentType, 
  onTypeChange 
}) => (
  <div className="flex gap-2 mb-4">
    <Button
      variant={currentType === BackgroundType.Image ? 'default' : 'outline'}
      size="icon"
      onClick={() => onTypeChange(BackgroundType.Image)}
    >
      <GoImage className="h-4 w-4" />
    </Button>
    <Button
      variant={currentType === BackgroundType.Color ? 'default' : 'outline'}
      size="icon"
      onClick={() => onTypeChange(BackgroundType.Color)}
    >
      <GoSquareFill className="h-4 w-4" />
    </Button>
  </div>
)

interface ImageSelectorProps {
  imageUrl: string
  openAssets: () => void
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ imageUrl, openAssets }) => (
  <div className="p-2 border rounded-lg bg-muted/30">
    <div className="flex flex-col gap-2">
      <div className="flex justify-center">
        <Avatar className="w-16 h-16 border">
          <AvatarImage src={imageUrl} className="object-cover" />
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
        {imageUrl}
      </p>
    </div>
  </div>
)

interface BackgroundFieldProps {
  prop: any
  type: BackgroundOptionType
  customHandler?: (value: string) => void
}

const BackgroundField: React.FC<BackgroundFieldProps> = ({ prop, type, customHandler }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-foreground/70">
      {backgroundLabels[type]}
    </Label>
    <Select
      value={prop.getValue()}
      onValueChange={customHandler || (value => prop.upValue(value))}
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
    {type === 'size' && prop.getValue() === 'custom' && (
      <PropertyComposite property={prop} />
    )}
  </div>
)

interface ColorOrSelectFieldProps {
  prop: any
  type: 'color' | 'select'
  label?: string
}

const ColorOrSelectField: React.FC<ColorOrSelectFieldProps> = ({ prop, type, label }) => (
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

// 图片背景配置组件
const ImageBackgroundSettings: React.FC<{
  propPos: any
  propSize: any
  propRepeat: any
  propAttachment: any
  propOrigin: any
  handleSizeChange: (value: string) => void
  propImageValue: string
  openAssets: () => void
}> = ({
  propPos,
  propSize,
  propRepeat,
  propAttachment,
  propOrigin,
  handleSizeChange,
  propImageValue,
  openAssets
}) => (
  <div className="space-y-4">
    <ImageSelector 
      imageUrl={getImageUrl(propImageValue)}
      openAssets={openAssets}
    />

    {/* 图片位置和尺寸设置 */}
    <div className="space-y-4 p-3 border rounded-lg">
      <PropertyComposite property={propPos} />
      <BackgroundField 
        prop={propSize} 
        type='size' 
        customHandler={handleSizeChange}
      />
    </div>

    {/* 图片显示设置 */}
    <div className="space-y-4 p-3 border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <BackgroundField prop={propRepeat} type='repeat' />
        <BackgroundField prop={propAttachment} type='attachment' />
      </div>
      <BackgroundField prop={propOrigin} type='origin' />
    </div>
  </div>
)

// 颜色背景配置组件
const ColorBackgroundSettings: React.FC<{
  propImage: any
  propType: any
  propImageValue: string
}> = ({ propImage, propType, propImageValue }) => (
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
)

// 主组件
// ---------------------------------------------------
const SectorBackground: React.FC<SectorBackgroundProps> = ({ sector }) => {
  const editor = useEditor()
  
  // 属性获取
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
  const isImage = propTypeValue === BackgroundType.Image
  const propImageValue = propImage.getValue()

  // 事件处理函数
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
    console.log('onTypeChange', value)
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

  const handleSizeChange = (value: string) => {
    propSize.upValue(value);
  };

  return (
    <div className="space-y-4">
      <StackField 
        {...getStackProps(propBg, bgDef)} 
        previewStyle={l => propBg.getStyleFromLayer(l, { camelCase: true })}
      >
        {/* 背景类型选择器 */}
        <BackgroundTypeSelect 
          currentType={propTypeValue} 
          onTypeChange={onTypeChange} 
        />

        {/* 背景值设置 */}
        {isImage ? (
          <ImageBackgroundSettings
            propPos={propPos}
            propSize={propSize}
            propRepeat={propRepeat}
            propAttachment={propAttachment}
            propOrigin={propOrigin}
            handleSizeChange={handleSizeChange}
            propImageValue={propImageValue}
            openAssets={openAssets}
          />
        ) : (
          propTypeValue === BackgroundType.Color && (
            <ColorBackgroundSettings
              propImage={propImage}
              propType={propType}
              propImageValue={propImageValue}
            />
          )
        )}
      </StackField>

      <Separator />

      {/* 背景颜色和裁剪 */}
      <div className="grid grid-cols-2 gap-4">
        <ColorOrSelectField prop={propBgColor} type='color' />
        <BackgroundField prop={propBgClip} type='clip' />
      </div>
    </div>
  )
}

export default SectorBackground