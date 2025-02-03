import { Editor, PluginOptions } from "grapesjs";
import { BaseLoadComponents } from "../common/base";
import { loadInputGroup } from "./form-item/input-group";
import { loadCascadeSelector } from "./form-item/cascade-selector/index";

export class LinkageFormComponents extends BaseLoadComponents {
    constructor(editor: Editor, options: PluginOptions) {
        super(editor, options);
    }

    load() {
        const editor = this.editor;
        loadInputGroup(editor);
        loadCascadeSelector(editor);
    }
} 