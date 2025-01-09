import * as React from 'react';
import { BlocksResultProps } from '@grapesjs/react';
import { MAIN_BORDER_COLOR, cx } from '../common';
import { useState } from 'react';

export type CustomBlockManagerProps = Pick<
  BlocksResultProps,
  'mapCategoryBlocks' | 'dragStart' | 'dragStop'
>;

export default function CustomBlockManager({
  mapCategoryBlocks,
  dragStart,
  dragStop,
}: CustomBlockManagerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (block: any, ev: DragEvent) => {
    setIsDragging(true);
    dragStart(block, ev);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStop(false);
  };

  return (
    <div className="gjs-custom-block-manager text-left">
      {Array.from(mapCategoryBlocks).map(([category, blocks]) => (
        <div key={category}>
          <div className={cx('py-1 px-1', MAIN_BORDER_COLOR)}>
            {category}
          </div>
          <div className="grid grid-cols-3 gap-2 p-1">
            {blocks.map((block) => (
              <div
                key={block.getId()}
                draggable
                className={cx(
                  'flex flex-col items-center justify-center p-2.5',
                  'bg-[#2F3031] hover:bg-[#3F4041]',
                  'rounded-lg cursor-move',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5 active:scale-95',
                  'h-20',
                  isDragging && 'opacity-50 scale-95',
                )}
                onDragStart={(ev) => handleDragStart(block, ev.nativeEvent)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={cx(
                    'w-3 h-3 transition-transform duration-200',
                  )}
                  dangerouslySetInnerHTML={{ __html: block.getMedia()! }}
                />
                <div
                  className={cx(
                    'text-xs mt-1.5',
                    'transition-opacity duration-200',
                  )}
                  title={block.getLabel()}
                >
                  {block.getLabel()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
