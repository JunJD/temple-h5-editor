import type { Editor } from 'grapesjs';

export const typeFormatTempList = 'format-temp-list';

// 通用的滚动逻辑
const initScrollList = (container: HTMLElement, data: any[], template: string, options: {
  autoScroll?: boolean;
  scrollSpeed?: number;
}) => {
  const list = document.createElement('ul');

  // 渲染初始列表项
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
    list.appendChild(li);
  });

  container.innerHTML = '';
  container.appendChild(list);

  // 保存初始列表项引用
  const defaultItems = Array.from(list.children);
  const defaultHeight = container.offsetHeight > list.offsetHeight ? list.offsetHeight : 0;

  // 填充足够的项目
  const appendToDown = () => {
    defaultItems.forEach(item => {
      const node = item.cloneNode(true);
      list.appendChild(node);
    });
  };

  const appendToUp = () => {
    defaultItems.reverse().forEach(item => {
      const node = item.cloneNode(true);
      list.prepend(node);
    });
  };

  // 初始填充
  if (container.offsetHeight > list.offsetHeight) {
    const diff = Math.ceil(container.offsetHeight / list.offsetHeight);
    for (let j = 0; j < diff; j++) {
      appendToDown();
      appendToUp();
    }
  } else {
    appendToDown();
    appendToUp();
  }

  // 初始定位到中间
  container.scrollTop = list.offsetHeight / 2;

  // 滚动监听
  container.addEventListener('scroll', () => {
    const currentScroll = container.scrollTop;

    // 向下滚动时添加内容
    if (
      currentScroll > (container.offsetHeight * 3) / 4 &&
      list.offsetHeight - container.offsetHeight < container.scrollTop
    ) {
      appendToDown();
      // 移除顶部元素
      for (let i = 0; i < defaultItems.length; i++) {
        list.querySelector('li')?.remove();
      }
    }

    // 向上滚动时添加内容
    if (
      currentScroll < container.offsetHeight / 4 &&
      container.scrollTop < container.offsetHeight - defaultHeight
    ) {
      appendToUp();
      // 移除底部元素
      for (let i = 0; i < defaultItems.length; i++) {
        list.querySelector('li:last-child')?.remove();
      }
    }
  });

  // 自动滚动
  if (options.autoScroll) {
    console.log('Starting auto scroll with speed:', options.scrollSpeed);
    
    // 使用 setInterval 实现平滑滚动
    const scrollInterval = setInterval(() => {
      if (!container.isConnected) {
        clearInterval(scrollInterval);
        return;
      }

      container.scrollTop += 0.5; // 使用固定的小增量实现平滑滚动

      // 当滚动到底部时重置到顶部
      if (container.scrollTop >= list.scrollHeight - container.offsetHeight) {
        container.scrollTop = 0;
      }
    }, 80); // 使用较短的间隔
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
            changeProp: true
          },
          {
            type: 'number',
            name: 'scrollSpeed',
            label: '滚动速度',
            default: 0.2,
            min: 0.1,
            max: 5,
            step: 0.1,
            changeProp: true
          },
          {
            type: 'text',
            name: 'apiUrl',
            label: 'API地址',
            default: '/api/list',
            changeProp: true
          },
          {
            type: 'text',
            name: 'template',
            label: '格式化模板',
            default: '${name}: ${value}',
            changeProp: true
          }
        ],
        styles: `
          .format-temp-list {
            height: 300px;
            overflow-y: auto;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
          }
          .format-temp-list::-webkit-scrollbar {
            display: none;
          }
          .format-temp-list ul {
            list-style: none;
            margin: 0;
            padding: 0;
            min-height: 100%;
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
                autoScroll: autoScroll === 'true',
                scrollSpeed: Number(scrollSpeed)
              });
            } catch (error) {
              console.error('Failed to fetch data:', error);
            }
          };

          fetchAndRender();
        },
        autoScroll: true,
        scrollSpeed: 0.2,
        apiUrl: '/api/list',
        template: '${name}: ${value}',
      },
      init() {
        this.on('change:traits', this.handleTraitsChange);
      },
      handleTraitsChange() {
        const traits = this.get('traits');
        const autoScroll = traits.where({ name: 'autoScroll' })[0].get('value');
        const scrollSpeed = traits.where({ name: 'scrollSpeed' })[0].get('value');
        
        console.log('Traits changed:', { autoScroll, scrollSpeed });
        
        this.set({
          autoScroll: autoScroll === true || autoScroll === 'true',
          scrollSpeed: Number(scrollSpeed) || 0.5,
          apiUrl: traits.where({ name: 'apiUrl' })[0].get('value'),
          template: traits.where({ name: 'template' })[0].get('value')
        });
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:traits', this.render);
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
        const autoScroll = this.model.get('autoScroll');
        const scrollSpeed = Number(this.model.get('scrollSpeed'));

        console.log('Render with:', { autoScroll, scrollSpeed });

        initScrollList(this.el, mockData, template, {
          autoScroll: Boolean(autoScroll),
          scrollSpeed: scrollSpeed || 0.5
        });
      },
      remove() {
        const result = this.constructor.prototype.remove.apply(this, arguments);
        return result;
      }
    }
  });
} 