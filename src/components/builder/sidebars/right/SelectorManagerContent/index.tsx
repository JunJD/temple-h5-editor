import { SelectorsResultProps, useEditor } from '@grapesjs/react';
import {
    Smartphone,
    Braces,
    Flame,
    Palette,
    Plus,
    Tag,
    Target
} from 'lucide-react';
import type { CssRule } from 'grapesjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import ClassTag from './ClassTag';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// 获取目标选择器查询字符串
const getTargetQuery = (target?: CssRule): string => {
    let targetQuery = target?.selectorsToString();
    const targetAtRule = target?.getAtRule();
    if (targetQuery && targetAtRule) {
        targetQuery = `${targetAtRule} {\n\t${targetQuery}\n}`;
    }
    return targetQuery!;
}

export default function SelectorManager({
    selectedState,
    states,
    addSelector,
    setState,
}: SelectorsResultProps) {
    const editor = useEditor();
    const [newTag, setNewTag] = useState(false);
    const { Selectors, Styles } = editor;

    // 获取选择器和组件状态
    const cmpFirst = Selectors.getComponentFirst();
    const selectors = Selectors.getSelectedAll();
    const components = editor.getSelectedAll();
    const target = Styles.getSelected() as CssRule | undefined;
    const targetDevice = target?.getDevice();
    const targetState = target?.getState();

    // 计算状态
    const hasSelectors = selectors.length > 0;
    const hasComponents = components.length > 0;
    const hasSomeTarget = hasSelectors || hasComponents;
    const isTargetComponents = (cmpFirst && hasComponents) || (!cmpFirst && !hasSelectors);
    const targetLabel = isTargetComponents ? '组件' : '选择器';

    const resolveAddEmpty = (arr: any[]) => {
        return [...arr, {
            value: '',
            label: '未选择'
        }];
    }
    
    // 状态选项
    const stateOptions = resolveAddEmpty(states.map((s) => ({
        value: s.getName(),
        label: s.getLabel()
    })));

    // 添加新选择器的处理函数
    const handleAddSelector = (value: string) => {
        if (value) {
            addSelector(value);
            setNewTag(false);
        }
    }

    // 添加 CSS 面板切换状态
    const [isCssPanelActive, setIsCssPanelActive] = useState(false);
    const toggleCssPanel = () => setIsCssPanelActive(!isCssPanelActive);

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* 顶部工具栏 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>选择</span>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                >
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>样式目录</DialogTitle>
                                </DialogHeader>
                                {/* 这里添加样式目录的内容 */}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {target && (
                        <Select
                            value={selectedState}
                            onValueChange={setState}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                            <SelectContent>
                                {stateOptions.map(option => (
                                    <SelectItem
                                        key={option.value || '-'}
                                        value={option.value || '-'}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}