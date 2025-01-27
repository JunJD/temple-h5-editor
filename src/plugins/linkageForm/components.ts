'use client'
import type { Editor } from 'grapesjs';
import loadRadioGroup from './radioGroup';
export const typeForm = 'form';
export const typeFormItem = 'form-item';
export const typeInput = 'input';
export const typeAmountInput = 'amount-input';
export const typeSubmitButton = 'submit-button';

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
        classes: ['max-w-2xl', 'mx-auto', 'p-6', 'bg-white', 'rounded-lg', 'shadow-sm', 'space-y-4'],
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
            updateField(name: string, value: any, source?: any) {
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
            getField(name: string) {
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
            setData(data: Record<string, any>) {
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
          el.addEventListener('form:submit', async (e: any) => {
            const formData = e.detail.formData;
            console.log('Form Data:', formData);

            if (submitUrl) {
              try {
                const response = await fetch(submitUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
                });
                
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
      updateField(name: string, value: any) {
        const formData = this.get('formData');
        formData[name] = value;
        this.set('formData', { ...formData });
        
        // 触发数据变化事件，用于联动计算
        this.trigger('form:data:change', { name, value, formData });
      },

      getField(name: string) {
        return this.get('formData')[name];
      },

      getData() {
        return this.get('formData');
      }
    },
  });

  // Form Item 组件
  Components.addType(typeFormItem, {
    isComponent: el => el.classList?.contains('form-item'),
    model: {
      defaults: {
        tagName: 'div',
        droppable: true,
        classes: ['form-item', 'mb-4'],
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

  // 简化的 Input 组件
  Components.addType(typeInput, {
    isComponent: el => el.tagName == 'INPUT',
    model: {
      defaults: {
        tagName: 'input',
        droppable: false,
        draggable: true,
        attributes: { type: 'text' },
        classes: [
          // 基础样式
          'block', 'w-full', 'px-4', 'py-2.5',
          // 文字和背景
          'text-gray-700', 'bg-white',
          // 边框和圆角
          'border', 'border-gray-300', 'rounded-lg',
          // 焦点状态
          'focus:border-blue-500', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-opacity-20', 'focus:outline-none',
          // 占位符
          'placeholder:text-gray-400',
          // 过渡动画
          'transition', 'duration-200', 'ease-in-out',
          // hover 状态
          'hover:border-gray-400',
        ],
        traits: [
          {
            type: 'text',
            name: 'placeholder',
            label: '占位文本',
            placeholder: '请输入占位文本'
          },
          {
            type: 'select',
            name: 'type',
            label: '输入类型',
            options: [
              { id: 'text-type', value: 'text', name: '文本' },
              { id: 'number-type', value: 'number', name: '数字' },
              { id: 'password-type', value: 'password', name: '密码' },
              { id: 'email-type', value: 'email', name: '邮箱' },
            ]
          },
          {
            type: 'checkbox',
            name: 'required',
            label: '必填'
          },
          {
            type: 'text',
            name: 'expression',
            label: '联动表达式',
            placeholder: '例如: form.age * 2'
          }
        ],
        script: function() {
          const el = this;
          const formItem = el.closest('.form-item');
          
          if (formItem) {
            /**
             * [联动] 监听输入变化
             * 当用户输入时，触发 field:change 事件
             */
            el.addEventListener('input', (e) => {
              const value = (e.target as HTMLInputElement).value;
              const event = new CustomEvent('field:change', {
                detail: { value }
              });
              formItem.dispatchEvent(event);
            });

            /**
             * [联动] 监听表单字段变化
             * 处理表达式计算和值的更新
             */
            formItem.addEventListener('form:field:change', (e: any) => {
              const { name, value, formData, source } = e.detail;
              
              // [联动] 避免自我更新导致的循环
              if (source === el) {
                return;
              }
              
              // [联动] 处理表达式计算
              const expression = el.getAttribute('expression');
              if (expression) {
                try {
                  const form = formData;
                  const calculate = new Function('form', `return ${expression}`);
                  const newValue = calculate(form);
                  
                  // [联动] 只更新显示值，不触发新的事件
                  el.value = String(newValue);
                } catch (error) {
                  console.error('表达式计算错误:', error);
                }
              } else {
                // 如果没有表达式，直接更新值
                if (value !== undefined) {
                  el.value = value ? String(value) : '';
                }
              }
            });
          }
        }
      },

      init() {
        this.on('change:attributes:required', this.handleRequired);
      },

      handleRequired() {
        const required = this.get('attributes').required;
        if (required) {
          this.addClass('border-l-4 border-l-red-500');
        } else {
          this.removeClass('border-l-4 border-l-red-500');
        }
      }
    }
  });

  // 金额输入组件
  Components.addType(typeAmountInput, {
    isComponent: el => el.classList?.contains('amount-input'),
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        classes: ['amount-input', 'flex', 'items-center', 'w-full'],
        traits: [
          {
            type: 'text',
            name: 'placeholder',
            label: '占位文本',
            default: '请输入金额',
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用'
          },
          {
            type: 'text',
            name: 'expression',
            label: '联动表达式',
            placeholder: '例如: form.price * form.quantity'
          }
        ],
        script: function() {
          const el = this;
          const formItem = el.closest('.form-item');
          
          // 创建输入框
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'flex-1 border-none outline-none text-base text-gray-700 text-right bg-transparent';
          input.placeholder = el.getAttribute('placeholder') || '请输入金额';
          if (el.getAttribute('disabled') === 'true') {
            input.disabled = true;
          }

          // 创建单位标签
          const unit = document.createElement('span');
          unit.className = 'text-gray-500 ml-2';
          unit.textContent = '元';

          // 清空并添加元素
          el.innerHTML = '';
          el.appendChild(input);
          el.appendChild(unit);

          // 处理输入事件
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // 只允许输入数字和小数点
            let value = target.value.replace(/[^\d.]/g, '');
            // 确保只有一个小数点
            const parts = value.split('.');
            if (parts.length > 2) {
              value = parts[0] + '.' + parts.slice(1).join('');
            }
            // 限制小数位数
            if (parts[1]?.length > 2) {
              value = parts[0] + '.' + parts[1].slice(0, 2);
            }
            target.value = value;

            /**
             * [联动] 触发字段变化事件
             * 当金额输入框值变化时，通知表单项
             */
            if (formItem) {
              const event = new CustomEvent('field:change', {
                detail: { value: value ? parseFloat(value) : '' }
              });
              formItem.dispatchEvent(event);
            }
          });

          /**
           * [联动] 处理表单字段变化
           * 处理表达式计算和值的更新
           */
          if (formItem) {
            formItem.addEventListener('form:field:change', (e: any) => {
              const { name, value, formData, source } = e.detail;
              
              // [联动] 避免自我更新导致的循环
              if (source === el) {
                return;
              }
              
              // [联动] 处理表达式计算
              const expression = el.getAttribute('expression');
              if (expression) {
                try {
                  const form = formData;
                  const calculate = new Function('form', `return ${expression}`);
                  const newValue = calculate(form);
                  
                  // [联动] 只更新显示值，不触发新的事件
                  input.value = String(newValue);
                } catch (error) {
                  console.error('表达式计算错误:', error);
                }
              } else {
                // 如果没有表达式，直接更新值
                if (value !== undefined) {
                  input.value = value ? String(value) : '';
                }
              }
            });
          }
        }
      }
    }
  });

  // 添加提交按钮组件
  Components.addType(typeSubmitButton, {
    isComponent: el => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit',
    model: {
      defaults: {
        tagName: 'button',
        attributes: { type: 'submit' },
        classes: [
          'px-4', 'py-2', 'bg-blue-500', 'text-white',
          'rounded-lg', 'hover:bg-blue-600', 'transition-colors',
          'w-full'
        ],
        traits: [
          {
            type: 'text',
            name: 'text',
            label: '按钮文本',
            default: '提交',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用'
          }
        ],
        script: function() {
          const el = this;
          const form = el.closest('form');
          
          if (form) {
            el.addEventListener('click', (e) => {
              e.preventDefault();
              
              // 获取表单数据
              const formData = (form as any).gForm?.getData() || {};
              console.log('Form Data:', formData);

              // 触发提交事件
              const submitEvent = new CustomEvent('form:submit', {
                detail: { formData }
              });
              form.dispatchEvent(submitEvent);
            });
          }
        }
      },

      init() {
        this.on('change:attributes:text', this.handleTextChange);
        this.on('change:attributes:disabled', this.handleDisabledChange);
        
        // 设置初始文本
        const text = this.get('attributes').text || '提交';
        this.set('content', text);
      },

      handleTextChange() {
        const text = this.get('attributes').text;
        this.set('content', text || '提交');
      },

      handleDisabledChange() {
        const disabled = this.get('attributes').disabled;
        if (disabled) {
          this.addClass('opacity-50 cursor-not-allowed');
        } else {
          this.removeClass('opacity-50 cursor-not-allowed');
        }
      }
    }
  });

  loadRadioGroup(editor);
}