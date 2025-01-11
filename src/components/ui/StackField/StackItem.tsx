import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GoGrabber, GoX } from 'react-icons/go'

export default function StackItem(props: any) {
  const { 
    id, 
    item, 
    className, 
    select, 
    remove, 
    renderItem, 
    previewStyle 
  } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const onSelect = () => select?.(item)
  const onRemove = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    remove?.(item)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div 
        className={cn(
          "flex items-center gap-2",
          className
        )}
        onClick={onSelect}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 cursor-grab"
          {...listeners}
        >
          <GoGrabber className="h-3 w-3" />
        </Button>

        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            {renderItem(item)}
          </div>
          {previewStyle && (
            <div 
              className="h-4 w-4 rounded-sm border border-border/50" 
              style={previewStyle(item)}
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4"
          onClick={onRemove}
        >
          <GoX className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}