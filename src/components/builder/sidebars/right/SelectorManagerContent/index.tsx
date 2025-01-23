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

    const getStateLabel = (state: string) => {
        return states.find(s => s.getName() === state)?.getLabel() || state;
    };
    
    // 计算状态
    const hasSelectors = selectors.length > 0;
    const hasComponents = components.length > 0;
    const hasSomeTarget = hasSelectors || hasComponents;
    const isTargetComponents = (cmpFirst && hasComponents) || (!cmpFirst && !hasSelectors);

    const targetState = target?.getState();
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

    const selectedTargets = Selectors.getSelectedTargets();

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
                                        key={option.value ?? '-'}
                                        value={option.value || undefined}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {hasSomeTarget ? (
                    <>
                        {/* 选择器区域 */}
                        <div className={cn(
                            "rounded-lg border p-2",
                            !isTargetComponents && "bg-accent/10"
                        )}>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <div className="flex-1 flex items-center gap-2">
                                    {hasComponents && (
                                        newTag ? (
                                            <Input
                                                autoFocus
                                                placeholder="输入选择器名称"
                                                className="h-7 text-xs"
                                                onBlur={(e) => handleAddSelector(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddSelector(e.currentTarget.value);
                                                    } else if (e.key === 'Escape') {
                                                        setNewTag(false);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setNewTag(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )
                                    )}
                                    {selectors.map((selector) => (
                                        <ClassTag
                                            key={selector.toString()}
                                            selector={selector}
                                            removable={hasComponents}
                                            toggleable={hasComponents && selectors.filter(sel => sel.getActive() || sel === selector).length > 1}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 组件区域 */}
                        <div className={cn(
                            "rounded-lg border p-2",
                            isTargetComponents && "bg-accent/10"
                        )}>
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                <div className="flex-1 flex flex-wrap gap-2">
                                    {components.map((cmp) => (
                                        <Badge
                                            key={cmp.getId()}
                                            variant="outline"
                                            className="cursor-default"
                                        >
                                            {cmp.getName()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 底部工具栏 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="outline">
                                            <Target className="h-4 w-4" />
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div>当前选择</div>
                                        <pre className="mt-1 text-xs bg-accent/20 p-1 rounded">
                                            {getTargetQuery(target)}
                                        </pre>
                                        <div className="text-xs mt-1.5">当前选择器</div>
                                    </TooltipContent>
                                </Tooltip>

                                {targetDevice?.getWidthMedia() && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="outline">
                                                <Smartphone className="h-4 w-4" />
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            设备: {targetDevice.getName()}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {targetState && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="outline">
                                                <Flame className="h-4 w-4" />
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            状态: {getStateLabel(targetState.getName())}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={toggleCssPanel}
                                className={cn(
                                    isCssPanelActive && "bg-accent"
                                )}
                            >
                                <Braces className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>未选择任何内容</p>
                        <ul className="list-disc pl-5">
                            <li>从画布中选择元素</li>
                            <li>从大纲树中选择</li>
                        </ul>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}