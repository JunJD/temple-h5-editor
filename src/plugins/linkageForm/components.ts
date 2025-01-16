import type { Editor } from 'grapesjs';

export const typeForm = 'form';
export const typeInput = 'input';
export const typeAmountInput = 'amount-input';

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
        traits: [{
          type: 'select',
          name: 'method',
          options: [
            {value: 'get', name: 'GET', id: 'get'},
            {value: 'post', name: 'POST', id: 'post'},
          ],
        }],
        classes: ['max-w-2xl', 'mx-auto', 'p-6', 'bg-white', 'rounded-lg', 'shadow-sm', 'space-y-4'],
      },
    },
    view: {
      events: {
        // @ts-ignore
        submit: (e: Event) => e.preventDefault(),
      }
    },
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
            name: 'name',
            label: '字段名',
            placeholder: '请输入字段名'
          },
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
              { value: 'text', name: '文本', id: 'text-type' },
              { value: 'number', name: '数字', id: 'number-type' },
              { value: 'password', name: '密码', id: 'password-type' },
              { value: 'email', name: '邮箱', id: 'email-type' },
            ]
          },
          {
            type: 'checkbox',
            name: 'required',
            label: '必填'
          },
          {
            type: 'text',
            name: 'linkage-target',
            label: '联动目标字段',
            placeholder: '目标字段名称'
          },
          {
            type: 'text',
            name: 'linkage-value',
            label: '联动触发值',
            placeholder: '当值等于此值时触发'
          },
          {
            type: 'text',
            name: 'linkage-set',
            label: '联动设置值',
            placeholder: '触发后设置的值'
          }
        ],
      },
      init() {
        this.on('change:attributes:required', this.handleRequired);
        this.on('change:attributes:value', this.handleLinkage);
      },
      handleRequired() {
        const required = this.get('attributes').required;
        if (required) {
          this.addClass('border-l-4 border-l-red-500');
        } else {
          this.removeClass('border-l-4 border-l-red-500');
        }
      },
      handleLinkage() {
        const value = this.get('attributes').value;
        const targetField = this.get('attributes')['linkage-target'];
        const triggerValue = this.get('attributes')['linkage-value'];
        const setValue = this.get('attributes')['linkage-set'];
        
        if (targetField && triggerValue && setValue && value === triggerValue) {
          // 查找目标字段
          const form = this.parent();
          if (form) {
            const targetInput = form.find(`[name="${targetField}"]`)[0];
            if (targetInput) {
              targetInput.set('attributes', { 
                ...targetInput.get('attributes'),
                value: setValue 
              });
            }
          }
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:attributes', this.updateAttributes);
      },
      updateAttributes() {
        this.el.setAttribute('autocomplete', 'off');
        const attrs = this.model.getAttributes();
        
        // 先移除所有旧的 data-linkage 属性
        Array.from(this.el.attributes)
          .filter((attr: any) => attr.name.startsWith('data-linkage-'))
          .forEach((attr: any) => this.el.removeAttribute(attr.name));
        
        // 设置新的属性
        Object.entries(attrs).forEach(([attr, value]) => {
          if (attr.startsWith('linkage-')) {
            // 将 linkage- 属性转换为 data- 属性
            const dataAttr = attr.replace('linkage-', 'data-linkage-');
            if (value != null) {
              this.el.setAttribute(dataAttr, String(value));
              console.log('Setting linkage attr:', dataAttr, value);
            }
          } else {
            this.el.setAttribute(attr, String(value));
          }
        });
      },
      events: {
        // @ts-ignore
        'input': 'onInput'
      },
      onInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.model.set('attributes', {
          ...this.model.get('attributes'),
          value
        });
      }
    }
  });

  // 添加金额输入组件
  Components.addType(typeAmountInput, {
    isComponent: el => el.classList?.contains('input_item'),
    model: {
      defaults: {
        name: '金额输入',
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: '标签文本',
            default: '金额',
            changeProp: true,
          },
          {
            type: 'text',
            name: 'placeholder',
            label: '占位文本',
            default: '请输入金额',
            changeProp: true,
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            default: false,
            changeProp: true,
          }
        ],
        classes: [
          'border', 'border-[#eee]', 'rounded-xl', 'p-[3%_5%]', 'mt-[5%]',
          'flex', 'items-center', 'bg-white'
        ],
        'script-props': ['label', 'placeholder', 'disabled'],
        script: function(props) {
          const el = this;
          const label = props.label || '金额';
          const placeholder = props.placeholder || '请输入金额';
          const disabled = props.disabled || false;

          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center w-full';

          const labelSpan = document.createElement('span');
          labelSpan.className = 'text-[#666666] text-base h-[23px] leading-[23px]';
          labelSpan.textContent = label + '：';

          const input = document.createElement('input');
          input.className = 'border-none outline-none text-base text-[#666666] h-[23px] leading-[23px] flex-1 w-full pr-3 text-right bg-transparent';
          input.type = 'text';
          input.placeholder = placeholder;
          if (disabled) input.disabled = true;
          
          input.addEventListener('input', function(e) {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^\d]/g, '');
          });

          const unitSpan = document.createElement('span');
          unitSpan.className = 'text-[#666666] text-base h-[23px] leading-[23px] ml-2';
          unitSpan.textContent = '元';

          wrapper.appendChild(labelSpan);
          wrapper.appendChild(input);
          wrapper.appendChild(unitSpan);

          el.innerHTML = '';
          el.appendChild(wrapper);
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