import type { Editor as GrapesEditor, Plugin } from 'grapesjs';
import Ruler from './ruler';
import './style.css'

type DragMode = 'translate' | 'absolute';

interface ExtendedEditor extends GrapesEditor {
    Rulers?: Ruler;
}

interface PluginOptions {
    dragMode?: DragMode;
    rulerHeight?: number;
    canvasZoom?: number;
    rulerOpts?: Record<string, any>;
    guides?: Array<{ posX: number; posY: number; dimension: number }>;
    zoom?: number;
}

const plugin: Plugin<PluginOptions> = (editor: ExtendedEditor, opts: PluginOptions = {}) => {
    const options = {
        ...{
            // default options
            dragMode: 'translate' as DragMode,
            rulerHeight: 15,
            canvasZoom: 94,
            rulerOpts: {},
        },
        ...opts
    };

    const cm = editor.Commands;
    const rulH = options.rulerHeight;
    const defaultDragMode = editor.getConfig('dragMode');
    let zoom = options.canvasZoom
    let scale = 100 / zoom;
    let rulers;

    cm.add('ruler-visibility', {
        run(editor: ExtendedEditor) {
            !rulers && (rulers = new Ruler({
                container: editor.Canvas.getCanvasView().el,
                canvas: editor.Canvas.getFrameEl(),
                rulerHeight: rulH,
                strokeStyle: 'white',
                fillStyle: 'white',
                cornerIcon: 'fa fa-trash',
                ...options.rulerOpts
            })) && editor.on('canvasScroll frame:scroll change:canvasOffset', () => {
                setOffset();
            });
            editor.Rulers = rulers;
            rulers.api.toggleRulerVisibility(true);
            editor.Canvas.setZoom(zoom);
            editor.setDragMode(options.dragMode);
            setOffset();
            rulers.api.setScale(scale);
        },
        stop(editor: ExtendedEditor) {
            rulers && rulers.api.toggleRulerVisibility(false);
            editor.Canvas.setZoom(100);
            editor.setDragMode(defaultDragMode as DragMode);
        }
    });

    const setOffset = () => {
        const { top, left } = editor.Canvas.getOffset();
        const scrollX = editor.Canvas.getBody().scrollLeft;
        const scrollY = editor.Canvas.getBody().scrollTop;
        rulers.api.setPos({
            x: left - rulH - scrollX / scale,
            y: top - rulH - scrollY / scale
        });
        rulers.api.setScroll({
            x: scrollX,
            y: scrollY
        });
    }

    cm.add('guides-visibility', {
        run() {
            rulers && rulers.api.toggleGuideVisibility(true);
        },
        stop() {
            rulers && rulers.api.toggleGuideVisibility(false);
        }
    });

    cm.add('get-rulers', () => {
        return rulers;
    });

    cm.add('get-rulers-constructor', () => {
        return Ruler;
    });

    cm.add('clear-guides', () => {
        rulers && rulers.api.clearGuides();
    });

    cm.add('get-guides', () => {
        if (rulers) return rulers.api.getGuides();
        else return 0;
    });

    cm.add('set-guides', (editor: ExtendedEditor, sender: any, options: PluginOptions = {}) => {
        rulers && options.guides && rulers.api.setGuides(options.guides);
    });

    cm.add('set-zoom', (editor: ExtendedEditor, sender: any, options: PluginOptions = {}) => {
        zoom = options.zoom || zoom;
        scale = 100 / zoom;
        editor.Canvas.setZoom(zoom);
        setOffset();
        rulers && rulers.api.setScale(scale);
    });

    cm.add('destroy-ruler', () => {
        rulers && rulers.api.destroy();
    });
};

export default plugin;