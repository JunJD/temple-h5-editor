import { Editor, PluginOptions } from "grapesjs";
import { LinkageFormComponents } from "./components";
import { LinkageFormBlocks } from "./blocks";
import BasePluginV5 from "../common/base";

export default class LinkageFormPlugin extends BasePluginV5 {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
        new LinkageFormComponents(editor, options).load();
        new LinkageFormBlocks(editor, options).load();
    }

    _loadComponents(): void {
        new LinkageFormComponents(this.editor, this.options);
    }

    _loadBlocks(): void {
        new LinkageFormBlocks(this.editor, this.options);
    }
}
