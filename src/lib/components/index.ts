import { Editor } from "grapesjs"

// 注册自定义组件
export const registerComponents = (editor: Editor) => {
  // 区块容器
  editor.DomComponents.addType('section', {
    model: {
      defaults: {
        tagName: 'section',
        draggable: true,
        droppable: true,
        stylable: [
          'width', 'height', 'min-height',
          'margin', 'padding',
          'background-color',
          'border', 'border-radius',
          'display', 'flex-direction', 'justify-content', 'align-items', 'gap'
        ]
      }
    }
  })

  // 文本组件
  editor.DomComponents.addType('text', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: false,
        editable: true,
        stylable: [
          'font-family', 'font-size', 'font-weight',
          'color', 'text-align', 'line-height',
          'letter-spacing', 'text-shadow'
        ]
      }
    }
  })

  // 图片组件
  editor.DomComponents.addType('image', {
    model: {
      defaults: {
        tagName: 'img',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'src',
            label: '图片地址'
          },
          {
            type: 'text',
            name: 'alt',
            label: '替代文本'
          }
        ],
        stylable: [
          'width', 'height',
          'margin', 'padding',
          'border', 'border-radius'
        ]
      }
    }
  })

  // 按钮组件
  editor.DomComponents.addType('button', {
    model: {
      defaults: {
        tagName: 'button',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'text',
            label: '按钮文本'
          }
        ],
        stylable: [
          'width', 'height',
          'margin', 'padding',
          'font-size', 'font-weight',
          'color', 'background-color',
          'border', 'border-radius',
          'cursor'
        ]
      }
    }
  })
} 