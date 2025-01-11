import { cn } from "@/lib/utils"
import { GoSquareFill, GoBrowser } from "react-icons/go"
import { useState } from "react"
import PropertyLabel from "./PropertyLabel"
import ButtonGroupField, { Option } from "./ButtonGroupField"
import NumberField from "@/components/ui/NumberField"
import ColorField from "@/components/ui/ColorField"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getButtonsProps, getColorProps, getNumberProps } from "."

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  property?: any
  corners?: boolean
  onlyLabels?: boolean
  compact?: boolean
  options?: Option[]
  className?: string
}

const customOption = { 
  id: 'custom', 
  label: <GoBrowser className="h-4 w-4" />, 
  title: 'Custom' 
}

const optsType = [
  { 
    id: 'all', 
    label: <GoSquareFill className="h-4 w-4" />, 
    title: 'All' 
  },
  customOption,
]

function renderInput(prop: any, main?: any, opts: any = {}) {
  const type = prop.getType()
  const { compact = false } = opts
  const parentProp = prop.getParent()
  const defValue = prop.getDefaultValue()

  if (type === 'select') {
    const propName = parentProp.getName()
    const labelOpts = { property: propName }
    return (
      <Select
        value={main ? (!main.same ? '' : prop.getValue({ noDefault: true })) : prop.getValue()}
        onValueChange={value => {
          if (main) {
            main.all.map((p: any) => p.upValue(value))
          } else {
            prop.upValue(value)
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={!main.same ? 'Custom' : (prop.getOptionLabel(defValue, labelOpts) || defValue)} />
        </SelectTrigger>
        <SelectContent>
          {prop.getOptions().map((opt: any) => (
            <SelectItem key={opt.id} value={opt.id}>
              {prop.getOptionLabel(opt.id, labelOpts)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (type === 'color') {
    return (
      <ColorField
        {...getColorProps(prop)}
        {...(main && {
          value: !main.same ? '' : prop.getValue({ noDefault: true }),
          placeholder: !main.same ? 'Custom' : defValue,
          onChange: (value, partial) => main.all.map((p: any) => p.upValue(value, { partial })),
        })}
      />
    )
  }

  return (
    <NumberField
      {...getNumberProps(prop)}
      {...(compact ? { pan: prop.getLabel()[0] } : {})}
      {...(main && {
        value: !main.same ? '' : prop.getValue({ noDefault: true }),
        valueUnit: !main.same ? '' : prop.getUnit(),
        placeholder: !main.same ? 'Custom' : defValue,
        onChange: (value, partial) => main.all.map((p: any) => p.upValue(value, { partial })),
        onChangeUnit: (value) => main.all.map((p: any) => p.upUnit(value)),
      })}
    />
  )
}

export default function PropertyComposite({ 
  property, 
  corners, 
  compact, 
  children, 
  options,
  className 
}: Props) {
  const [typeValue, setTypeValue] = useState<string | null>(null)
  const isDetached = property.isDetached()
  const allProps: any[] = property.getProperties()
  const propsLength = allProps.length
  const [prop1, prop2, prop3, prop4] = allProps
  const value1 = prop1.getFullValue()
  const valueAll: string[] = allProps.map(p => p.getFullValue())
  const valueAllSame = valueAll.every(v => v === value1)
  const valueType = typeValue !== null ? typeValue : (valueAllSame || options ? 'all' : customOption.id)
  const customOptions = options ? [...options, customOption] : []
  const fullValue = property.getFullValue()
  const valueInOptions = customOptions.some(opt => opt.id === fullValue)
  const isCustom = valueType === customOption.id || (options ? !valueInOptions : false)

  const renderProp = (prop: any) => (
    <PropertyLabel property={compact ? null : prop} shallow={!isDetached}>
      {renderInput(prop, null, { compact })}
    </PropertyLabel>
  )

  return (
    <div className={cn("w-full space-y-2", className)}>
      <PropertyLabel 
        {...(compact ? { label: property.getLabel() } : { property })}
      >
        <div className="flex gap-2">
          {children ?? (
            options ? (
              <ButtonGroupField
                size="s"
                options={customOptions}
                value={isCustom ? customOption.id : fullValue}
                onChange={(value) => {
                  if (value === customOption.id) {
                    setTypeValue(value)
                  } else {
                    property.upValue(value)
                    setTypeValue('')
                  }
                }}
              />
            ) : (
              <>
                <div className="flex-1">
                  {renderInput(prop1, { same: valueAllSame, all: allProps })}
                </div>
                <ButtonGroupField 
                  size="s" 
                  options={optsType} 
                  value={valueType} 
                  onChange={setTypeValue}
                />
              </>
            )
          )}
        </div>
      </PropertyLabel>

      {isCustom && (
        <div className={cn(
          "rounded-md border bg-accent/50 p-2",
          "grid gap-2"
        )}>
          {propsLength === 2 ? (
            <div className="grid grid-cols-2 gap-2">
              {renderProp(prop1)}
              {renderProp(prop2)}
            </div>
          ) : propsLength === 3 ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {renderProp(prop1)}
                {renderProp(prop2)}
              </div>
              <div>{renderProp(prop3)}</div>
            </>
          ) : (
            corners ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {renderProp(prop1)}
                  {renderProp(prop2)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {renderProp(prop4)}
                  {renderProp(prop3)}
                </div>
              </>
            ) : (
              <>
                <div className="w-1/2 mx-auto">{renderProp(prop1)}</div>
                <div className="grid grid-cols-2 gap-2">
                  {renderProp(prop4)}
                  {renderProp(prop2)}
                </div>
                <div className="w-1/2 mx-auto">{renderProp(prop3)}</div>
              </>
            )
          )}
        </div>
      )}
    </div>
  )
}