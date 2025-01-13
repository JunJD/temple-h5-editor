import type { Editor } from 'grapesjs';

export default function (editor: Editor) {
  const trm = editor.TraitManager;

  // 添加自定义的 trait 类型
  trm.addType('custom-text', {
    events: {
      keyup: 'onChange',
    },

    onValueChange() {
      const { model, target } = this;
      const value = model.get('value');
      target.set('content', value);
    },

    getInputEl() {
      if (!this.$input) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'custom-trait-input';
        input.value = this.target.get('content');
        this.$input = input;
      }
      return this.$input;
    },
  });
}
