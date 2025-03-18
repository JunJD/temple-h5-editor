'use client'

import type { Editor } from 'grapesjs';

export const typeFormatTempList = 'format-temp-list';
export const typeFormatTempItem = 'format-temp-item';

interface TraitOption {
  id: string;
  name: string;
  value: string;
}

export default function (editor: Editor) {
  const { Components } = editor;

  // 列表项组件
  Components.addType(typeFormatTempItem, {
    isComponent: el => el.classList?.contains('format-temp-item'),
    model: {
      defaults: {
        name: '列表项',
        tagName: 'li',
        droppable: false,
        classes: ['format-temp-item'],
        traits: [
          {
            type: 'select',
            name: 'textAlign',
            label: '文字对齐',
            options: [
              { id: 'left', value: 'left', name: '左对齐' },
              { id: 'center', value: 'center', name: '居中' },
              { id: 'right', value: 'right', name: '右对齐' },
            ],
            default: 'left',
          },
          {
            type: 'color',
            name: 'color',
            label: '文字颜色',
            default: '#212529',
          },
          {
            type: 'number',
            name: 'fontSize',
            label: '字体大小',
            default: 16,
            min: 12,
            max: 72,
          },
          {
            type: 'select',
            name: 'fontWeight',
            label: '字体粗细',
            options: [
              { id: '400', value: '400', name: '常规' },
              { id: '500', value: '500', name: '中等' },
              { id: '600', value: '600', name: '加粗' },
              { id: '700', value: '700', name: '粗体' },
            ],
            default: '400',
          }
        ],
        styles: `
          .format-temp-item {
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
            transition: all 0.2s ease-in-out;
          }
          .format-temp-item:hover {
            background-color: #e9ecef;
            border-color: #ced4da;
            transform: translateY(-1px);
          }
        `
      }
    }
  });

  // 列表容器组件
  Components.addType(typeFormatTempList, {
    isComponent: el => el.classList?.contains('format-temp-list'),
    model: {
      defaults: {
        name: '格式化模板列表',
        droppable: false,
        traits: [
          {
            type: 'checkbox',
            name: 'autoScroll',
            label: '自动滚动',
            default: true,
            changeProp: true,
          },
          {
            type: 'text',
            name: 'apiUrl',
            label: 'API地址',
            default: '/api/list',
            changeProp: true,
          },
          {
            type: 'rich-input',
            name: 'template',
            label: '格式化模板',
            default: '<span class="temp-item-name">${name}</span>: <span class="temp-item-value">${value}</span>',
            changeProp: true,
            attributes: {
              mentionItems: [ 'amount', 'name' ]
            }
          },
          {
            type: 'select',
            name: 'textAlign',
            label: '文字对齐',
            options: [
              { id: 'left', value: 'left', name: '左对齐' },
              { id: 'center', value: 'center', name: '居中' },
              { id: 'right', value: 'right', name: '右对齐' },
            ],
            default: 'left',
            changeProp: true,
          },
          {
            type: 'color',
            name: 'textColor',
            label: '文字颜色',
            default: '#212529',
            changeProp: true,
          },
          {
            type: 'number',
            name: 'fontSize',
            label: '字体大小',
            default: 16,
            min: 12,
            max: 72,
            changeProp: true,
          },
          {
            type: 'select',
            name: 'fontWeight',
            label: '字体粗细',
            options: [
              { id: '400', value: '400', name: '常规' },
              { id: '500', value: '500', name: '中等' },
              { id: '600', value: '600', name: '加粗' },
              { id: '700', value: '700', name: '粗体' },
            ],
            default: '400',
            changeProp: true,
          },
          {
            type: 'color',
            name: 'backgroundColor',
            label: '背景颜色',
            default: 'transparent',
            changeProp: true,
          },
          {
            type: 'color',
            name: 'borderColor',
            label: '边框颜色',
            default: 'transparent',
            changeProp: true,
          },
        ],
        styles: `
          .format-temp-list {
            height: 100%;
            background: transparent;
            overflow: hidden;
          }

          .format-temp-list .infinite-scroll {
            height: 100%;
            overflow-y: auto;
            padding: 0.5rem;
          }

          .format-temp-list .infinite-scroll::-webkit-scrollbar {
            display: none;
          }

          .format-temp-list .infinite-scroll ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
          }

          .format-temp-list .infinite-scroll ul li {
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.25rem;
            transition: all 0.2s ease-in-out;
          }
        `,
        'script-props': ['apiUrl', 'template', 'autoScroll', 'textAlign', 'textColor', 'fontSize', 'fontWeight', 'backgroundColor', 'borderColor'],
        script: function (props) {
          const el = this;
          const apiUrl = props.apiUrl || '/api/list';
          const template = props.template || '<span class="temp-item-name">${name}</span>: <span class="temp-item-value">${value}</span>';
          const autoScroll = props.autoScroll || true;
          const textAlign = props.textAlign || 'left';
          const textColor = props.textColor || '#212529';
          const fontSize = props.fontSize || 16;
          const fontWeight = props.fontWeight || '400';
          const backgroundColor = props.backgroundColor || '#f8f9fa';
          const borderColor = props.borderColor || '#dee2e6';

          const fetchAndRender = async () => {
            try {
              let data = [
                { name: '张三', amount: '¥1,234.00' },
                { name: '李四', amount: '¥2,345.00' },
                { name: '王五', amount: '¥3,456.00' },
                { name: '赵六', amount: '¥4,567.00' },
                { name: '孙七', amount: '¥5,678.00' },
              ];
              if ((window as any).editor) {
                try {
                  const response = await fetch(apiUrl);
                  const result = await response.json();
                  data = result.data.map((item)=>{
                    return {
                      ...item,
                      ...(item.formData ?? {})
                    }
                  })
                  console.log('data', data);
                } catch (error) {
                  
                }
              }

              const container = document.createElement('div');
              container.className = 'infinite-scroll';

              const createList = () => {
                const ul = document.createElement('ul');
                data.forEach(item => {
                  const li = document.createElement('li');
                  li.style.textAlign = textAlign;
                  li.style.color = textColor;
                  li.style.fontSize = fontSize + 'px';
                  li.style.fontWeight = fontWeight;
                  li.style.backgroundColor = backgroundColor;
                  li.style.border = '1px solid ' + borderColor;
                  li.innerHTML = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                  ul.appendChild(li);
                });
                return ul;
              };

              const list1 = createList();
              container.appendChild(list1);
              el.innerHTML = '';
              el.appendChild(container);

              if (autoScroll) {
                const ulDefaultHeight = container.offsetHeight > list1.offsetHeight ? list1.offsetHeight : 0;
                const liDefaultValues = container.querySelectorAll('.infinite-scroll ul li');


                if (container.offsetHeight > list1.offsetHeight) {
                  const diff = Math.ceil(container.offsetHeight / list1.offsetHeight);
                  for (let j = 0; j < diff; j++) {
                    appendToDown();
                    appendToUp();
                  }
                } else {
                  appendToDown();
                  appendToUp();
                }

                container.scrollTop = ulDefaultHeight / 2;

                container.addEventListener("scroll", event => {
                  const currentScroll = container.scrollTop;
                  // const   = list1.offsetHeight - container.offsetHeight;
               
                  if (
                    currentScroll > (container.offsetHeight * 3) / 4 &&
                    list1.offsetHeight - container.offsetHeight < currentScroll
                  ) {
                    appendToDown();
                    for (let i = 0; i < liDefaultValues.length; i++) {
                      container.querySelector('ul li')?.remove();
                    }
                  }

                  if (
                    currentScroll < container.offsetHeight / 4 &&
                    container.scrollTop < container.offsetHeight - ulDefaultHeight
                  ) {
                    appendToUp();
                    for (let i = 0; i < liDefaultValues.length; i++) {
                      container.querySelector('ul li')?.remove();
                    }
                  }
                });

                function appendToDown() {
                  for (let i = 0; i < liDefaultValues.length; i++) {
                    const node = liDefaultValues[i].cloneNode(true);
                    list1.append(node);
                  }
                }

                function appendToUp() {
                  for (let i = (liDefaultValues.length - 1); i >= 0; i--) {
                    const node = liDefaultValues[i].cloneNode(true);
                    list1.prepend(node);
                  }
                }

                let lastScrollTop = container.scrollTop;
                setInterval(function () {
                  if (container) {
                    const currentScrollTop = container.scrollTop;
                    const maxScroll = list1.offsetHeight - container.offsetHeight;
                    
                    // 如果接近底部，重置到顶部
                    if (currentScrollTop >= maxScroll - 10) {
                      container.scrollTop = 0;
                      lastScrollTop = 0;
                    } else {
                      container.scrollTop = currentScrollTop + 1;
                      lastScrollTop = currentScrollTop;
                    }
                  }
                }, 50);
              }
            } catch (error) {
              console.error('Failed to fetch data:', error);
            }
          };

          fetchAndRender();
        }
      }
    },
    view: {
      init() {
        console.log('init');
        this.listenTo(this.model, 'change:traits', this.render);
      }
    }
  });
} 