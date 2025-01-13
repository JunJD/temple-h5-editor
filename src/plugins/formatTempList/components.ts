import type { Editor } from 'grapesjs';

export const MarqueeTextComponent = (editor: Editor) => {
  return {
    extend: 'component',
    model: {
      defaults: {
        name: '格式化模板列表',
        droppable: false,
        scripts: [
          'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js'
        ],
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
            label: '滚动速度(秒)',
            default: 20,
          },
          {
            type: 'checkbox',
            name: 'pauseOnHover',
            label: '悬停暂停',
            default: true,
          },
          {
            type: 'textarea',
            name: 'dataSource',
            label: '数据源',
            default: JSON.stringify([
              { name: '项目1', value: 100 },
              { name: '项目2', value: 200 },
              { name: '项目3', value: 300 }
            ], null, 2),
          },
          {
            type: 'text',
            name: 'template',
            label: '格式化模板',
            default: '${name}: ${value}',
          }
        ],
        script: function() {
          const el = this;
          const autoScroll = '{[ autoScroll ]}';
          const scrollSpeed = '{[ scrollSpeed ]}';
          const pauseOnHover = '{[ pauseOnHover ]}';
          const dataSource = '{[ dataSource ]}';
          const template = '{[ template ]}';
          
          const initAlpine = () => {
            // @ts-ignore
            if (window.Alpine) {
              el.innerHTML = `
                <div x-data="{
                  items: JSON.parse(${dataSource}),
                  template: '${template}',
                  autoScroll: ${autoScroll},
                  scrollSpeed: ${scrollSpeed},
                  pauseOnHover: ${pauseOnHover},
                  formatItem(item) {
                    return this.template.replace(/\${(\w+)}/g, (_, key) => item[key] || '')
                  }
                }">
                  <div class="marquee-container" 
                       :class="{ 
                         'auto-scroll': autoScroll,
                         'pause-on-hover': pauseOnHover 
                       }"
                       :style="autoScroll ? \`--scroll-speed: \${scrollSpeed}s\` : ''">
                    <div class="marquee-content">
                      <template x-for="item in items" :key="JSON.stringify(item)">
                        <div class="marquee-item" x-text="formatItem(item)"></div>
                      </template>
                    </div>
                  </div>
                </div>
              `;
            } else {
              setTimeout(initAlpine, 100);
            }
          };

          initAlpine();
        },
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:traits', this.render);
      },
      onRender() {
        const model = this.model;
        const el = this.el;
        
        try {
          const template = model.get('traits').where({ name: 'template' })[0].get('value');
          const dataSource = JSON.parse(model.get('traits').where({ name: 'dataSource' })[0].get('value'));
          
          const container = document.createElement('div');
          container.className = 'marquee-container';
          
          dataSource.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'marquee-item';
            itemEl.textContent = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
            container.appendChild(itemEl);
          });
          
          el.innerHTML = '';
          el.appendChild(container);
        } catch (e) {
          console.warn('Format preview failed:', e);
          el.innerHTML = '<div class="marquee-preview">数据格式错误</div>';
        }
      }
    }
  };
}; 