import { Editor, PluginOptions } from "grapesjs";
import BasePluginV5 from "../base";
import { BaseLoadComponents } from "../base";
import { GridComponents } from "./grid-components";
import { GridBlocks } from "./grid-block";

class LayoutPlugin extends BasePluginV5 {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options)
    }

    _loadComponents() {
        new GridComponents(this.editor, this.options)
    }

    _loadBlocks() {
        new GridBlocks(this.editor, this.options)
    }

}

export default LayoutPlugin