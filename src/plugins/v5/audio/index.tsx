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
                    )
