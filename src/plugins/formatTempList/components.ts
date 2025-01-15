import type { Editor } from 'grapesjs';

export const typeFormatTempList = 'format-temp-list';

// 通用的滚动逻辑
const initScrollList = (container: HTMLElement, data: any[], template: string, options: {
  autoScroll?: boolean;
  scrollSpeed?: number;
}) => {
  const list = document.createElement('ul');

  // 渲染列表项
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
    list.appendChild(li);
  });

  container.innerHTML = '';
  container.appendChild(list);

  // 自动滚动
  if (options.autoScroll) {
    const scrollInterval = setInterval(() => {
      if (!container.isConnected) {
        clearInterval(scrollInterval);
        return;
      }
      container.scrollTop += 0.5;
      if (container.scrollTop >= list.scrollHeight - container.offsetHeight) {
        container.scrollTop = 0;
      }
    }, 80);
  }

  return list;
};

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
          },
          {
            type: 'number',
            name: 'scrollSpeed',
            label: '滚动速度',
            default: 0.5,
            min: 0.1,
            max: 5,
            step: 0.1,
          },
          {
            type: 'text',
            name: 'apiUrl',
            label: 'API地址',
            default: '/api/list',
          },
          {
            type: 'text',
            name: 'template',
            label: '格式化模板',
            default: '${name}: ${value}',
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
        script: function() {
          const el = this;
          const apiUrl = '{[ apiUrl ]}';
          const template = '{[ template ]}';
          const autoScroll = '{[ autoScroll ]}';
          const scrollSpeed = '{[ scrollSpeed ]}';

          // 从API获取数据并渲染
          const fetchAndRender = async () => {
            try {
              const response = await fetch(apiUrl);
              const data = await response.json();
              initScrollList(el, data, template, {
                // @ts-ignore
                autoScroll: autoScroll !== 'false',
                scrollSpeed: Number(scrollSpeed)
              });
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
        // 监听整个traits的变化
        this.listenTo(this.model, 'change:traits', ()=>{
            
            this.render();
        });
        
        // 单独监听template的变化
        const traits = this.model.get('traits');
        const templateTrait = traits.where({ name: 'template' })[0];
        this.listenTo(templateTrait, 'change:value', this.render);
      },
      onRender() {
        const mockData = [
          { name: '示例项目1', value: '¥1,234.00' },
          { name: '示例项目2', value: '¥2,345.00' },
          { name: '示例项目3', value: '¥3,456.00' },
          { name: '示例项目4', value: '¥4,567.00' },
          { name: '示例项目5', value: '¥5,678.00' },
        ];

        const traits = this.model.get('traits');
        const template = traits.where({ name: 'template' })[0].get('value');
        const autoScroll = traits.where({ name: 'autoScroll' })[0].get('value');
        const scrollSpeed = traits.where({ name: 'scrollSpeed' })[0].get('value');

        initScrollList(this.el, mockData, template, {
          autoScroll: Boolean(autoScroll),
          scrollSpeed: Number(scrollSpeed)
        });
      }
    }
  });
} 