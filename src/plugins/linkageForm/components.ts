'use client'
import type { Editor } from 'grapesjs';

export const typeForm = 'form';
export const typeFormItem = 'form-item'

export default function(editor: Editor) {
  const { Components } = editor;

  // 基本的表单组件
  Components.addType(typeForm, {
    isComponent: el => el.tagName == 'FORM',
    model: {
      defaults: {
        tagName: 'form',
        droppable: ':not(form)',
        draggable: ':not(form)',
        attributes: { method: 'get' },
        traits: [
          {
            type: 'select',
            name: 'method',
            options: [
              {id: 'get', value: 'get', name: 'GET'},
              {id: 'post', value: 'post', name: 'POST'},
            ],
          },
          {
            type: 'text',
            name: 'submitUrl',
            label: '提交地址',
          }
        ],
        style: {
        },
        'script-props': ['formData', 'submitUrl'],
        script: function(props) {
          const el = this;
          const submitUrl = props.submitUrl;
          
          const form = {
            // 表单数据对象
            formData: {},
            
            /**
             * 更新字段值并触发联动
             * @param name 字段名
             * @param value 字段值
             * @param source 触发更新的源组件
             */
            updateField(name, value, source) {
              // [联动] 防止重复更新
              if (this.formData[name] === value) {
                return;
              }
              
              this.formData[name] = value;
              
              // [联动] 触发表单数据更新事件，通知所有表单项
              const event = new CustomEvent('form:data:change', {
                detail: { 
                  name,
                  value,
                  formData: this.formData,
                  source,
                  isFieldUpdate: true // 标记这是一个字段值更新事件
                }
              });
              el.dispatchEvent(event);
            },

            // 获取字段值
            getField(name) {
              return this.formData[name];
            },

            // 获取所有数据
            getData() {
              return this.formData;
            },

            /**
             * 批量设置表单数据
             * @param data 要设置的数据对象
             */
            setData(data) {
              this.formData = { ...data };
              // [联动] 触发表单数据更新事件
              const event = new CustomEvent('form:data:change', {
                detail: { formData: this.formData }
              });
              el.dispatchEvent(event);
            }
          };

          // 将 form 对象挂载到元素上
          (el as any).gForm = form;

          // 监听表单提交
          el.addEventListener('form:submit', async (e) => {
            const formData = e.detail.formData;

            if (submitUrl) {
              try {
                const response = await fetch(submitUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
                });
                console.log('response', response);
                const result = await response.json();
                const submitResultEvent = new CustomEvent('form:submit:result', {
                  detail: { success: true, data: result }
                });
                el.dispatchEvent(submitResultEvent);
              } catch (error) {
                const submitResultEvent = new CustomEvent('form:submit:result', {
                  detail: { success: false, error }
                });
                el.dispatchEvent(submitResultEvent);
              }
            }
          });
        }
      },

      init() {
        // 初始化表单数据
        this.set('formData', {});
      },

      // 提供给子组件的方法
      // updateField(name, value) {
      //   const formData = this.get('formData');
      //   formData[name] = value;
      //   this.set('formData', { ...formData });
        
      //   // 触发数据变化事件，用于联动计算
      //   this.trigger('form:data:change', { name, value, formData });
      // },

      // getField(name: string) {
      //   return this.get('formData')[name];
      // },

      // getData() {
      //   return this.get('formData');
      // }
    },
  });

  // Form Item 组件
  Components.addType(typeFormItem, {
    isComponent: el => el.classList?.contains('form-item'),
    model: {
      defaults: {
        tagName: 'div',
        droppable: true,
        classes: ['form-item'],
        traits: [
          {
            type: 'text',
            name: 'name',
            label: '字段名',
          },
          {
            type: 'text',
            name: 'label',
            label: '标签文本',
          }
        ],
        script: function() {
          const el = this;
          const name = el.getAttribute('name');
          const label = el.getAttribute('label');
          
          // 创建或更新标签元素
          let labelEl = el.querySelector('.form-item-label');
          if (!labelEl && label) {
            labelEl = document.createElement('label');
            labelEl.className = 'form-item-label block text-sm font-medium text-gray-700 mb-1';
            el.insertBefore(labelEl, el.firstChild);
          }
          if (labelEl && label) {
            labelEl.textContent = label;
          }
          
          // 向上查找最近的 form 元素
          const findForm = (element: HTMLElement): HTMLElement | null => {
            if (!element) return null;
            if (element.tagName === 'FORM') return element;
            return findForm(element.parentElement as HTMLElement);
          };

          const form = findForm(el);
          if (form && name) {
            /**
             * [联动] 监听子组件的值变化
             * 当输入框、单选按钮等触发 field:change 时，更新表单数据
             */
            el.addEventListener('field:change', (e: any) => {
              const { value, source } = e.detail;
              (form as any).gForm?.updateField(name, value, source);
            });

            /**
             * [联动] 监听表单数据变化
             * 当表单数据更新时，通知所有表单项进行联动计算
             */
            form.addEventListener('form:data:change', (e: any) => {
              const { name: changedField, formData, source, isFieldUpdate } = e.detail;
              
              // [联动] 避免自我更新导致的循环
              if (!isFieldUpdate || changedField === name) {
                return;
              }
              
              // [联动] 触发字段值更新事件，用于表达式计算
              const event = new CustomEvent('form:field:change', {
                detail: { 
                  name,
                  value: formData[name],
                  formData,
                  source
                }
              });
              el.dispatchEvent(event);
            });
          }
        }
      },

      init() {
        this.on('change:attributes:name', this.handleNameChange);
        this.on('change:attributes:label', this.handleLabelChange);
      },

      handleNameChange() {
        const name = this.getAttributes().name;
        // 查找父级 form
        const form = this.closest(typeForm);
        if (form && name) {
          // 获取初始值
          const value = form.getField(name);
          if (value !== undefined) {
            // 更新子组件的值
            this.components().forEach(component => {
              component.set('attributes', {
                ...component.getAttributes(),
                value
              });
            });
          }
        }
      },

      handleLabelChange() {
        // 标签变化时重新渲染
        this.view.render();
      }
    }
  });
}