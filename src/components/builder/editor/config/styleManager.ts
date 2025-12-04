import { capitalize } from '@/lib/utils';
import parseBoxShadow from '@/lib/parsers/boxShadow';
import functionName from '@/lib/parsers/functionName';
import { BackgroundType, PROPERTY_BG_IMAGE, PROPERTY_BG_TYPE, PROPERTY_IMAGE } from "@/components/builder/sidebars/right/StyleManagerContent/SectorBackground";
import { parseGradient } from '@/components/builder/utils/parseGradient';

const overflowProps = {
    type: 'select',
    options: ['visible', 'hidden', 'scroll', 'auto'].map(id => ({ id })),
    default: 'visible'
  };

const unitsPercent = ['%'];

const unitsTime = ['s', ' '];

const unitsAngle = ['deg', 'rad', 'grad'];

const unitsSize = ['px', '%', 'em', 'rem', 'vw', 'vh'];

const strToOption = (id: string) => ({ id, label: id.split('-').map(capitalize).join(' ') });

const fromStyleFnStack = (property: string) => {
  const nameProp = `${property}-name`;
  const valueProp = `${property}-value`;

 return (style: Record<string, string>, { separatorLayers }: any) => {
  const filter = style[property] || '';
  return filter ? filter.split(separatorLayers).map(input => {
    const { name, value } = functionName(input);
    const values = { [nameProp]: name, [valueProp]: value };
    return values;
  }) : [];
 }
}

const toStyleFnStack = (property: string, defValue = '') => {
  const nameProp = `${property}-name`;
  const valueProp = `${property}-value`;

  return (values: Record<string, string>, { name }: any) => {
    return { [name]: `${values[nameProp]}(${values[valueProp] || defValue})` };
  }
};

const get2DimProp = (property: string, { x, y, mergable }: any = {}) => {
  const propertyX = {
    property: `${property}-x`,
    type: 'integer',
    units: unitsSize,
    ...x,
  };
  const propertyY = {
    property: `${property}-y`,
    type: 'integer',
    units: unitsSize,
    ...y,
  };

  return {
    property,
    type: 'composite',
    properties: [
      propertyX,
      propertyY,
    ],
    ...(mergable && {
      fromStyle(style: Record<string, string>, { name, separator, property }: any) {
        const [propX, propY] = property.getProperties();
        const [valueX, valueY] = (style[name] || '').split(separator);
        return {
          [propX.getId()]: style[propX.getName()] || valueX || '',
          [propY.getId()]: style[propY.getName()] || valueY || valueX || '',
        }
      },
      toStyle(values: Record<string, string>, { name, property }: any) {
        const [propX, propY] = property.getProperties();
        const valueX = values[propX.getId()];
        const valueY = values[propY.getId()];

        return {
          [name]: valueX === valueY ? valueX : `${valueX} ${valueY}`,
        }
      },
    })
  };
}

/**
 * Handle updates of type/value properties (eg. when the layer changes)
 */
const handleTypeChange = (valueProp: string) => {
  return ({ property, to }: any) => {
    if (to.value) {
      const option = property.getOption();
      const propToUp = property.getParent().getProperty(valueProp);
      const unit = propToUp.getUnit();
      const props = {
        units: option.units || [],
        min: option.min,
        max: option.max,
        unit: '',
      };
      if (!unit || props?.units.indexOf(unit) < 0) {
        props.unit = props?.units[0] || '';
      }
      propToUp.up(props);
    }
  };
}

