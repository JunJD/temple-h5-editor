export const LINKAGE_FORM_TYPES = {
    'input-group': 'input-group',
    'input-group-text': 'input-group-text',
    'input-group-rich-text': 'input-group-rich-text',
    'input-number-group': 'input-number-group',
    // 级联选择器
    'cascade-selector': 'cascade-selector'
} as const;

// 预设配置
export const PRESETS = {
    // 商品
    goods: {
        label: '商品：',
        suffix: '',
        type: 'text'
    },
    number: {
        label: '数量：',
        suffix: '',
        type: 'number'
    },
    amount: {
        label: '金额：',
        suffix: '元',
        type: 'number'
    },
    name: {
        label: '姓名：',
        suffix: '',
        type: 'text'
    }
} as const;

export const DEFAULT_LABEL = '数量';
export const DEFAULT_SUFFIX = '个';
export const DEFAULT_MIN = 1;
export const DEFAULT_MAX = 999;
export const DEFAULT_STEP = 1;

export { CASCADE_SELECTOR_TYPES } from './form-item/cascade-selector/constants'; 