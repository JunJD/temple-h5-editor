import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '@/schemas';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpressionEditor } from '@/components/ui/expression-editor';
import { LINKAGE_FORM_TYPES } from '@/plugins/v5/linkage-form/constants';

interface SortableFieldItemProps {
    field: FormField;
    index: number;
    id: string;
    openPanels: number[];
    togglePanel: (index: number) => void;
    handleRemoveField: (index: number) => void;
    handleFieldChange: (index: number, field: Partial<FormField>) => void;
    fields: FormField[];
}

export function SortableFieldItem({
    field,
    index,
    id,
    openPanels,
    togglePanel,
    handleRemoveField,
    handleFieldChange,
    fields
}: SortableFieldItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Collapsible
                key={index}
                open={openPanels.includes(index)}
                onOpenChange={() => togglePanel(index)}
                className={cn("border rounded-lg", isDragging && "border-primary")}
            >
                <div className="flex items-center justify-between w-full bg-accent">
                    <div 
                        {...attributes} 
                        {...listeners} 
                        className="flex items-center justify-center p-3 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CollapsibleTrigger className="flex items-center gap-2 p-4 flex-grow text-left">
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            openPanels.includes(index) && "transform rotate-180"
                        )} />
                        <span className="font-medium">
                            {field.label || '未命名字段'} ({field.name || '未设置字段名'})
                        </span>
                    </CollapsibleTrigger>
                    <div className="pr-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveField(index);
                            }}
                            disabled={field.name === 'amount' || field.name === 'name'}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CollapsibleContent className="p-4 space-y-4 border-t bg-accent/5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>字段名称</Label>
                            <Input
                                value={field.name}
                                onChange={e => handleFieldChange(index, { name: e.target.value })}
                                placeholder="请输入字段名称"
                                disabled={field.name === 'amount' || field.name === 'name'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>字段标签</Label>
                            <Input
                                value={field.label}
                                onChange={e => handleFieldChange(index, { label: e.target.value })}
                                placeholder="请输入字段标签"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>字段类型</Label>
                            <Select
                                value={field.type}
                                onValueChange={(value: keyof typeof LINKAGE_FORM_TYPES) =>
                                    handleFieldChange(index, {
                                        type: value,
                                        // 切换类型时清空默认值，避免类型不匹配
                                        defaultValue: undefined
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="请选择字段类型" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="input-group">数字输入框</SelectItem>
                                    <SelectItem value="input-group-text">文本输入框</SelectItem>
                                    <SelectItem value="input-group-rich-text">富文本输入框</SelectItem>
                                    <SelectItem value="input-number-group">数字加减框</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>默认值</Label>
                            <Input
                                value={field.defaultValue || ''}
                                onChange={e => handleFieldChange(index, {
                                    defaultValue: field.type === 'input-group' ?
                                        Number(e.target.value) || undefined :
                                        e.target.value
                                })}
                                placeholder={`请输入${field.type === 'input-group' ? '数字' : '文本'}默认值`}
                                type={field.type === 'input-group' ? 'number' : 'text'}
                            />
                            <p className="text-xs text-muted-foreground">
                                {field.type === 'input-group' ? '数字类型字段，请输入数字默认值' : '文本类型字段，可输入任意默认值'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>占位文本</Label>
                            <Input
                                value={field.placeholder || ''}
                                onChange={e => handleFieldChange(index, { placeholder: e.target.value })}
                                placeholder="请输入占位文本"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>后缀</Label>
                            <Input
                                value={field.suffix || ''}
                                onChange={e => handleFieldChange(index, { suffix: e.target.value })}
                                placeholder="请输入后缀（如：元、个等）"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`required-${index}`}
                                    checked={field.required}
                                    onCheckedChange={(checked) =>
                                        handleFieldChange(index, { required: Boolean(checked) })
                                    }
                                />
                                <Label htmlFor={`required-${index}`}>必填字段</Label>
                            </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>公式表达式（用于联动计算）</Label>
                            <ExpressionEditor
                                value={field.expression || ''}
                                onChange={(value) => handleFieldChange(index, { expression: value })}
                                fields={fields.filter(f => f.name !== field.name)}
                            />
                            <p className="text-xs text-muted-foreground">
                                可以引用其他字段进行计算，例如：amount * 2 + 10
                            </p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
} 