const getFilterProp = (property = 'filter') => {
  const nameProp = `${property}-name`;
  const valueProp = `${property}-value`;
  return {
    property,
    type: 'stack',
    layerSeparator: ' ',
    fromStyle(style: Record<string, string>, { separatorLayers }: any) {
      const filter = style[property] || '';
      return filter ? filter.split(separatorLayers).map(input => {
        const { name, value } = functionName(input);
        const values = { [nameProp]: name, [valueProp]: value };
        return values;
      }) : [];
    },
    toStyle(values: Record<string, string>, { name }: any) {
      return { [name]: `${values[nameProp]}(${values[valueProp] || '0'})` };
    },
    properties: [
      {
        property: nameProp,
        type: 'select',
        default: 'blur',
        options: [
          { id: 'blur', label: '模糊', min: 0, units: ['px', 'em', 'rem', 'vw', 'vh'] },
          { id: 'brightness', label: '亮度', min: 0, units: ['%'] },
          { id: 'contrast', label: '对比度', min: 0, units: ['%'] },
          { id: 'grayscale', label: '灰度',  min: 0, max: 100, units: ['%'] },
          { id: 'hue-rotate', label: '色相旋转', min: 0, max: 360, units: ['deg', 'rad', 'grad'] },
          { id: 'invert', label: '反色', min: 0, max: 100, units: ['%'] },
          { id: 'saturate', label: '饱和度', min: 0, units: ['%'] },
          { id: 'sepia', label: '褐色', min: 0, max: 100, units: ['%'] },
        ],
        onChange: handleTypeChange(valueProp),
      },
      {
        property: valueProp,
        type: 'integer',
      },
    ]
  }
};


const getLayerFromBgImage = (imagePart: string) => {
  const result: Record<string, any> = {
    [PROPERTY_BG_IMAGE]: imagePart,
  };

  if (imagePart.indexOf('url(') > -1) {
    result[PROPERTY_BG_TYPE] = BackgroundType.Image;
  } else if (imagePart.indexOf('gradient(') > -1) {
    const parsed = parseGradient(imagePart);
    const stops = parsed.colorStops;
    const isLinear = parsed.type.indexOf('linear') >= 0;

    if (stops.length === 2 && isLinear && (stops[0].color === stops[1].color)) {
      result[PROPERTY_BG_TYPE] = BackgroundType.Color;
    }
  } else {
    result[PROPERTY_BG_TYPE] = BackgroundType.Color;
  }

  return result;
};


