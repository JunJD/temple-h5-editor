import React from 'react';
import { FormField } from '@/schemas';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableFieldItem } from './sortable-field-item';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { LINKAGE_FORM_TYPES } from '@/plugins/v5/linkage-form/constants';

interface FormFieldsTabProps {
    fields: FormField[];
    openPanels: number[];
    setFields: (fields: FormField[]) => void;
    setOpenPanels: (openPanels: number[]) => void;
}

export function FormFieldsTab({
    fields,
    openPanels,
    setFields,
    setOpenPanels
}: FormFieldsTabProps) {
    // 配置拖拽传感器
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 需要拖动多少像素才激活
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddField = () => {
        const newField: FormField = {
            name: '',
            label: '',
            type: 'input-group' as keyof typeof LINKAGE_FORM_TYPES,
            required: false,
            suffix: '',
            placeholder: '',
            defaultValue: '',
            expression: ''
        };
        setFields([...fields, newField]);
        // 自动展开新添加的字段
        setOpenPanels([...openPanels, fields.length]);
    };

    const handleRemoveField = (index: number) => {
        if (fields[index].name === 'amount' || fields[index].name === 'name') return;
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
        setOpenPanels(openPanels.filter(i => i !== index));
    };

    const handleFieldChange = (index: number, field: Partial<FormField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...field };
        setFields(newFields);
    };

    const togglePanel = (index: number) => {
        setOpenPanels(
            openPanels.includes(index)
                ? openPanels.filter(i => i !== index)
                : [...openPanels, index]
        );
    };

    // 处理拖拽结束事件
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((_, index) => `field-${index}` === active.id);
            const newIndex = fields.findIndex((_, index) => `field-${index}` === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newFields = [...fields];
                const [movedField] = newFields.splice(oldIndex, 1);
                newFields.splice(newIndex, 0, movedField);
                setFields(newFields);
                
                // 更新打开的面板索引
                const newOpenPanels = openPanels.map(panelIndex => {
                    if (panelIndex === oldIndex) return newIndex;
                    if (oldIndex < panelIndex && panelIndex <= newIndex) return panelIndex - 1;
                    if (newIndex <= panelIndex && panelIndex < oldIndex) return panelIndex + 1;
                    return panelIndex;
                });
                setOpenPanels(newOpenPanels);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleAddField} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    添加字段
                </Button>
            </div>
            <ScrollArea className="space-y-2 h-[400px]">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={fields.map((_, index) => `field-${index}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <SortableFieldItem
                                    key={`field-${index}`}
                                    id={`field-${index}`}
                                    field={field}
                                    index={index}
                                    openPanels={openPanels}
                                    togglePanel={togglePanel}
                                    handleRemoveField={handleRemoveField}
                                    handleFieldChange={handleFieldChange}
                                    fields={fields}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </ScrollArea>
        </div>
    );
} 