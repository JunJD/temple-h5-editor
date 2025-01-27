import type { Plugin } from 'grapesjs';

const plugin: Plugin = (editor) => {
  const { Components } = editor;
  const typeWrapper = 'wrapper';

  // 注册wrapper组件类型
  Components.addType(typeWrapper, {
    isComponent: el => el.tagName === 'BODY',
    model: {
      defaults: {
        tagName: 'body',
        name: '页面容器',
        removable: false,
        draggable: false,
        droppable: true,
        copyable: false,
        selectable: true,
        traits: [
          {
            type: 'select',
            name: 'background-type',
            label: '背景类型',
            options: [
              { id: 'color', name: '纯色' },
              { id: 'gradient', name: '渐变' },
              { id: 'image', name: '图片' }
            ],
            default: 'color'
          },
          {
            type: 'color',
            name: 'background-color',
            label: '背景颜色',
            default: '#ffffff'
          },
          {
            type: 'text',
            name: 'background-image',
            label: '背景图片',
            placeholder: '输入图片URL'
          },
          {
            type: 'number',
            name: 'min-height',
            label: '最小高度',
            default: 800,
            unit: 'px'
          },
          {
            type: 'select',
            name: 'display',
            label: '布局方式',
            options: [
              { id: 'block', name: '块级' },
              { id: 'flex', name: 'Flex' }
            ],
            default: 'block'
          }
        ],
        styles: `
          body {
            margin: 0;
            min-height: 800px;
            background-color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
          }
        `
      },

      init() {
        this.on('change:traits', this.handleTraitChange);
      },

      handleTraitChange() {
        const bgType = this.getTrait('background-type').getValue();
        const bgColor = this.getTrait('background-color').getValue();
        const bgImage = this.getTrait('background-image').getValue();
        const minHeight = this.getTrait('min-height').getValue();
        const display = this.getTrait('display').getValue();

        let styles = {};

        // 处理背景
        if (bgType === 'color') {
          styles['background-image'] = 'none';
          styles['background-color'] = bgColor;
        } else if (bgType === 'image' && bgImage) {
          styles['background-image'] = `url(${bgImage})`;
          styles['background-size'] = 'cover';
          styles['background-position'] = 'center';
        }

        // 处理布局
        styles['min-height'] = `${minHeight}px`;
        styles['display'] = display;
        if (display === 'flex') {
          styles['flex-direction'] = 'column';
          styles['align-items'] = 'stretch';
        }

        this.setStyle(styles);
      }
    }
  });

  // 覆盖默认的canvas-clear命令
  editor.Commands.add('core:canvas-clear', {
    run: (editor) => {
      // 获取画布
      const wrapper = editor.getWrapper();
      if (!wrapper) return;

      // 保存当前wrapper的样式和特性
      const currentStyles = { ...wrapper.getStyle() };
      const currentTraits = wrapper.getTraits();
      const currentType = wrapper.get('type');

      // 清空组件
      wrapper.components().reset();

      // 恢复wrapper的样式和特性
      wrapper.setStyle(currentStyles);
      wrapper.set('type', currentType);
      currentTraits.forEach(trait => {
        const traitName = trait.get('name');
        if (traitName) {
          const traitValue = trait.getValue();
          const targetTrait = wrapper.getTrait(traitName);
          if (targetTrait) {
            targetTrait.setValue(traitValue);
          }
        }
      });

      // 触发change事件以更新UI
      editor.trigger('component:selected');
      editor.trigger('change:selectedComponent');
    }
  });

  // 初始化时设置wrapper
  editor.on('load', () => {
    const wrapper = editor.getWrapper();
    if (wrapper) {
      wrapper.set('type', typeWrapper);
    }
  });
};

export default plugin;