export const styleManager = {
  sectors: [
    {
      id: 'layout',
      name: '布局',
      properties: [
          { extend: 'display' },
          {
            extend: 'flex-direction',
            name: '方向',
            type: 'radio',
            default: 'row',
          }, {
            extend: 'justify-content',
            type: 'radio',
            default: 'flex-start',
          }, {
            extend: 'align-items',
            type: 'radio',
            default: 'stretch',
          },
          get2DimProp('gap', {
            x: { property: 'row-gap', min: 0, default: '0' },
            y: { property: 'column-gap', min: 0, default: '0' },
            mergable: true,
          }),
          { extend: 'flex-wrap' },
          { extend: 'align-content' },
          { extend: 'align-self'},
          { extend: 'order'},
          {
            property: 'flex',
            type: 'composite',
            // detached: true,
            properties: [
              {
                type: 'integer',
                property: 'flex-grow',
                default: '0',
                min: 0,
              },
              {
                type: 'integer',
                property: 'flex-shrink',
                default: '0',
                min: 0,
              },
              {
                type: 'integer',
                property: 'flex-basis',
                fixedValues: ['auto'],
                default: 'auto',
                units: unitsSize,
                min: 0,
              },
            ],
          }
        ],
      }, {
        id: 'size',
        name: '尺寸',
        properties: [
          { extend: 'width'},
          { extend: 'min-width'},
          { extend: 'max-width'},
          { extend: 'height'},
          { extend: 'min-height'},
          { extend: 'max-height'},
        ],
      }, {
        id: 'space',
        name: '间距',
        properties: [
          {
            extend: 'padding',
            detached: true,
          },
          {
            extend: 'margin',
            detached: true,
          },
        ]
      }, {
        id: 'position',
        name: '位置',
        properties: [
          {
            extend: 'position',
            options: [
              { id: 'static', label: '静态' },
              { id: 'relative', label: '相对' },
              { id: 'absolute', label: '绝对' },
              { id: 'fixed', label: '固定' },
              { id: 'sticky', label: '粘性' },
            ],
            onChange({ opts, property }: any) {
              if (opts.__clear) {
                const clearPositionProps = { top: '', right: '', bottom: '', left: '', 'z-index': '' };
                property.__upTargetsStyle(clearPositionProps, opts);
              }
            }
          },
          { extend: 'top' },
          { extend: 'right' },
          { extend: 'bottom' },
          { extend: 'left' },
          {
            extend: 'z-index',
            type: 'integer',
            default: '0',
          },
        ],
      }, {
        id: 'typography',
        name: '文本',
        properties: [
          { extend: 'color', name: '颜色' },
          { extend: 'font-size', name: '字体大小' },
          { extend: 'font-weight', name: '字体粗细' },
          { extend: 'line-height', name: '行高', min: 0 },
          { extend: 'letter-spacing', name: '字间距' },
          { extend: 'text-align', name: '对齐方式' },
          {
            extend: 'text-decoration',
            name: '文本装饰',
            type: 'select',
            default: 'none',
            options: [
              { id: 'none', label: '无' },
              { id: 'underline', label: '下划线' },
              { id: 'overline', label: '上划线' },
              { id: 'line-through', label: '删除线' },
            ],
          },
          {
            property: 'text-align-last',
            name: '文字铺满',
            type: 'select',
            default: 'auto',
            options: [
              { id: 'auto', label: '自动' },
              { id: 'justify', label: '铺满一行' },
              { id: 'start', label: '左对齐' },
              { id: 'end', label: '右对齐' },
              { id: 'center', label: '居中' },
            ],
          },
          {
            extend: 'text-transform',
            name: '大小写转换',
            type: 'select',
            default: 'none',
            options: [
              { id: 'none', label: '无' },
              { id: 'capitalize', label: '首字母大写' },
              { id: 'uppercase', label: '全部大写' },
              { id: 'lowercase', label: '全部小写' },
            ],
          },
          {
            extend: 'white-space',
            name: '空白符处理',
            type: 'select',
            default: 'normal',
            options: [
              { id: 'normal', label: '正常' },
              { id: 'nowrap', label: '不换行' },
              { id: 'pre', label: '保留格式' },
              { id: 'pre-wrap', label: '保留换行' },
              { id: 'pre-line', label: '合并空格' },
              { id: 'break-spaces', label: '保留空格' },
            ],
          }
          // text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
          // List of default fonts: https://stackoverflow.com/a/62755574
          //  Safe webfonts: https://web.mit.edu/jmorzins/www/fonts.html#sans-serif
          //  List per platform: https://granneman.com/webdev/coding/css/fonts-and-formatting/default-fonts
        ],
      }, {
        id: 'borders',
        name: '边框',
        properties: [
          {
            extend: 'border-radius',
            detached: true,
          },
          {
            extend: 'border-width',
            type: 'composite',
            detached: true,
            properties: [
              'border-top-width',
              'border-right-width',
              'border-bottom-width',
              'border-left-width',
            ].map(prop => ({
              type: 'integer',
              property: prop,
              default: '0',
              units: unitsSize,
            }))
          },
          {
            extend: 'border-style',
            type: 'composite',
            detached: true,
            properties: [
              'border-top-style',
              'border-right-style',
              'border-bottom-style',
              'border-left-style',
            ].map(prop => ({
              type: 'select',
              property: prop,
              default: 'none',
              options: [
                { id: 'none', label: '无' },
                { id: 'solid', label: '实线' },
                { id: 'dotted', label: '点线' },
                { id: 'dashed', label: '虚线' },
                { id: 'double', label: '双线' },
                { id: 'groove', label: '槽线' },
                { id: 'ridge', label: '脊线' },
                { id: 'inset', label: '内嵌' },
                { id: 'outset', label: '外嵌' },
              ]
            }))
          },
          {
            extend: 'border-color',
            type: 'composite',
            detached: true,
            properties: [
              'border-top-color',
              'border-right-color',
              'border-bottom-color',
              'border-left-color',
            ].map(prop => ({
              type: 'color',
              property: prop,
              default: 'currentColor',
            }))
          },
        ],
      }, {
        id: 'effects',
        name: '效果',
        properties: [
          {
            property: 'opacity',
            type: 'integer',
            min: 0,
            max: 100,
            default: '100',
            units: ['%'],
          },
          {
            property: 'mix-blend-mode',
            type: 'select',
            default: 'normal',
            options: [
              { id: 'normal', label: '正常' },
              { id: 'multiply', label: '正片叠底' },
              { id: 'screen', label: '屏幕' },
              { id: 'overlay', label: '叠加' },
              { id: 'darken', label: '变暗' },
              { id: 'lighten', label: '变亮' },
              { id: 'color-dodge', label: '颜色减淡' },
              { id: 'color-burn', label: '颜色加深' },
              { id: 'hard-light', label: '强光' },
              { id: 'soft-light', label: '柔光' },
              { id: 'difference', label: '差值' },
              { id: 'exclusion', label: '排除' },
              { id: 'hue', label: '色相' },
              { id: 'saturation', label: '饱和度' },
              { id: 'color', label: '颜色' },
              { id: 'luminosity', label: '亮度' },
            ]
          },
          { extend: 'cursor' },
          get2DimProp('overflow', {
            x: overflowProps,
            y: overflowProps,
            mergable: true,
          }),
          {
            extend: 'box-shadow',
            fromStyle(style: Record<string, string>, { separatorLayers }: any) {
              const input = style['box-shadow'] || '';
              const result = input ? input.split(separatorLayers).map(value => {
                const { x, y, blur, spread, inset, color } = parseBoxShadow(value);
                return {
                  'box-shadow-h': x,
                  'box-shadow-v': y,
                  'box-shadow-blur': blur,
                  'box-shadow-spread': spread,
                  'box-shadow-color': color,
                  'box-shadow-type': inset ? 'inset' : '',
                };
              }) : [];
              return result;
            },
          },
          {
            extend: 'text-shadow',
            fromStyle(style: Record<string, string>, { separatorLayers }: any) {
              const input = style['text-shadow'] || '';
              const result = input ? input.split(separatorLayers).map(value => {
                const { x, y, blur, color } = parseBoxShadow(value);
                return {
                  'text-shadow-h': x,
                  'text-shadow-v': y,
                  'text-shadow-blur': blur,
                  'text-shadow-color': color,
                };
              }) : [];
              return result;
            },
          },
          getFilterProp(),
          getFilterProp('backdrop-filter'),
          {
            property: 'transition',
            type: 'stack',
            layerLabel: (l: any, { values: v }: any) => `${capitalize(v['transition-property'])}: ${v['transition-duration']}`,
            properties: [
              {
                property: 'transition-property',
                type: 'select',
                default: 'opacity',
                options: [
                  // Size
                  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                  // Layout
                  'padding', 'margin',
                  // Typography
                  'color', 'font-size', 'line-height', 'letter-height',
                  // Border
                  'border', 'border-radius', // 'border-color', 'border-width',
                  // Background
                  'background',
                  // Effects
                  'opacity', 'box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'transform',
                  // Extra
                  'all',
                ].map(strToOption),
              },
              {
                property: 'transition-duration',
                type: 'integer',
                default: '1s',
                unit: unitsTime[0],
                units: unitsTime,
                min: 0,
              },
              {
                property: 'transition-timing-function',
                type: 'select',
                default: 'ease',
                options: [
                  { id: 'ease', label: '平滑'},
                  { id: 'ease-in', label: '平滑-进入'},
                  { id: 'ease-in-out', label: '平滑-进入-退出'},
                  { id: 'ease-out', label: '平滑-退出'},
                  { id: 'linear', label: '线性'},
                ],
              },
              {
                property: 'transition-delay',
                type: 'integer',
                default: '0s',
                unit: unitsTime[0],
                units: unitsTime,
              },
            ]
          },
          {
            property: 'transform',
            type: 'stack',
            layerSeparator: ' ',
            layerLabel: (l: any, { values, property }: any) => {
              const label = property.getProperty('transform-name').getOptionLabel(values['transform-name']);
              return `${capitalize(label)}: ${values['transform-value']}`;
            },
            fromStyle: fromStyleFnStack('transform'),
            toStyle: toStyleFnStack('transform', '0'),
            properties: [
              {
                property: 'transform-name',
                type: 'select',
                default: 'translateX',
                options: [
                  { id: 'translateX', label: '移动X', units: unitsSize },
                  { id: 'translateY', label: '移动Y', units: unitsSize },
                  { id: 'translateZ', label: '移动Z', units: unitsSize },
                  { id: 'rotateX', label: '旋转X', units: unitsAngle },
                  { id: 'rotateY', label: '旋转Y', units: unitsAngle },
                  { id: 'rotateZ', label: '旋转Z', units: unitsAngle },
                  { id: 'scale', label: '缩放', units: unitsPercent },
                  { id: 'scaleX', label: '缩放X', units: unitsPercent },
                  { id: 'scaleY', label: '缩放Y', units: unitsPercent },
                  { id: 'scaleZ', label: '缩放Z', units: unitsPercent },
                  { id: 'skewX', label: '倾斜X', units: unitsAngle },
                  { id: 'skewY', label: '倾斜Y', units: unitsAngle },
                ],
                onChange: handleTypeChange('transform-value'),
              },
              {
                property: 'transform-value',
                type: 'integer',
                default: '0',
              },
            ]
          },
          get2DimProp('transform-origin', {
            x: { default: '50%' },
            y: { default: '50%' },
          }),
          {
            property: 'backface-visibility',
            type: 'radio',
            default: 'visible',
            options: [
              { id: 'visible', label: '可见' },
              { id: 'hidden', label: '隐藏' },
            ],
          },
          {
            // Activate on parent element to enable 3D transforms on all of its children
            property: 'perspective',
            type: 'integer',
            min: 0,
            default: 'none',
            units: unitsSize,
          },
          get2DimProp('perspective-origin', {
            x: { default: '50%' },
            y: { default: '50%' },
          }),
          {
            property: 'transform-style',
            type: 'radio',
            default: 'flat',
            options: [
              { id: 'flat', label: '2D' },
              { id: 'preserve-3d', label: '3D' },
            ],
          },
        ],
      },{
        id: 'background',
        name: '背景',
        properties: [
          // Stack of backgrounds (Color - Gradient - Image/Patterns)
          {
            property: 'background',
            type: 'stack',
            layerSeparator: /(?<!\(.*[^)]),(?![^(]*\))/,
            layerJoin: ', ',
            // 1. "simple" -> 1
            // 2. "simple, simple" -> 2
            // 3. "rgba(1px, 2px, 3px)" -> 1
            // 4. "rgba(1px, 2px, 3px), rgba(1px, 2px, 3px)" -> 2
            // 5. "rgba(1px, rgba(11px, 22px, 33px), 3px), rgba(1px, rgba(11px, 22px, 33px), 3px)" -> 2
            // 6. "rgba(1px, rgba(11px, 22px, 33px), 3px)" -> 1
            // 7a. "linear(rgb(1, 2, 3, 5), rgb(1, 2, 3, 5))" -> 1 || "/(?<!\(.*[^)]),(?![^(]*\))/"
            // 7b. "linear(rgb(1, 2, 3, 5) 1px, rgb(1, 2, 3, 5))" -> 1
            // /(?<!\(*[^)]),(?![^(]*\))/ > fails 2.
            // /(?<!\(.*[^)]),(?![^(]*\))/ > fails 7a.
            detached: true,
            layerLabel: (l: any, { values, property }: any) => {
              return property.getProperty(PROPERTY_BG_TYPE).getOptionLabel(values[PROPERTY_BG_TYPE]);
            },
            toStyle(values: Record<string, string>, { name }: any) {
              const type = values[PROPERTY_BG_TYPE];
              let image = values[PROPERTY_BG_IMAGE];

              // Guard against undefined/empty values when switching types
              if (type === 'color') {
                const img = typeof image === 'string' ? image : '';
                // Only convert to gradient when we actually have a color-like value
                if (img && img !== 'none' && img.indexOf('linear-gradient') < 0) {
                  image = `linear-gradient(${img} 1%, ${img} 100%)`;
                }
              }

              const result = {
                ...values,
                [PROPERTY_BG_IMAGE]: image ?? '',
              };

              return result;
            },
            fromStyle(style: Record<string, string>, { property, name, separatorLayers }: any) {
              const sep = separatorLayers;
              const props = property.getProperties();
              let layers: any = [];

              if (style[PROPERTY_IMAGE]) {
                // Get layers from the `background-image` property
                layers = property.__splitStyleName(style, PROPERTY_IMAGE, sep).map(getLayerFromBgImage);

                // Update layers by inner properties
                props.forEach((prop: any) => {
                  const id = prop.getId();
                  const propName = prop.getName();
                  if (propName === PROPERTY_IMAGE) return;
                  property.__splitStyleName(style, propName, sep)
                    .map((value: string) => ({ [id]: value || prop.getDefaultValue() }))
                    .forEach((inLayer: any, i: number) => {
                      layers[i] = layers[i] ? { ...layers[i], ...inLayer } : inLayer;
                    });
                });
              } else if (style[name]) {
                // Partial support for the `background` property
                // eslint-disable-next-line
                layers = property.__splitStyleName(style, name, /(?![^)(]*\([^)(]*?\)\)),(?![^\(]*\))/)
                  .map((value: string) => value.substring(0, value.lastIndexOf(')') + 1))
                  .map(getLayerFromBgImage);
              }

              return layers;
            },
            properties: [
              {
                property: PROPERTY_BG_TYPE,
                type: 'radio',
                default: 'image',
                options: [
                  { id: BackgroundType.Image },
                  { id: BackgroundType.Color },
                ]
              },
              {
                // Specs: https://www.w3.org/TR/css-images-3/
                // <url> | <gradient> (https://github.com/rafaelcaricio/gradient-parser)
                // <gradient> = <linear-gradient()> | <repeating-linear-gradient()> | <radial-gradient()> | <repeating-radial-gradient()>
                // <linear-gradient()> = linear-gradient([ <angle> | to <side-or-corner> ]? , <color-stop-list>)
                // <radial-gradient()> = radial-gradient([ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list>
                //    radial-gradient(5em circle at top left, yellow, blue)
                // <color-stop-list> = <linear-color-stop> , [ <linear-color-hint>? , <linear-color-stop> ]
                //  fn(red 40%, white) | fn(white calc(-25px + 50%), blue)
                // Regex
                // <side-or-corner>: /^to (left (top|bottom)|right (top|bottom)|top (left|right)|bottom (left|right)|left|right|top|bottom)/i,
                // <ending-shape>: /^circle|ellipse/i,
                // <size>: /^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/, // | <length> | <length-percentage>{2}
                // <position>: /^at/ // position: at top left, at 20px, at 10% 15%
                property: PROPERTY_BG_IMAGE,
                default: 'none', // url(), gradient, none
              },
              {
                property: 'background-position',
                type: 'composite',
                // default: '0%', // left | center | right | top | bottom
                properties: [
                  'background-position-x',
                  'background-position-y',
                ].map(prop => ({
                  type: 'integer',
                  property: prop,
                  units: unitsSize,
                  default: '0px',
                }))
              },
              {
                property: 'background-size',
                type: 'select',
                default: 'auto',
                options: [
                  { id: 'cover', label: '填充' },
                  { id: 'contain', label: '包含' },
                  { id: '100% 100%', label: '拉伸' },
                  { id: 'auto', label: '自动' },
                  { id: 'custom', label: '自定义' },
                ]
              },
              {
                property: 'background-repeat', // box (x, y)
                default: 'repeat',
                type: 'select',
                options: [ // background-repeat-x background-repeat-x
                  { id: 'repeat', label: '重复' },
                  { id: 'repeat-x', label: '重复X' },
                  { id: 'repeat-y', label: '重复Y' },
                  { id: 'no-repeat', label: '不重复' },
                  { id: 'space', label: '空间' },
                  { id: 'round', label: '圆角' },
                ]
              },
              {
                property: 'background-attachment',
                default: 'scroll',
                type: 'select',
                options: [
                  { id: 'scroll', label: '滚动' },
                  { id: 'fixed', label: '固定' },
                ]
              },
              {
                property: 'background-origin',
                default: 'padding-box',
                type: 'select',
                options: [
                  { id: 'padding-box', label: '填充框' },
                  { id: 'border-box', label: '边框框' },
                  { id: 'content-box', label: '内容框' },
                ]
              },
            ]
          },
          {
            property: 'background-color',
            type: 'color',
            default: 'none',
          },
          {
            property: 'background-clip',
            default: 'border-box',
            type: 'select',
            options: [
              { id: 'border-box', label: '边框框' },
              { id: 'padding-box', label: '填充框' },
              { id: 'content-box', label: '内容框' },
              { id: 'text', label: '文本' },
            ],
            onChange({ to, property, opts }: any) {
              const { value } = to;
              if (value !== undefined) {
                const isText = value === 'text';
                property.__upTargetsStyle({
                  '-webkit-background-clip': isText ? value : '',
                  '-webkit-text-fill-color': isText ? 'transparent' : '',
                }, opts);
              }
            },
          },
        ],
      }
    ],
  }
