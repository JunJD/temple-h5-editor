export const CASCADE_SELECTOR_TYPES = {
    'cascade-selector': 'cascade-selector',
    'options-group': 'options-group',
    'option': 'option'
} as const;

// 默认图片
export const DEFAULT_OPTION_IMAGE = 'https://tuchuang.wxsushang.com/2021/09/17/3631055a99ef7.png';

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