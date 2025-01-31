import { Editor, PluginOptions } from "grapesjs";
import BasePluginV5 from "../common/base";

import { CustomTabComponents } from "./custom-tab-components";
import { CustomTabBlocks } from "./custom-tab-block";

class CustomTabPlugin extends BasePluginV5 {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options)
    }

    _loadComponents() {
        new CustomTabComponents(this.editor, this.options)
    }

    _loadBlocks() {
        new CustomTabBlocks(this.editor, this.options)
    }

}

export default CustomTabPlugin