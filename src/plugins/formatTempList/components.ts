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
            type: 'rich-input',
            name: 'template',
            label: '格式化模板',
            default: '<span class="temp-item-name">${name}</span>: <span class="temp-item-value">${amount}</span>',
            changeProp: true,
            attributes: {
              mentionItems: [ 'name', 'amount', 'name1', 'date1', 'date2', 'goods1', 'goods2' ]
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
        'script-props': ['template', 'autoScroll', 'textAlign', 'textColor', 'fontSize', 'fontWeight', 'backgroundColor', 'borderColor'],
        script: function (props) {
          const el = this;
          const template = props.template || '<span class="temp-item-name">${name}</span>: <span class="temp-item-value">${amount}</span>';
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
                { name: '张三', amount: '¥1,234.00', name1: '张某', date1: '2024-01-01', date2: '01-01', goods1: '供灯', goods2: '一盏' },
                // { name: '李四', amount: '¥2,345.00', name1: '李某', date1: '2024-01-01', date2: '01-01', goods1: '供灯', goods2: '一盏' },
                // { name: '王五', amount: '¥3,456.00', name1: '王某', date1: '2024-01-01', date2: '01-01', goods1: '供灯', goods2: '一盏' },
                // { name: '赵六', amount: '¥4,567.00', name1: '赵某', date1: '2024-01-01', date2: '01-01', goods1: '供灯', goods2: '一盏' },
                // { name: '孙七', amount: '¥5,678.00', name1: '孙某', date1: '2024-01-01', date2: '01-01', goods1: '供灯', goods2: '一盏' },
              ];
              
              // @ts-ignore
              console.log('window.is_h5===>', window.is_h5);
              // @ts-ignore
              if (window.is_h5) {
                try {
                  // @ts-ignore
                  const submissionData = typeof window.submissionData === 'string' ? JSON.parse(window.submissionData) : window.submissionData || []
                  if(submissionData) {
                    data = submissionData.map((item) => {
                      if(item && item.formData && item.createdAt) {
                        const formatted = formatDateWithTimezone(new Date(item.createdAt))
                        return {
                          ...item,
                          ...(item.formData ?? {}),
                          date1: formatted.fullDate,
                          date2: formatted.shortDate
                        }
                      }
                      return {
                        ...item,
                      }
                    })
                    console.log('data===>', data);
                  }
                } catch (error) {
                  console.log('error===>', error);
                }
              }

              const container = document.createElement('div');
              container.className = 'infinite-scroll';

              const createList = () => {
                const ul = document.createElement('ul');
                data.forEach((item, index) => {
                  const li = document.createElement('li');
                  li.style.textAlign = textAlign;
                  li.style.color = textColor;
                  li.style.fontSize = fontSize + 'px';
                  li.style.fontWeight = fontWeight;
                  li.style.backgroundColor = backgroundColor;
                  li.style.borderTop = '1px solid ' + borderColor;
                  li.innerHTML = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                  ul.appendChild(li);
                });
                
                // 在一轮数据的最后添加300px间隔
                const spacer = document.createElement('li');
                spacer.className = 'data-cycle-spacer';
                spacer.style.height = '300px';
                spacer.style.background = 'transparent';
                spacer.style.border = 'none';
                spacer.style.padding = '0';
                spacer.style.margin = '0';
                spacer.style.listStyleType = 'none';
                ul.appendChild(spacer);
                
                return ul;
              };

              const list1 = createList();
              container.appendChild(list1);
              el.innerHTML = '';
              el.appendChild(container);

              if (autoScroll) {
                // 获取一轮完整数据的高度（包括间隔）
                const oneCycleHeight = list1.offsetHeight;
                
                // 复制足够多轮以填满容器并确保无缝滚动
                const cyclesNeeded = Math.max(Math.ceil(container.offsetHeight / oneCycleHeight) + 2, 3);
                
                for (let i = 0; i < cyclesNeeded; i++) {
                  data.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.style.textAlign = textAlign;
                    li.style.color = textColor;
                    li.style.fontSize = fontSize + 'px';
                    li.style.fontWeight = fontWeight;
                    li.style.backgroundColor = backgroundColor;
                    li.style.borderTop = '1px solid ' + borderColor;
                    li.innerHTML = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                    list1.appendChild(li);
                  });
                  
                  // 每轮数据后添加300px间隔
                  const spacer = document.createElement('li');
                  spacer.className = 'data-cycle-spacer';
                  spacer.style.height = '300px';
                  spacer.style.background = 'transparent';
                  spacer.style.border = 'none';
                  spacer.style.padding = '0';
                  spacer.style.margin = '0';
                  spacer.style.listStyleType = 'none';
                  list1.appendChild(spacer);
                }

                // 设置初始滚动位置
                container.scrollTop = oneCycleHeight;

                container.addEventListener("scroll", event => {
                  const currentScroll = container.scrollTop;
                  const maxScroll = list1.offsetHeight - container.offsetHeight;
               
                  // 当滚动到底部区域时，添加新的数据轮次
                  if (currentScroll > maxScroll - oneCycleHeight) {
                    data.forEach((item, index) => {
                      const li = document.createElement('li');
                      li.style.textAlign = textAlign;
                      li.style.color = textColor;
                      li.style.fontSize = fontSize + 'px';
                      li.style.fontWeight = fontWeight;
                      li.style.backgroundColor = backgroundColor;
                      li.style.borderTop = '1px solid ' + borderColor;
                      li.innerHTML = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                      list1.appendChild(li);
                    });
                    
                    // 添加间隔
                    const spacer = document.createElement('li');
                    spacer.className = 'data-cycle-spacer';
                    spacer.style.height = '300px';
                    spacer.style.background = 'transparent';
                    spacer.style.border = 'none';
                    spacer.style.padding = '0';
                    spacer.style.margin = '0';
                    spacer.style.listStyleType = 'none';
                    list1.appendChild(spacer);
                    
                    // 移除顶部的一轮数据
                    for (let i = 0; i < data.length + 1; i++) { // +1 for spacer
                      if (list1.firstChild) {
                        list1.removeChild(list1.firstChild);
                      }
                    }
                    container.scrollTop = currentScroll - oneCycleHeight;
                  }

                  // 当滚动到顶部区域时，向上添加数据轮次
                  if (currentScroll < oneCycleHeight) {
                    const tempItems: HTMLElement[] = [];
                    
                    // 先添加间隔
                    const spacer = document.createElement('li');
                    spacer.className = 'data-cycle-spacer';
                    spacer.style.height = '300px';
                    spacer.style.background = 'transparent';
                    spacer.style.border = 'none';
                    spacer.style.padding = '0';
                    spacer.style.margin = '0';
                    spacer.style.listStyleType = 'none';
                    tempItems.push(spacer);
                    
                    // 倒序添加数据项
                    for (let i = data.length - 1; i >= 0; i--) {
                      const item = data[i];
                      const li = document.createElement('li');
                      li.style.textAlign = textAlign;
                      li.style.color = textColor;
                      li.style.fontSize = fontSize + 'px';
                      li.style.fontWeight = fontWeight;
                      li.style.backgroundColor = backgroundColor;
                      li.style.borderTop = '1px solid ' + borderColor;
                      li.innerHTML = template.replace(/\${(\w+)}/g, (_, key) => item[key] || '');
                      tempItems.push(li);
                    }
                    
                    // 将所有项目插入到顶部
                    tempItems.forEach(item => {
                      list1.insertBefore(item, list1.firstChild);
                    });
                    
                    // 移除底部的一轮数据
                    for (let i = 0; i < data.length + 1; i++) { // +1 for spacer
                      if (list1.lastChild) {
                        list1.removeChild(list1.lastChild);
                      }
                    }
                    container.scrollTop = currentScroll + oneCycleHeight;
                  }
                });

                // 自动滚动
                setInterval(function () {
                  if (container) {
                    const currentScrollTop = container.scrollTop;
                    const maxScroll = list1.offsetHeight - container.offsetHeight;
                    
                    // 如果接近底部，重置到合适位置
                    if (currentScrollTop >= maxScroll - 10) {
                      container.scrollTop = oneCycleHeight;
                    } else {
                      container.scrollTop = currentScrollTop + 1;
                    }
                  }
                }, 50);
              }
            } catch (error) {
              console.error('Failed to fetch data:', error);
            }
          };

          fetchAndRender();

          /**
           * 将日期转换为指定格式（东八区）
           * @param date Date对象
           * @returns 包含两种格式的日期字符串的对象
           */
          function formatDateWithTimezone(date: Date) {
            // 获取UTC时间
            const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            
            // 东八区偏移量（+8小时）
            const cnTime = new Date(utc + (3600000 * 8));
            
            // 获取年、月、日
            const year = cnTime.getFullYear();
            // 月份需要+1，并确保两位数格式
            const month = String(cnTime.getMonth() + 1).padStart(2, '0');
            const day = String(cnTime.getDate()).padStart(2, '0');
            
            // 完整日期格式 YYYY-MM-DD
            const fullDate = `${year}-${month}-${day}`;
            
            // 月-日格式 MM-DD
            const shortDate = `${month}-${day}`;
            
            return {
              fullDate,  // 如: "2024-01-01"
              shortDate  // 如: "01-01"
            };
          }
          
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