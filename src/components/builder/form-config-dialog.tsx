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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from '@/schemas';
import { CascadeSelectorOptions, DEFAULT_OPTIONS } from '@/plugins/v5/linkage-form/form-item/cascade-selector/constants';
import { Editor } from 'grapesjs';
import { useToast } from "@/hooks/use-toast";
import { FormFieldsTab } from './form-field/form-fields-tab';
import { GoodsSelectorsTab } from './form-field/goods-selectors-tab';
import { validateFields, validateGoodsOptions } from './form-field/form-validator';

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

    const handleSave = () => {
        // 验证表单字段
        const fieldsValidation = validateFields(fields);
        if (!fieldsValidation.valid) {
            toast({
                variant: "destructive",
                title: "验证错误",
                description: fieldsValidation.error
            });
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