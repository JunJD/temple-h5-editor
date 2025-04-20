import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox";
import { TrashIcon } from 'lucide-react';
import { CascadeSelectorOptions, DEFAULT_OPTION_IMAGE } from '@/plugins/v5/linkage-form/form-item/cascade-selector/constants';

interface GoodsSelectorsTabProps {
    goodsOptions: CascadeSelectorOptions;
    selectedParentId: string | null;
    setGoodsOptions: (options: CascadeSelectorOptions) => void;
    setSelectedParentId: (id: string | null) => void;
}

export function GoodsSelectorsTab({
    goodsOptions,
    selectedParentId,
    setGoodsOptions,
    setSelectedParentId
}: GoodsSelectorsTabProps) {
    // 获取当前选择器选项
    const getCurrentOptions = () => {
        if (selectedParentId && selectedParentId !== "level1") {
            return goodsOptions.level2[selectedParentId] || [];
        }
        return goodsOptions.level1;
    };

    // 添加选项
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

    // 更新选项
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

    // 删除选项
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">商品选择器配置</h3>
                <Select
                    value={selectedParentId || "level1"}
                    onValueChange={(value) => setSelectedParentId(value === "level1" ? null : value)}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="选择一级选项进行配置" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="level1">一级选项</SelectItem>
                        {goodsOptions.level1.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.label}的二级选项
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                    {getCurrentOptions().map(option => (
                        <div key={option.id} className="flex gap-2 items-center">
                            <Input
                                value={option.label}
                                onChange={(e) => handleUpdateOption(option.id, 'label', e.target.value)}
                                placeholder="选项标签"
                            />
                            {selectedParentId ? (
                                <>
                                    <Input
                                        type="number"
                                        value={option.value}
                                        onChange={(e) => handleUpdateOption(option.id, 'value', Number(e.target.value))}
                                        placeholder="选项值"
                                    />
                                    <Checkbox
                                        checked={option.editable}
                                        onCheckedChange={(checked) => handleUpdateOption(option.id, 'editable', !!checked)}
                                    />
                                </>
                            ) : (
                                <>
                                    <Input
                                        value={String(option.value)}
                                        onChange={(e) => handleUpdateOption(option.id, 'value', e.target.value)}
                                        placeholder="选项值"
                                    />
                                    <Input
                                        value={option.image || ''}
                                        onChange={(e) => handleUpdateOption(option.id, 'image', e.target.value)}
                                        placeholder="图片地址"
                                    />
                                </>
                            )}
                            <Button
                                className='px-5'
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteOption(option.id)}
                            >
                                <TrashIcon className="w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="mt-2 text-sm text-muted-foreground">
                <p>说明：对于二级选项的"允许修改金额"设置，勾选后表示用户选择该选项时可以手动修改金额字段的值。</p>
            </div>

            <Button onClick={handleAddOption}>
                添加{selectedParentId ? '二级' : '一级'}选项
            </Button>
        </div>
    );
} 