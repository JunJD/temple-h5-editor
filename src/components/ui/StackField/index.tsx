import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GoPlus } from 'react-icons/go'
import StackItem from './StackItem'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { 
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor 
} from '@dnd-kit/modifiers'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '@/components/ui/label'

export interface Props<T> {
  className?: string
  items: T[]
  selected: T | null
  renderItem: (item: T) => React.ReactNode
  select?: (item: T) => void
  add?: () => void
  remove?: (item: T) => void
  move?: (item: T, index: number) => void
  reset?: (items: T[]) => void
  previewStyle?: (items: T) => Record<string, string>
  label?: React.ReactNode
  children?: React.ReactNode
  title?: React.ReactNode
  titleAdd?: React.ReactNode
}

const getItemId = (item: any) => {
  return item.cid ?? item.id
}

export default function StackField({
  className,
  items,
  selected,
  children,
  title,
  titleAdd,
  label,
  select,
  add,
  move,
  reset,
  remove,
  renderItem,
  previewStyle,
}: Props<any>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event
    if (active.id !== over?.id) {
      const item = items.find(i => getItemId(i) === active.id)
      const newIndex = items.findIndex(i => getItemId(i) === over?.id)
      item && move?.(item, newIndex)
    }
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || add) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label className="text-xs font-medium text-foreground/70">
              {label}
            </Label>
          )}
          {add && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={add}
              title={titleAdd as string}
            >
              <GoPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <Popover open={!!selected} onOpenChange={open => !open && select?.(null)}>
        <PopoverTrigger asChild>
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[
                restrictToVerticalAxis,
                restrictToFirstScrollableAncestor
              ]}
            >
              <SortableContext 
                items={items.map(getItemId)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="rounded-md border border-border/50 divide-y divide-border/50">
                  {items.map((item: any) => {
                    const id = getItemId(item)
                    const isSelected = item === selected

                    return (
                      <StackItem
                        key={id}
                        id={id}
                        item={item}
                        className={cn(
                          "p-2 text-xs",
                          isSelected && "bg-accent",
                          !isSelected && "hover:bg-accent/50"
                        )}
                        select={select}
                        remove={remove}
                        renderItem={renderItem}
                        previewStyle={previewStyle}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-80">
          {children}
        </PopoverContent>
      </Popover>
    </div>
  )
}