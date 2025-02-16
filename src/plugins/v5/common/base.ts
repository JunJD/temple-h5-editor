import { Editor, PluginOptions } from "grapesjs";
import { OPtion } from '..';
export default class BasePluginV5 {
    editor: Editor
    options: OPtion

    constructor(editor: Editor, options: OPtion) {
        this.editor = editor
        this.options = options
        this.load(options)
    }

    load(options: PluginOptions) {
        this._loadComponents()
        this._loadBlocks()
        this._loadCommands()
    }

    _loadBlocks() {

    }

    _loadComponents() {
        new BaseLoadComponents(this.editor, this.options)
    }

    _loadCommands() {

    }
    
}

export class BaseLoadBlocks {
    editor: Editor
    options: PluginOptions

    constructor(editor: Editor, options: PluginOptions) {
        this.editor = editor
        this.options = options
        this.load()
    }

    load() {
        console.log('load', this.editor, this.options)
    }
}

export class BaseLoadComponents {
    editor: Editor
    options: PluginOptions

    constructor(editor: Editor, options: PluginOptions) {
        this.editor = editor
        this.options = options
        this.load()
    }

    load() {
        console.log('load', this.editor, this.options)
    }

    
}