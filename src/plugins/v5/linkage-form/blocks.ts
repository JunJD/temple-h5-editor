import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadBlocks } from "../common/base";
import { LINKAGE_FORM_TYPES, PRESETS } from "./constants";
import { CASCADE_SELECTOR_TYPES } from "./constants";


export class LinkageFormBlocks extends BaseLoadBlocks {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
    }
} 