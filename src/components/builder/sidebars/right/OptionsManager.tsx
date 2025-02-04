import { Trait } from 'grapesjs'
import { useState, useEffect, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrashIcon } from 'lucide-react'
import { DEFAULT_OPTION_IMAGE } from '@/plugins/v5/linkage-form/form-item/cascade-selector/constants'

interface OptionsManagerProps {
    trait: Trait;
}

export function OptionsManager({ trait }: OptionsManagerProps) {
    const component = trait.target;
    const isLevel2 = trait.get('attributes')?.isLevel2 as boolean;
    
    // 使用 reducer 来强制更新组件
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    // 使用 state 来管理 options，确保组件能响应变化
    const [options, setOptions] = useState(() => component.get('options'));
    const [selectedParentId, setSelectedParentId] = useState(
        isLevel2 ? Object.keys(options.level2)[0] : null
    );

    // 监听组件 options 变化
    useEffect(() => {
        const handleOptionsChange = () => {
            const newOptions = component.get('options');
            console.log('Options changed:', newOptions);
            setOptions(newOptions);
            forceUpdate();
        };

        component.on('change:options', handleOptionsChange);
        return () => {
            component.off('change:options', handleOptionsChange);
        };
    }, [component]);

    const getCurrentOptions = () => {
        if (isLevel2 && selectedParentId) {
            return options.level2[selectedParentId] || [];
        }
        return options.level1;
    };

    const handleAddOption = () => {
        const newOptions = structuredClone(options);
        console.log('Before add:', newOptions);

        if (isLevel2 && selectedParentId) {
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
            const newOption = {
                id: `l1_${Date.now()}`,
                label: '新选项',
                value: `option_${Date.now()}`,
                image: DEFAULT_OPTION_IMAGE
            };
            newOptions.level1.push(newOption);
            newOptions.level2[newOption.id] = [];
        }

        console.log('After add:', newOptions);
        component.set('options', newOptions, { silent: false });
        setOptions(newOptions);
    };

    const handleUpdateOption = (optionId: string, field: string, value: string | number) => {
        const newOptions = structuredClone(options);
        if (isLevel2 && selectedParentId) {
            const optionIndex = newOptions.level2[selectedParentId].findIndex(opt => opt.id === optionId);
            if (optionIndex !== -1) {
                newOptions.level2[selectedParentId][optionIndex] = {
                    ...newOptions.level2[selectedParentId][optionIndex],
                    [field]: value
                };
            }
        } else {
            const optionIndex = newOptions.level1.findIndex(opt => opt.id === optionId);
            if (optionIndex !== -1) {
                newOptions.level1[optionIndex] = {
                    ...newOptions.level1[optionIndex],
                    [field]: value
                };
            }
        }
        component.set('options', newOptions, { silent: false });
        setOptions(newOptions);
    };

    const handleDeleteOption = (optionId: string) => {
        const newOptions = structuredClone(options);
        if (isLevel2 && selectedParentId) {
            newOptions.level2[selectedParentId] = newOptions.level2[selectedParentId].filter(
                opt => opt.id !== optionId
            );
        } else {
            newOptions.level1 = newOptions.level1.filter(opt => opt.id !== optionId);
            delete newOptions.level2[optionId];
        }
        component.set('options', newOptions, { silent: false });
        setOptions(newOptions);
    };

    return (
        <div className="space-y-4">
            {isLevel2 && (
                <Select
                    value={selectedParentId || ''}
                    onValueChange={setSelectedParentId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="选择一级选项" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.level1.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <div className="space-y-2">
                {getCurrentOptions().map(option => (
                    <div key={option.id} className="flex gap-2 items-center">
                        <Input
                            value={option.label}
                            onChange={(e) => handleUpdateOption(option.id, 'label', e.target.value)}
                            placeholder="选项标签"
                        />
                        {isLevel2 ? (
                            <Input
                                type="number"
                                value={option.value}
                                onChange={(e) => handleUpdateOption(option.id, 'value', Number(e.target.value))}
                                placeholder="选项值"
                            />
                        ) : (
                            <>
                                <Input
                                    value={option.value}
                                    onChange={(e) => handleUpdateOption(option.id, 'value', e.target.value)}
                                    placeholder="选项值"
                                />
                                <Input
                                    value={option.image}
                                    onChange={(e) => handleUpdateOption(option.id, 'image', e.target.value)}
                                    placeholder="图片地址"
                                />
                            </>
                        )}
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteOption(option.id)}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button onClick={handleAddOption}>
                添加选项
            </Button>
        </div>
    );
}
