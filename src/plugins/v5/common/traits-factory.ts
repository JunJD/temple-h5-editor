import { TraitProperties } from "grapesjs";

// 选项类型定义
interface SelectOption {
    value: string;
    name: string;
}

// Traits工厂类
export class BaseTraitsFactory {
    // 创建trait选项
    public static createTraitOptions(options: SelectOption[]): any[] {
        return options.map(opt => ({
            id: opt.value || 'default',
            label: opt.name,
            name: opt.value,
            value: opt.value
        }));
    }

    // 创建基础select trait配置
    public static createSelectTrait(
        label: string,
        name: string,
        options: SelectOption[],
        changeProp: boolean = false
    ): Partial<TraitProperties> {
        return {
            type: 'select',
            label,
            name,
            options: this.createTraitOptions(options),
            changeProp
        };
    }
}