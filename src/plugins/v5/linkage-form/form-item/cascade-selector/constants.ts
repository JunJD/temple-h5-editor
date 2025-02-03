export const CASCADE_SELECTOR_TYPES = {
    'cascade-selector': 'cascade-selector',
    'options-group': 'options-group',
    'option': 'option'
} as const;

// 默认图片
export const DEFAULT_OPTION_IMAGE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+`;

// 默认选项数据
export const DEFAULT_OPTIONS = {
    level1: [
        {
            label: '花果供佛',
            image: 'https://tuchuang.wxsushang.com/2021/09/17/3631055a99ef7.png'
        },
        {
            label: '敬香供灯',
            image: 'https://tuchuang.wxsushang.com/2021/09/01/a3499af550194.jpg'
        },
        {
            label: '供斋纳福',
            image: 'http://tuchuang.wxsushang.com/2021/07/21/be24d9839ec7a.jpg'
        }
    ],
    level2: {
        '1': [
            { label: '1盆' },
            { label: '1殿堂' },
            { label: '全寺' }
        ],
        '2': [
            { label: '1天' },
            { label: '3天' },
            { label: '7天' },
            { label: '15天' },
            { label: '30天' },
            { label: '100天' }
        ],
        '3': [
            { label: '1天' },
            { label: '3天' },
            { label: '7天' },
            { label: '15天' },
            { label: '30天' },
            { label: '100天' }
        ]
    }
}; 