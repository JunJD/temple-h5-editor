'use client'

import { StylesResultProps, useEditor } from '@grapesjs/react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SectorLayout from './SectorLayout'
import SectorSize from './SectorSize'
import SectorSpace from './SectorSpace'
import SectorPosition from './SectorPosition'
import SectorBorders from './SectorBorders'
import SectorTypography from './SectorTypography'
import SectorEffects from './SectorEffects'
import { StyleField } from './style-field'
import { PropertyStack } from 'grapesjs'
import PropertyLabel from './PropertyLabel'
import SectorBackground from './SectorBackground'

export function StyleManagerContent({ sectors }: StylesResultProps) {
  const { Styles } = useEditor()
  const target = Styles.getSelected()
  const sectorsPatch = sectors.length ? sectors : Styles.getSectors({ visible: true })

  if (!target) return null

  const renderSectorContent = (sectorId: string, sector: any, properties: any[]) => {
    switch (sectorId) {
      case 'layout':
        return <SectorLayout sector={sector} />
      case 'size':
        return <SectorSize sector={sector} />
      case 'space':
        return <SectorSpace sector={sector} />
      case 'position':
        return <SectorPosition sector={sector} />
      case 'border':
        return <SectorBorders sector={sector} />
      case 'typography':
        return <SectorTypography sector={sector} />
      case 'effects':
        return <SectorEffects sector={sector} />
      case 'background':
        return <SectorBackground sector={sector} />
      default:
        return (
          <div className="space-y-4">
            {properties.map(prop => (
              <StyleField 
                key={prop.getId()} 
                prop={prop}
              />
            ))}
          </div>
        )
    }
  }

  return (
    <div className="space-y-1 p-1">
      <Accordion type="multiple" className="w-full">
        {sectorsPatch.map(sector => {
          const hasValue = sector.getProperties({ withValue: true }).length > 0
          const hasParentValue = sector.getProperties({ withParentValue: true }).length > 0
          const sectorId = sector.getId()
          const properties = sector.getProperties()

          return (
            <AccordionItem 
              key={sectorId}
              value={sectorId}
              className="border-b border-border/50"
            >
              <AccordionTrigger className="px-2 py-1.5 text-sm hover:bg-accent/50">
                <div className="flex items-center gap-2">
                  <span>{sector.getName()}</span>
                  {hasValue && (
                    <div className={cn(
                      "w-[6px] h-[6px] rounded-full",
                      "bg-violet-500 text-white"
                    )} />
                  )}
                  {hasParentValue && (
                    <div className={cn(
                      "w-[6px] h-[6px] rounded-full",
                      "bg-amber-500"
                    )} />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-3">
                  {renderSectorContent(sectorId, sector, properties)}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

// 工具函数
export const getNumberProps = (prop: any) => ({
  size: 's' as const,
  value: prop.getValue({ noDefault: true }),
  valueUnit: prop.getUnit(),
  units: prop.getUnits(),
  placeholder: prop.getDefaultValue(),
  onChangeUnit: (unit: string) => prop.upUnit(unit),
  onChange: (value: string, partial: boolean) => prop.upValue(value, { partial }),
})

export const getButtonsProps = (prop: any) => ({
  size: 's' as const,
  options: prop.getOptions().map((opt: any) => ({
    id: prop.getOptionId(opt),
    label: prop.getOptionLabel(prop.getOptionId(opt)),
    title: opt.title,
  })),
  value: prop.getValue(),
  onChange: (value: string) => prop.upValue(value),
})

export const getColorProps = (prop: any) => ({
  size: 's' as const,
  value: prop.getValue({ noDefault: true }),
  placeholder: prop.getDefaultValue(),
  onChange: (value: string, partial: boolean) => prop.upValue(value, { partial }),
})

export const getStackProps = (prop: PropertyStack, newLayer = {}) => {
  return {
      title: prop.getLabel(),
      titleAdd: `Add new ${prop.getLabel()}`,
      items: prop.getLayers(),
      selected: prop.getSelectedLayer(),
      renderItem: (layer: any) => prop.getLayerLabel(layer),
      add: () => prop.addLayer(newLayer, { at: 0 }),
      select: (layer: any) => prop.selectLayer(layer),
      remove: (layer: any) => prop.removeLayer(layer),
      move: (layer: any, index = 0) => prop.moveLayer(layer, index),
      label: <PropertyLabel property={prop}/>,
  }
}