import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../common/base";
import { BaseTraitsFactory } from "../common/traits-factory";
import { TAB_TYPES, TAB_HEIGHT } from "./constants";



// Traits工厂
class CustomTabTraitsFactory extends BaseTraitsFactory {
    constructor() {
        super()
    }

    // 获取边框颜色trait
    static getBorderColorTrait() {
        return {
            type: 'color',
            label: '边框颜色',
            name: 'border-color',
            default: '#dfd2af'
        };
    }

    // 获取激活边框颜色trait
    static getActiveBorderColorTrait() {
        return {
            type: 'color',
            label: '激活边框颜色',
            name: 'active-border-color',
            default: '#b99d61'
        };
    }

    // 获取标签页标题trait
    static getTabTitleTrait() {
        return {
            type: 'text',
            label: '标签标题',
            name: 'tab-title',
            default: '标签页'
        };
    }
}

export class CustomTabComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const editor = this.editor;

        // 注册TabContainer组件
        editor.Components.addType(TAB_TYPES['tab-container'], {
            model: {
                defaults: {
                    droppable: false,
                    traits: [
                        CustomTabTraitsFactory.getBorderColorTrait(),
                        CustomTabTraitsFactory.getActiveBorderColorTrait()
                    ],
                    script: function() {
                        const el = this as HTMLElement;
                        const tabs = el.querySelectorAll('[role="tab"]');
                        
                        tabs.forEach(tab => {
                            tab.addEventListener('click', e => {
                                e.preventDefault();
                                const target = tab.getAttribute('data-bs-target');
                                if (target) {
                                    // 移除所有active状态
                                    tabs.forEach(t => {
                                        t.classList.remove('active');
                                        t.setAttribute('aria-selected', 'false');
                                    });
                                    
                                    // 设置当前tab为active
                                    tab.classList.add('active');
                                    tab.setAttribute('aria-selected', 'true');
                                    
                                    // 切换内容区域
                                    const contents = el.querySelectorAll('.tab-pane');
                                    contents.forEach(content => {
                                        content.classList.remove('active', 'show');
                                    });
                                    const content = el.querySelector(target);
                                    if (content) {
                                        content.classList.add('active', 'show');
                                    }
                                }
                            });
                        });
                    }
                },

                init() {
                    this.on('change:traits', this.handleTraitChange);
                },

                handleTraitChange() {
                    const borderColor = this.getTrait('border-color').getValue();
                    const tabsEl = this.view.el.querySelector('.nav-tabs');
                    if (tabsEl) {
                        tabsEl.style.borderColor = borderColor;
                    }
                }
            }
        });

        // 注册Tabs组件
        editor.Components.addType(TAB_TYPES['tabs'], {
            model: {
                defaults: {
                    tagName: 'ul',
                    classes: ['nav', 'nav-underline'],
                    droppable: `[data-gjs-type="${TAB_TYPES['tab']}"]`,
                    style: {
                        display: 'flex',
                        '-webkit-flex': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        padding: '0 8%',
                        'min-height': `${TAB_HEIGHT}px`,
                        'border-top': `2px solid #dfd2af`,
                        'border-bottom': `2px solid #dfd2af`,
                        'background-color': 'transparent'
                    },
                    attributes: {
                        role: 'tablist'
                    }
                }
            }
        });

        // 注册Tab组件
        editor.Components.addType(TAB_TYPES['tab'], {
            model: {
                defaults: {
                    tagName: 'li',
                    classes: ['nav-item', 'nav-link'],
                    traits: [CustomTabTraitsFactory.getTabTitleTrait()],
                    style: {
                        'background': 'none',
                        'padding': '0',
                        'font-size': '16px',
                        'color': '#666',
                        'cursor': 'pointer',
                        'flex': '1',
                        'height': `${TAB_HEIGHT}px`,
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center'
                    },
                    attributes: {
                        role: 'tab',
                        'data-bs-toggle': 'tab',
                        'aria-selected': 'false'
                    }
                },

                init() {
                    this.on('change:traits', this.handleTraitChange);
                },

                handleTraitChange() {
                    const title = this.getTrait('tab-title').getValue();
                    this.set('content', title);
                }
            }
        });

        // 注册TabContents组件
        editor.Components.addType(TAB_TYPES['tab-contents'], {
            model: {
                defaults: {
                    classes: ['tab-content'],
                    droppable: `[data-gjs-type="${TAB_TYPES['tab-content']}"]`,
                    style: {
                        'margin-top': '20px'
                    }
                }
            }
        });

        // 注册TabContent组件
        editor.Components.addType(TAB_TYPES['tab-content'], {
            model: {
                defaults: {
                    classes: ['tab-pane', 'fade'],
                    attributes: {
                        role: 'tabpanel'
                    },
                    style: {
                        padding: '1rem'
                    }
                }
            }
        });
    }
}