'use client'

import type { Editor } from 'grapesjs';

export const typeFormatTempList = 'format-temp-list';

export default function (editor: Editor) {
  const { Components } = editor;

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
            type: 'text',
            name: 'template',
            label: '格式化模板',
            default: '${name}: ${value}',
            changeProp: true,
          }
        ],
        styles: `
          .format-temp-list .infinite-scroll {
            height: 100%;
            overflow-y: auto;
          }

        .format-temp-list .infinite-scroll::-webkit-scrollbar {
            display: none;
        }

        .format-temp-list .infinite-scroll ul {
            list-style-type: none;
            font-size: 40px;
          }
        `,
        'script-props': ['apiUrl', 'template', 'autoScroll'],
        script: function (props) {
          const el = this;
          const apiUrl = props.apiUrl || '/api/list';
          const template = props.template || '${name}: ${value}';
          const autoScroll = props.autoScroll || true;
          let scrollAnimation: number;
          let isPaused = false;

          const fetchAndRender = async () => {
            try {
              let data;
              if (!(window as any).editor) {
                data = [
                  { name: '示例项目1', value: '¥1,234.00' },
                  { name: '示例项目2', value: '¥2,345.00' },
                  { name: '示例项目3', value: '¥3,456.00' },
                  { name: '示例项目4', value: '¥4,567.00' },
                  { name: '示例项目5', value: '¥5,678.00' },
                ];
              } else {
                const response = await fetch(apiUrl);
                data = await response.json();
              }

              const container = document.createElement('div');
              container.className = 'infinite-scroll';

              const createList = () => {
                const ul = document.createElement('ul');
                data.forEach(item => {
                  const li = document.createElement('li');
                  li.textContent = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                  ul.appendChild(li);
                });
                return ul;
              };

              // 添加两个相同的列表
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


                // moving to the center of the list
                container.scrollTop = ulDefaultHeight / 2;

                container.addEventListener("scroll", event => {
                  const currentScroll = container.scrollTop;

                  // to scroll down
                  if (
                    currentScroll > (container.offsetHeight * 3) / 4 &&
                    list1.offsetHeight - container.offsetHeight < currentScroll
                  ) {
                    appendToDown();

                    // removing the top elements so that the code page doesn't fill up
                    for (let i = 0; i < liDefaultValues.length; i++) {
                      container.querySelector('ul li')?.remove();
                    }
                  }

                  // to scroll up
                  if (
                    currentScroll < container.offsetHeight / 4 &&
                    container.scrollTop < container.offsetHeight - ulDefaultHeight
                  ) {
                    appendToUp();

                    // removing the bottom elements so that the code page doesn't fill up
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

                setInterval(function () {
                  if (container) {
                    container.scrollTop = container.scrollTop + 1;
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
        this.listenTo(this.model, 'change:traits', this.render);
      }
    }
  });
} 