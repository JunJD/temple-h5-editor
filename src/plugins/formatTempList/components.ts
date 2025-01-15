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
        'script-props': ['apiUrl', 'template', 'autoScroll', 'scrollSpeed'],
        script: function(props) {
          const el = this;
          const apiUrl = props.apiUrl || '/api/list';
          const template = props.template || '${name}: ${value}';
          const autoScroll = props.autoScroll || true;
          const scrollSpeed = props.scrollSpeed || 1;

          const fetchAndRender = async () => {
            try {
              let data;
              console.log('editor', (window as any).editor);
              if (!(window as any).editor) {
                // 编辑器模式下使用模拟数据
                data = [
                  { name: '示例项目1', value: '¥1,234.00' },
                  { name: '示例项目2', value: '¥2,345.00' },
                  { name: '示例项目3', value: '¥3,456.00' },
                  { name: '示例项目4', value: '¥4,567.00' },
                  { name: '示例项目5', value: '¥5,678.00' },
                ];
              } else {
                // 渲染模式下从API获取数据
                const response = await fetch(apiUrl);
                data = await response.json();
              }

              const list = document.createElement('ul');

              data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                list.appendChild(li);
              });

              el.innerHTML = '';
              el.appendChild(list);

              // 设置滚动位置到最底部
              el.scrollTop = el.scrollHeight - el.clientHeight;

              if (autoScroll) {
                const scroll = () => {
                  if (!el.isConnected) return;
                  el.scrollTop += scrollSpeed;
                  console.log('Scrolling...', el.scrollTop);
                  if (el.scrollTop >= list.scrollHeight - el.offsetHeight) {
                    el.scrollTop = 0;
                  }
                  requestAnimationFrame(scroll);
                };
                requestAnimationFrame(scroll);
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