import type { Selector } from 'grapesjs';
import { useState } from "react";
import { MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';

interface ClassTagProps {
    selector: Selector
    removable?: boolean
    toggleable?: boolean
    className?: string
    removeSelector?: (selector: Selector) => void
}

export default function ClassTag({ 
    selector, 
    className, 
    removable, 
    toggleable,
    removeSelector
}: ClassTagProps) {
    const [toRename, setToRename] = useState(false);
    const [isActive, setActive] = useState(selector.getActive());
    const label = selector.getLabel();

    const handleRename = (value: string) => {
        selector.set('label', value);
        setToRename(false);
    }

    const handleDuplicate = () => {
        selector.collection.add({
            ...selector.attributes,
            label: `${label} copy`
        });
    }

    const toggleActive = () => {
        const newActiveState = !selector.getActive();
        setActive(newActiveState);
        selector.setActive(newActiveState);
    }

    const remove = () => {
        removeSelector?.(selector);
    }

    const menuItems = [
        {
            label: '重命名',
            onClick: () => setToRename(true)
        },
        {
            label: '复制',
            onClick: handleDuplicate
        },
        removable && {
            label: '删除',
            onClick: remove
        },
        toggleable && {
            label: isActive ? '禁用' : '启用',
            onClick: toggleActive
        }
    ].filter(Boolean);

    return (
        <Badge 
            variant="secondary"
            className={cn(
                "group relative px-2 py-1",
                !isActive && "opacity-50 line-through",
                className
            )}
        >
            <div className="flex items-center gap-2">
                {toRename ? (
                    <Input
                        autoFocus
                        defaultValue={label}
                        className="h-4 px-1 py-0 text-xs"
                        onBlur={(e) => handleRename(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRename(e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                                setToRename(false);
                            }
                        }}
                    />
                ) : (
                    <span 
                        className="text-xs"
                        onDoubleClick={() => setToRename(true)}
                    >
                        {label}
                    </span>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {menuItems.map((item: any) => (
                            <DropdownMenuItem 
                                key={item.label}
                                onClick={item.onClick}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Badge>
    );
}