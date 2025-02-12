import { Editor } from 'grapesjs';
import { AudioConfigDialog } from '@/components/builder/audio-config-dialog';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import BasePluginV5 from '../common/base';

class AudioPlugin extends BasePluginV5 {
    private dialogRoot: Root | null = null;
    private config = {
        enabled: false,
        url: 'https://tyfy.oss-cn-beijing.aliyuncs.com/香云赞.mp3'
    };

    constructor(editor: Editor) {
        super(editor, {});
    }

    load(): void {
        this._loadComponents();
        this._loadCommands();
        // 监听编辑器加载完成事件
        this.editor.on('load', () => {
            if (this.config.enabled) {
                this.updateAudioComponent();
            }
        });
    }

    _loadCommands(): void {
        this.editor.Commands.add('audio-config', {
            run: () => {
                if (!this.dialogRoot) {
                    const el = document.createElement('div');
                    document.body.appendChild(el);
                    this.dialogRoot = createRoot(el);
                }

                this.dialogRoot.render(
                    <AudioConfigDialog
                        open={true}
                        onOpenChange={() => {
                            this.editor.Commands.stop('audio-config');
                        }}
                        onSave={(newConfig) => {
                            this.config = newConfig;
                            this.updateAudioComponent();
                        }}
                        initialConfig={this.config}
                    />
                );
            },
            stop: () => {
                if (this.dialogRoot) {
                    this.dialogRoot.render(
                        <AudioConfigDialog
                            open={false}
                            onOpenChange={() => {}}
                            onSave={() => {}}
                            initialConfig={this.config}
                        />
                    );
                }
            }
        });
    }

    _loadComponents(): void {
        // 添加音频组件类型
        this.editor.Components.addType('background-audio', {
            model: {
                defaults: {
                    tagName: 'div',
                    droppable: false,
                    removable: true,
                    selectable: true,
                    hoverable: true,
                    style: {
                        position: 'relative',
                        zIndex: 9999
                    },
                    traits: [
                        {
                            type: 'text',
                            name: 'url',
                            label: '音频URL',
                        }
                    ],
                    'script-props': ['url'],
                    script: function(props: { url: string }) {
                        const el = this as HTMLElement;
                        // 添加样式
                        const styleEl = document.createElement('style');
                        styleEl.textContent = `
                            #music {
                                width: 2em;
                                height: 2em;
                                position: fixed;
                                right: 0.256rem;
                                top: 0.256rem;
                                z-index: 999;
                                font-size: 0.513rem;
                            }
                            #music.stopped .control {
                                background: none;
                            }
                            #music .control {
                                width: 2.5em;
                                height: 2.5em;
                                background: url(http://tuchuang.wxsushang.com/2020/04/01/yinyue.gif) no-repeat center center;
                                background-size: contain;
                                position: relative;
                            }
                            #music .control .control_after {
                                width: 1.5em;
                                height: 1.5em;
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                background: url(http://tuchuang.wxsushang.com/2020/04/01/yinyue1.png) transparent no-repeat center center;
                                background-size: 100% 100%;
                                -webkit-animation: rotate2d 1.2s linear infinite;
                                animation: rotate2d 1.2s linear infinite;
                                z-index: -1;
                            }
                            #music.stopped .control .control_after {
                                -webkit-animation: none;
                                animation: none;
                            }
                            @keyframes rotate2d {
                                0% { transform: translate(-50%, -50%) rotate(0deg); }
                                100% { transform: translate(-50%, -50%) rotate(360deg); }
                            }
                            @-webkit-keyframes rotate2d {
                                0% { -webkit-transform: translate(-50%, -50%) rotate(0deg); }
                                100% { -webkit-transform: translate(-50%, -50%) rotate(360deg); }
                            }
                        `;
                        document.head.appendChild(styleEl);

                        el.innerHTML = `
                            <div id="music" class="stopped">
                                <audio src="${props.url}" id="audio" loop="loop" preload="auto" autoplay="autoplay"></audio>
                                <div class="control">
                                    <div class="control_after"></div>
                                </div>
                            </div>
                        `;

                        const musicEl = el.querySelector('#music') as HTMLElement;
                        const audioEl = el.querySelector('#audio') as HTMLAudioElement;
                        const controlEl = el.querySelector('.control') as HTMLElement;

                        let isPlaying = false;

                        function togglePlay() {
                            if (isPlaying) {
                                audioEl.pause();
                                musicEl.classList.add('stopped');
                            } else {
                                audioEl.play().then(() => {
                                    musicEl.classList.remove('stopped');
                                    isPlaying = true;
                                }).catch(() => {
                                    isPlaying = false;
                                    musicEl.classList.add('stopped');
                                });
                            }
                            isPlaying = !isPlaying;
                        }

                        controlEl.addEventListener('click', togglePlay);
                        
                        // 处理微信自动播放
                        document.addEventListener('WeixinJSBridgeReady', function() {
                            audioEl.play().then(() => {
                                isPlaying = true;
                                musicEl.classList.remove('stopped');
                            });
                        }, false);

                        // 处理普通浏览器自动播放
                        document.addEventListener('click', function() {
                            if (!isPlaying) {
                                audioEl.play().then(() => {
                                    isPlaying = true;
                                    musicEl.classList.remove('stopped');
                                });
                            }
                        }, { once: true });

                        // 监听音频播放状态
                        audioEl.addEventListener('play', () => {
                            isPlaying = true;
                            musicEl.classList.remove('stopped');
                        });

                        audioEl.addEventListener('pause', () => {
                            isPlaying = false;
                            musicEl.classList.add('stopped');
                        });
                    },
                }
            }
        });
    }

    private updateAudioComponent() {
        try {
            // 移除现有的音频组件
            const existingAudio = this.editor.Components.getWrapper()?.find('div.background-audio')[0];
            if (existingAudio) {
                existingAudio.remove();
            }

            // 如果启用了音频，添加新的音频组件
            if (this.config.enabled && this.config.url) {
                const wrapper = this.editor.Components.getWrapper();
                if (wrapper) {
                    wrapper.append([
                        {
                            type: 'background-audio',
                            url: this.config.url,
                            style: {
                                position: 'relative',
                                zIndex: 9999
                            }
                        }
                    ]);
                }
            }
        } catch (error) {
            console.error('Error updating audio component:', error);
        }
    }
} 

export {
    AudioPlugin
}