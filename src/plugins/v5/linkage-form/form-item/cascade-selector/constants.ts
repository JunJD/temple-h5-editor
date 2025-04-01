export const CASCADE_SELECTOR_TYPES = {
    'cascade-selector': 'cascade-selector',
    'options-group': 'options-group',
    'option': 'option'
} as const;

export interface OptionData {
    id: string;
    label: string;
    value: string | number;
    image?: string;
    editable?: boolean;
}

export interface CascadeSelectorOptions {
    level1: OptionData[];
    level2: {
        [parentId: string]: OptionData[];
    };
}

// 默认图片
export const DEFAULT_OPTION_IMAGE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+`;

export const DEFAULT_OPTIONS: CascadeSelectorOptions = {
    level1: [
        {
            id: 'l1_1',
            label: '花果供佛22',
            value: 'flower',
            image: DEFAULT_OPTION_IMAGE
        },
        {
            id: 'l1_2',
            label: '敬香供灯',
            value: 'light',
            image: DEFAULT_OPTION_IMAGE
        },
        {
            id: 'l1_3',
            label: '供斋纳福',
            value: 'food',
            image: DEFAULT_OPTION_IMAGE
        }
    ],
    level2: {
        'l1_1': [
            {
                id: 'l2_1_1',
                label: '1盆',
                value: 1,
                editable: false
            },
            {
                id: 'l2_1_2',
                label: '1殿堂',
                value: 2,
                editable: false
            },
            {
                id: 'l2_1_3',
                label: '全寺',
                value: 3,
                editable: false
            }
        ],
        'l1_2': [
            {
                id: 'l2_2_1',
                label: '1天',
                value: 1,
                editable: false
            },
            {
                id: 'l2_2_2',
                label: '3天',
                value: 3,
                editable: false
            },
            {
                id: 'l2_2_3',
                label: '7天',
                value: 7,
                editable: false
            }
        ],
        'l1_3': [
            {
                id: 'l2_3_1',
                label: '1天',
                value: 1,
                editable: false
            },
            {
                id: 'l2_3_2',
                label: '3天',
                value: 3,
                editable: false
            },
            {
                id: 'l2_3_3',
                label: '7天',
                value: 7,
                editable: false
            }
        ]
    }
}; 