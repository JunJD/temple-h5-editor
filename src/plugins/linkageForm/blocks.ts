import type { BlockProperties, Editor } from 'grapesjs';
import { PluginOptions } from '.';
import { typeForm, typeInput, typeAmountInput } from './components';
import { typeRadioButton, typeRadioButtonGroup } from './radioGroup'

export default function (editor: Editor, opt: Required<PluginOptions>) {
    const opts = opt;
    const bm = editor.BlockManager;
    const addBlock = (id: string, def: BlockProperties) => {
        opts.blocks?.indexOf(id)! >= 0 && bm.add(id, {
            ...def,
            category: opts.category,
            select: true,
            ...opt.block(id),
        });
    }

    // 表单块
    addBlock(typeForm, {
        label: '表单',
        // media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 8H3V6h18v2zM22 10.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 13H3v-2h18v2z"/><rect width="10" height="3" x="2" y="15" rx=".5"/></svg>',
        content: {
            type: typeForm,
            components: [
                {
                    type: typeInput,
                    attributes: {
                        placeholder: '请输入...',
                        name: 'field1'
                    }
                }
            ]
        }
    });

    // 输入框块
    addBlock(typeInput, {
        label: '输入框2',
        // media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"/><path d="M4 10h1v4H4z"/></svg>',
        content: {
            type: typeInput,
            attributes: {
                placeholder: '请输入...',
                name: 'field'
            }
        },
    });

    // 添加金额输入块
    addBlock(typeAmountInput, {
        label: '金额输入',
        // media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"/><path d="M4 10h1v4H4z"/></svg>',
        content: {
            type: typeAmountInput,
            label: '金额',
            placeholder: '请输入金额'
        }
    });

    addBlock(typeRadioButtonGroup, {
        label: '按钮组',
        content: {
            type: typeRadioButtonGroup,
            components: [
                {
                    type: typeRadioButton,
                    attributes: {
                        value: '1',
                        label: '选项1'
                    }
                },
                {
                    type: typeRadioButton,
                    attributes: {
                        value: '2',
                        label: '选项2'
                    }
                }
            ]
        }
    })
}