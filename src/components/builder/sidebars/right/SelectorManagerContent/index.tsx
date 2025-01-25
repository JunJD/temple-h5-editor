import { SelectorsResultProps, useEditorMaybe } from "@grapesjs/react";
import { X, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SelectorManagerContent({
  selectors,
  selectedState,
  states,
  targets,
  setState,
  addSelector,
  removeSelector,
}: Omit<SelectorsResultProps, "Container">) {
  const [inputVal, setInputVal] = useState("");
  const editor = useEditorMaybe();
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  // 处理回车键添加类名
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 如果是在输入法编辑状态，不处理回车键
    if ((e as any).isComposing) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const newClasses = inputVal.trim().split(/\s+/).filter(Boolean);
      const currentClasses = selectors.map(s => s.getLabel());
      
      // 找出新增的类名
      const classesToAdd = newClasses.filter(c => !currentClasses.includes(c));
      
      // 只添加新的类名
      classesToAdd.forEach(c => {
        addSelector({ name: c, label: c, type: 1 });
      });

      // 清空输入框
      setInputVal('');
    }
  };

  // 当状态改变时，需要更新选择器
  const handleStateChange = (value: string) => {
    setState(value);
    
    // 获取当前的类名并重新添加
    const currentClasses = selectors.map(s => s.getLabel());
    selectors.forEach(s => removeSelector(s));
    currentClasses.forEach(c => addSelector(c));
  };

  const targetStr = targets.join(", ");

  // 只在目标组件改变时更新输入值
  useEffect(() => {
    const classNames = selectors.map(s => s.getLabel()).join(" ");
    setInputVal(classNames ? `${classNames} ` : "");
  }, [targetStr]);

  // 添加刷新处理函数
  const handleRefresh = (mode: 'id-class' | 'class-only') => {
    if (!targets[0]) return;
    
    const target = editor?.getSelected();
    if (!target) return;

    const styles = target.getStyle();
    const componentId = target.getId();
    
    // 清除组件样式
    target.setStyle({});
    
    // 获取或创建类选择器
    const currentClasses = selectors.map(s => s.getLabel());
    if (currentClasses.length === 0) {
      // 如果没有类名，添加一个默认的
      addSelector({ name: 'shared-style', label: 'shared-style', type: 1 });
      currentClasses.push('shared-style');
    }
    
    // 根据模式构建选择器
    const classSelector = currentClasses.map(c => `.${c}`).join('');
    const selector = mode === 'id-class' 
      ? `#${componentId}${classSelector}` 
      : classSelector;
    
    editor?.Css.setRule(selector, styles);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">状态</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="将当前样式提取为可复用样式"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleRefresh('id-class')}>
                仅应用于当前组件
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRefresh('class-only')}>
                应用于所有使用相同类名的组件
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Select
          value={selectedState}
          onValueChange={handleStateChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="默认状态" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id.toString()}>
                {state.getLabel()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">类名</label>
        {selectors && targetStr ? (
          <Input
            placeholder="输入类名后按回车添加"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
        ) : (
          <div className="text-sm text-muted-foreground">请选择一个组件</div>
        )}
      </div>

      {selectors[0] && (
        <div className="flex flex-wrap gap-1.5">
          {selectors.map((selector) => (
            <Badge
              key={selector.toString()}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="text-xs">{selector.getLabel()}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeSelector(selector)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}