export const LINKAGE_FORM_TYPES = {
    'input-group': 'input-group'
} as const;

// 预设配置
export const PRESETS = {
    number: {
        label: '数量:',
        suffix: '个',
        type: 'number'
    },
    amount: {
        label: '金额:',
        suffix: '元',
        type: 'number'
    },
    name: {
        label: '姓名:',
        suffix: '',
        type: 'text'
    }
} as const;

export const DEFAULT_LABEL = '数量';
export const DEFAULT_SUFFIX = '个';
export const DEFAULT_MIN = 1;
export const DEFAULT_MAX = 999;
export const DEFAULT_STEP = 1; 