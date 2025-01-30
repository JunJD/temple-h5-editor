import { Editor, PluginOptions } from 'grapesjs';
// import loadCommands from './commands';
// import loadTraits from './traits';
import LayoutPlugin from './layout';
// import loadDevices from './devices';


interface OPtion extends PluginOptions {
    cssAssert?: string;
    jsAssert?: string;
}

export default (editor: Editor, opts: OPtion) => {
  let options = { ...{
    cssAssert: '/bootstrap-5.3.3-dist/css/bootstrap.min.css',
    jsAssert: '/bootstrap-5.3.3-dist/js/bootstrap.bundle.min.js',
  }, ...opts };

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

    if (options.jsAssert) {
      const scriptEl = doc.createElement('script');
      scriptEl.src = options.jsAssert;
      doc.head.appendChild(scriptEl);
    }
  });

  // Add components
//   loadCommands(editor, options);
//   loadTraits(editor, options);
  new LayoutPlugin(editor, options);
};
