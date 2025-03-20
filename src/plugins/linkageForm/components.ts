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
        style: {
        },
        'script-props': ['formData', 'columns'],
        formData: {}, // 默认空对象
        columns: [],  // 默认空数组
        script: function(props) {
          const el = this;
          
          // 初始化表单数据和列
          let initialFormData = props.formData || {};
          let initialColumns = props.columns || [];
          
          // 检查当前环境
          const isH5Environment = () => {
            // 检查URL路径，判断是否为H5预览模式
            const pathname = window.location.pathname;
            return pathname.startsWith('/h5/');
          };
          
          // 从URL获取issueId
          const getIssueIdFromUrl = () => {
            const pathname = window.location.pathname;
            // 提取/h5/后面的部分作为issueId
            const match = pathname.match(/\/h5\/([^/]+)/);
            return match ? match[1] : null;
          };
          
          // 获取表单元素上的issue-id属性或从URL提取
          const issueId = (isH5Environment() ? getIssueIdFromUrl() : null);
          
          const form = {
            // 表单数据对象
            formData: initialFormData,
            columns: initialColumns,
            
            // 加载表单数据
            async loadFormData(issueId: string) {
              try {
                console.log('开始从API加载表单数据, issueId:', issueId);
                const response = await fetch(`/api/form-config?issueId=${issueId}`);
                if (!response.ok) {
                  throw new Error(`无法获取表单数据: ${response.status}`);
                }
                const data = await response.json();
                
                // 更新表单数据
                this.formData = data.formData || {};
                this.columns = data.columns || [];
                
                console.log('从API加载表单数据成功:', { 
                  formData: this.formData, 
                  columns: this.columns 
                });
                
                // 触发表单数据更新事件
                const event = new CustomEvent('form:data:change', {
                  detail: { formData: this.formData }
                });
                el.dispatchEvent(event);
                
                return data;
              } catch (error) {
                console.error('加载表单数据失败:', error);
              }
            },
            
            getColumns() {
              return this.columns;
            },
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

          if(issueId) {
            form.loadFormData(issueId).then(data => {
              if (data) {
                console.log('表单数据加载完成:', data);
              } else {
                console.warn('表单数据加载失败或为空，使用默认数据');
              }
            });
          }
          
        }
      },

      init() {
        // 初始化表单数据
        this.set('formData', {});
      },

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
        
        // 初始化时确保属性同步到DOM
        this.updateHtmlAttributes();
      },

      // 更新HTML元素属性
      updateHtmlAttributes() {
        const attrs = this.getAttributes();
        if (this.view && this.view.el) {
          if (attrs.name) {
            this.view.el.setAttribute('name', attrs.name);
          }
          if (attrs.label) {
            this.view.el.setAttribute('label', attrs.label);
          }
        }
      },

      handleNameChange() {
        const name = this.getAttributes().name;
        // 更新DOM元素上的name属性
        this.view.el.setAttribute('name', name);
        
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
        const label = this.getAttributes().label;
        // 更新DOM元素上的label属性
        this.view.el.setAttribute('label', label);
        
        // 标签变化时重新渲染
        this.view.render();
      }
    }
  });
}