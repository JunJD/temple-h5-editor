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
import { PlusCircle, Trash2, ChevronDown } from 'lucide-react';
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

interface FormField {
    name: string;
    label: string;
    type: keyof typeof LINKAGE_FORM_TYPES;
    required?: boolean;
    suffix?: string;
    expression?: string;
    defaultValue?: string | number;
    placeholder?: string;
}

interface FormConfig {
    fields: FormField[];
}

interface FormConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (config: FormConfig) => void;
    initialConfig: FormConfig;
}

export function FormConfigDialog({
    open,
    onOpenChange,
    onSave,
    initialConfig
}: FormConfigDialogProps) {
    const [fields, setFields] = React.useState<FormField[]>(initialConfig.fields);
    const [openPanels, setOpenPanels] = React.useState<number[]>([]);
    const { toast } = useToast();

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
        if (fields[index].name === 'amount') return;
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

    const handleSave = () => {
        // 添加字段验证
        const invalidFields = fields.filter(field => !field.name || !field.label);
        if (invalidFields.length > 0) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: "请填写完整的字段名和标签"
            });
            return;
        }
        
        // 检查字段名唯一性
        const names = fields.map(f => f.name);
        if (new Set(names).size !== names.length) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: "字段名不能重复"
            });
            return;
        }

        // 检查字段名格式（只允许字母、数字和下划线）
        const invalidNameFields = fields.filter(field => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name));
        if (invalidNameFields.length > 0) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: "字段名只能包含字母、数字和下划线，且必须以字母开头"
            });
            return;
        }

        onSave({ fields });
        onOpenChange(false);
        
        toast({
            title: "保存成功",
            description: "表单配置已更新"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>配置表单字段</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleAddField} variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            添加字段
                        </Button>
                    </div>
                    <ScrollArea className="space-y-2 h-[500px]">
                        {fields.map((field, index) => (
                            <Collapsible
                                key={index}
                                open={openPanels.includes(index)}
                                onOpenChange={() => togglePanel(index)}
                                className="border rounded-lg"
                            >
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent">
                                    <div className="flex items-center gap-2">
                                        <ChevronDown className={cn(
                                            "h-4 w-4 transition-transform",
                                            openPanels.includes(index) && "transform rotate-180"
                                        )} />
                                        <span className="font-medium">
                                            {field.label || '未命名字段'} ({field.name || '未设置字段名'})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveField(index);
                                        }}
                                        disabled={field.name === 'amount'}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-4 space-y-4 border-t bg-accent/5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>字段名称</Label>
                                            <Input
                                                value={field.name}
                                                onChange={e => handleFieldChange(index, { name: e.target.value })}
                                                placeholder="请输入字段名称"
                                                disabled={field.name === 'amount'}
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
                                                    <SelectItem value="input-group-rich-text">文本输入框</SelectItem>
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label>表达式</Label>
                                        <ExpressionEditor
                                            value={field.expression || ''}
                                            onChange={(value) => handleFieldChange(index, { expression: value })}
                                            fields={[...fields, { name: 'goods', label: '商品', defaultValue: '1' }].filter(f => f.name && f.name !== field.name)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={field.required}
                                            onCheckedChange={(checked) => handleFieldChange(index, { required: !!checked })}
                                        />
                                        <Label>必填</Label>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </ScrollArea>
                </div>
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