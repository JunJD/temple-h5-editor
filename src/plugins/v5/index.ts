import { Editor, PluginOptions } from 'grapesjs';
// import loadCommands from './commands';
// import loadTraits from './traits';
import LayoutPlugin from './layout';
import CustomTabPlugin from './custom-tab';
import LinkageFormPlugin from './linkage-form';
import { AudioPlugin } from './audio';
import {
  ConfigurableFormPlugin
} from './configurable-form'
import { FormConfig } from '@/schemas';
import PayButtonPlugin from './pay-button';
// import loadDevices from './devices';


export interface OPtion extends PluginOptions {
  cssAssert?: string;
  jsAssert?: string;
  formConfig?: FormConfig;
  updateFormConfig?: (newConfig: FormConfig) => void;
}

export default (editor: Editor, opts: OPtion) => {
  let options = {
    ...{
      cssAssert: '/bootstrap-5.3.3-dist/css/bootstrap.min.css',
      fixCssAssert: '/bootstrap-5.3.3-dist/css/fix.css',
      jsAssert: '/bootstrap-5.3.3-dist/js/bootstrap.bundle.min.js',
    }, ...opts
  };

  editor.on('load', () => {
    const frame = editor.Canvas.getFrameEl();
    if (!frame) return;

    const doc = frame.contentDocument;
    if (!doc) return;

    if (options.cssAssert) {
      const linkEl = doc.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = options.cssAssert;
      doc.head.appendChild(linkEl);
    }

    if (options.fixCssAssert) {
      const linkEl = doc.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = options.fixCssAssert;
      doc.head.appendChild(linkEl);
    }

    if (options.jsAssert) {
      const scriptEl = doc.createElement('script');
      scriptEl.src = options.jsAssert;
      doc.head.appendChild(scriptEl);
    }
  });

  new LayoutPlugin(editor, options);
  new CustomTabPlugin(editor, options);
  new LinkageFormPlugin(editor, options);
  new AudioPlugin(editor);
  new ConfigurableFormPlugin(editor, options)
  new PayButtonPlugin(editor, options)
};