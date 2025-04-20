import { FormField } from '@/schemas';
import { CascadeSelectorOptions } from '@/plugins/v5/linkage-form/form-item/cascade-selector/constants';

// 表单字段验证接口
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

// 验证字段基本信息
export function validateFields(fields: FormField[]): ValidationResult {
    // 验证是否有空字段
    const invalidFields = fields.filter(field => !field.name || !field.label);
    if (invalidFields.length > 0) {
        return {
            valid: false,
            error: "请填写完整的字段名和标签"
        };
    }

    // 检查字段名唯一性
    const names = fields.map(f => f.name);
    if (new Set(names).size !== names.length) {
        return {
            valid: false,
            error: "字段名不能重复"
        };
    }

    // 检查字段名格式（只允许字母、数字和下划线）
    const invalidNameFields = fields.filter(field => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name));
    if (invalidNameFields.length > 0) {
        return {
            valid: false,
            error: "字段名只能包含字母、数字和下划线，且必须以字母开头"
        };
    }

    return { valid: true };
}

// 验证商品选择器
export function validateGoodsOptions(goodsOptions: CascadeSelectorOptions): ValidationResult {
    // 检查级联选择器选项
    if (goodsOptions.level1.length === 0) {
        return {
            valid: false,
            error: "商品选择器至少需要一个一级选项"
        };
    }

    return { valid: true };
} 