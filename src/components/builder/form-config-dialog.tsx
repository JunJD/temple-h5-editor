import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LINKAGE_FORM_TYPES } from '@/plugins/v5/linkage-form/constants';
import { PlusCircle, Trash2, ChevronDown, GripVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ExpressionEditor } from '@/components/ui/expression-editor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormField } from '@/schemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CascadeSelectorOptions, DEFAULT_OPTIONS, DEFAULT_OPTION_IMAGE } from '@/plugins/v5/linkage-form/form-item/cascade-selector/constants';
import { TrashIcon } from 'lucide-react';
import { Editor } from 'grapesjs';
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
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldsTab } from './form-field/form-fields-tab';
import { GoodsSelectorsTab } from './form-field/goods-selectors-tab';
import { validateFields, validateGoodsOptions } from './form-field/form-validator';

// interface FormField {
//     name: string;
//     label: string;
//     type: keyof typeof LINKAGE_FORM_TYPES;
//     required?: boolean;
//     suffix?: string;
//     expression?: string;
//     defaultValue?: string | number;
//     placeholder?: string;
// }

interface FormConfig {
    fields: FormField[];
    goodsOptions?: CascadeSelectorOptions;
}

interface FormConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (config: FormConfig) => void;
    initialConfig: FormConfig;
    editor?: Editor;
}

// 创建一个可排序的字段组件
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

function SortableFieldItem({
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

export function FormConfigDialog({
    open,
    onOpenChange,
    onSave,
    initialConfig,
    editor
}: FormConfigDialogProps) {
    const [fields, setFields] = React.useState<FormField[]>(initialConfig.fields);
    const [openPanels, setOpenPanels] = React.useState<number[]>([]);
    const [activeTab, setActiveTab] = React.useState("fields");
    const [goodsOptions, setGoodsOptions] = React.useState<CascadeSelectorOptions>(
        initialConfig.goodsOptions || DEFAULT_OPTIONS
    );
    const [selectedParentId, setSelectedParentId] = React.useState<string | null>(
        Object.keys(goodsOptions.level2)[0] || null
    );
    const { toast } = useToast();

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

    // 级联选择器选项相关函数
    const getCurrentOptions = () => {
        if (selectedParentId && selectedParentId !== "level1") {
            return goodsOptions.level2[selectedParentId] || [];
        }
        return goodsOptions.level1;
    };

    const handleAddOption = () => {
        const newOptions = structuredClone(goodsOptions);

        if (selectedParentId) {
            // 添加二级选项
            const newOption = {
                id: `l2_${Date.now()}`,
                label: '新选项',
                value: 1
            };
            if (!newOptions.level2[selectedParentId]) {
                newOptions.level2[selectedParentId] = [];
            }
            newOptions.level2[selectedParentId].push(newOption);
        } else {
            // 添加一级选项
            const newOption = {
                id: `l1_${Date.now()}`,
                label: '新选项',
                value: `option_${Date.now()}`,
                image: DEFAULT_OPTION_IMAGE
            };
            newOptions.level1.push(newOption);
            newOptions.level2[newOption.id] = [];
        }

        setGoodsOptions(newOptions);
    };

    const handleUpdateOption = (optionId: string, field: string, value: string | number | boolean) => {
        const newOptions = structuredClone(goodsOptions);
        if (selectedParentId) {
            // 更新二级选项
            const optionIndex = newOptions.level2[selectedParentId].findIndex(opt => opt.id === optionId);
            if (optionIndex !== -1) {
                newOptions.level2[selectedParentId][optionIndex] = {
                    ...newOptions.level2[selectedParentId][optionIndex],
                    [field]: value
                };
            }
        } else {
            // 更新一级选项
            const optionIndex = newOptions.level1.findIndex(opt => opt.id === optionId);
            if (optionIndex !== -1) {
                newOptions.level1[optionIndex] = {
                    ...newOptions.level1[optionIndex],
                    [field]: value
                };
            }
        }
        setGoodsOptions(newOptions);
    };

    const handleDeleteOption = (optionId: string) => {
        const newOptions = structuredClone(goodsOptions);
        if (selectedParentId) {
            // 删除二级选项
            newOptions.level2[selectedParentId] = newOptions.level2[selectedParentId].filter(
                opt => opt.id !== optionId
            );
        } else {
            // 删除一级选项以及其对应的所有二级选项
            newOptions.level1 = newOptions.level1.filter(opt => opt.id !== optionId);
            delete newOptions.level2[optionId];

            // 如果删除的正是当前选中的父级，需要重置选择
            if (optionId === selectedParentId) {
                const remainingIds = Object.keys(newOptions.level2);
                setSelectedParentId(remainingIds.length > 0 ? remainingIds[0] : null);
            }
        }
        setGoodsOptions(newOptions);
    };

    const handleSave = () => {
        // 验证表单字段
        const fieldsValidation = validateFields(fields);
        if (!fieldsValidation.valid) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: fieldsValidation.error
            });
            // 验证失败时，自动切换到字段配置标签页
            setActiveTab("fields");
            return;
        }

        // 验证商品选择器
        const goodsValidation = validateGoodsOptions(goodsOptions);
        if (!goodsValidation.valid) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: goodsValidation.error
            });
            // 验证失败时，自动切换到商品选择器标签页
            setActiveTab("goods");
            return;
        }

        // 保存配置
        onSave({
            fields,
            goodsOptions
        });

        onOpenChange(false);

        toast({
            title: "保存成功",
            description: "表单配置已更新"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl" aria-describedby="form-config-description">
                <DialogHeader>
                    <DialogTitle>配置表单</DialogTitle>
                    <p id="form-config-description" className="text-sm text-muted-foreground">
                        在这里配置表单字段和商品选择器选项
                    </p>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="goods">商品选择器</TabsTrigger>
                        <TabsTrigger value="fields">表单字段</TabsTrigger>
                    </TabsList>

                    {/* 商品选择器配置 */}
                    <TabsContent value="goods">
                        <GoodsSelectorsTab 
                            goodsOptions={goodsOptions}
                            selectedParentId={selectedParentId}
                            setGoodsOptions={setGoodsOptions}
                            setSelectedParentId={setSelectedParentId}
                        />
                    </TabsContent>

                    {/* 表单字段配置 */}
                    <TabsContent value="fields">
                        <FormFieldsTab 
                            fields={fields}
                            openPanels={openPanels}
                            setFields={setFields}
                            setOpenPanels={setOpenPanels}
                        />
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 