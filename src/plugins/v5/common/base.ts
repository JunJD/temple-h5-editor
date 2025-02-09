import { Editor, PluginOptions } from "grapesjs";

export default class BasePluginV5 {
    editor: Editor
    options: PluginOptions

    constructor(editor: Editor, options: PluginOptions) {
        this.editor = editor
        this.options = options
        this.load(options)
    }

    load(options: PluginOptions) {
        this._loadComponents()
        this._loadBlocks()
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