'use client'

import type { Editor } from 'grapesjs';

export const typeFormatTempList = 'format-temp-list';

export default function(editor: Editor) {
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
          .format-temp-list {
            height: 300px;
            overflow-y: auto;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .format-temp-list::-webkit-scrollbar {
            display: none;
          }
          .format-temp-list ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .format-temp-list li {
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
            color: #333;
            background: #fff;
          }
          .format-temp-list li:last-child {
            border-bottom: none;
          }
        `,
        'script-props': ['apiUrl', 'template', 'autoScroll'],
        script: function(props) {
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

              // 创建容器和列表
              const container = document.createElement('div');
              container.style.cssText = `
                position: relative;
                height: 100%;
                overflow: hidden;
              `;

              const list = document.createElement('div');
              list.style.cssText = `
                position: absolute;
                width: 100%;
                transition: transform 0.5s ease;
                will-change: transform;
              `;

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
              const list2 = createList();
              list.appendChild(list1);
              list.appendChild(list2);

              container.appendChild(list);
              el.innerHTML = '';
              el.appendChild(container);

              if (autoScroll) {
                let currentScroll = 0;
                const scrollHeight = list1.offsetHeight;
                let isTransitioning = false;

                const scroll = () => {
                  if (!el.isConnected || isPaused) {
                    scrollAnimation = requestAnimationFrame(scroll);
                    return;
                  }
                  
                  if (!isTransitioning) {
                    currentScroll += 0.3; // 降低滚动速度
                    list.style.transform = `translate3d(0, -${currentScroll}px, 0)`; // 使用 translate3d 启用硬件加速

                    if (currentScroll >= scrollHeight) {
                      isTransitioning = true;
                      currentScroll = 0;
                      
                      requestAnimationFrame(() => {
                        list.style.transition = 'none';
                        list.style.transform = 'translate3d(0, 0, 0)';
                        
                        requestAnimationFrame(() => {
                          list.style.transition = 'transform 0.5s ease';
                          isTransitioning = false;
                        });
                      });
                    }
                  }
                  
                  scrollAnimation = requestAnimationFrame(scroll);
                };

                // 鼠标悬停时暂停滚动
                const pauseScroll = () => {
                  isPaused = true;
                };

                const resumeScroll = () => {
                  isPaused = false;
                };

                el.addEventListener('mouseenter', pauseScroll);
                el.addEventListener('mouseleave', resumeScroll);

                // 开始滚动
                scroll();

                // 清理函数
                return () => {
                  cancelAnimationFrame(scrollAnimation);
                  el.removeEventListener('mouseenter', pauseScroll);
                  el.removeEventListener('mouseleave', resumeScroll);
                };
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