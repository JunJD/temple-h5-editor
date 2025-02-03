import { Editor, PluginOptions } from "grapesjs";
import { CascadeSelectorComponents } from "./components";

export const loadCascadeSelector = (editor: Editor, options: PluginOptions = {}) => {
    const components = new CascadeSelectorComponents(editor, options);
    components.load();
}; 