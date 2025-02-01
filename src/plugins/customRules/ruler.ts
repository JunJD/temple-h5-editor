import { utils } from './utils';

interface RulerOptions {
    container: HTMLElement;
    canvas: HTMLElement;
    rulerHeight: number;
    fontFamily?: string;
    fontSize?: string;
    strokeStyle?: string;
    fillStyle?: string;
    sides?: string[];
    cornerSides?: string[];
    lineWidth?: number;
    enableMouseTracking?: boolean;
    enableToolTip?: boolean;
    cornerIcon?: string;
}

interface Guide {
    dimension: number;
    line: GuideLine;
}

interface GuideData {
    posX: number;
    posY: number;
    dimension: number;
}

interface DraggableElement extends HTMLElement {
    style: CSSStyleDeclaration;
    dataset: DOMStringMap;
    setAsDraggable?: {
        startMoving: (e: MouseEvent) => void;
        stopMoving: () => void;
    };
}

interface GuideLine {
    setAsDraggable: {
        startMoving: (e: MouseEvent) => void;
        stopMoving: () => void;
    };
    startDrag: (event: MouseEvent) => void;
    stopDrag: () => void;
    destroy: () => void;
    curScale: (val?: number) => number;
    assigned: (val?: boolean) => boolean;
    curPosDelta: (val?: number) => number;
    guideLine: DraggableElement;
    dimension: number;
    hide: () => void;
    show: () => void;
}

interface Corner extends HTMLElement {
    destroy?: () => void;
}

interface RulerElement extends HTMLElement {
    align?: string;
    style: CSSStyleDeclaration;
}

interface StyleElement extends HTMLElement {
    style: CSSStyleDeclaration;
}

interface RulerInstance {
    dimension: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    orgPos: number;
    setScale: (scale: number) => void;
    drawRuler: (rulerLength: number, rulerThickness: number, rulerScale?: number) => void;
    destroy: () => void;
    clearListeners?: () => void;
}

export default class Ruler {
    private readonly VERTICAL = 1;
    private readonly HORIZONTAL = 2;
    private CUR_DELTA_X = 0;
    private CUR_DELTA_Y = 0;
    private SCROLL_X = 0;
    private SCROLL_Y = 0;
    private CUR_SCALE = 1;
    
    private options: Required<RulerOptions>;
    private rulerz: Record<string, RulerInstance> = {};
    private guides: Guide[] = [];
    private theRulerDOM: RulerElement;
    private corners: Corner[] = [];
    private utils = utils;
    private canvasPointerEvents: string;
    private api: any;
    private clearListeners?: () => void;
    private drawPoints?: () => void;

    constructor(options: RulerOptions) {
        this.canvasPointerEvents = options.canvas.style.pointerEvents;
        this.options = {
            rulerHeight: 15,
            fontFamily: 'arial',
            fontSize: '8px',
            strokeStyle: 'gray',
            fillStyle: 'white',
            sides: ['top', 'left'],
            cornerSides: ['TL'],
            lineWidth: 1,
            enableMouseTracking: true,
            enableToolTip: true,
            cornerIcon: '',
            container: options.container,
            canvas: options.canvas
        };
        this.theRulerDOM = document.createElement('div') as RulerElement;
        this.initializeRuler();
        this.api = this.createAPI();
    }

    private createAPI() {
        return {
            VERTICAL: this.VERTICAL,
            HORIZONTAL: this.HORIZONTAL,
            getPos: this.getPos.bind(this),
            setPos: this.setPos.bind(this),
            setScroll: this.setScroll.bind(this),
            setScale: this.setScale.bind(this),
            clearGuides: this.clearGuides.bind(this),
            removeGuide: this.removeGuide.bind(this),
            getGuides: this.getGuides.bind(this),
            setGuides: this.setGuides.bind(this),
            constructRulers: this.initializeRuler.bind(this),
            toggleRulerVisibility: this.toggleRulerVisibility.bind(this),
            toggleGuideVisibility: this.toggleGuideVisibility.bind(this),
            destroy: this.destroy.bind(this)
        };
    }

    private initializeRuler(): void {
        this.theRulerDOM = this.utils.addClasss(this.theRulerDOM, 'rul_wrapper');
        this.theRulerDOM = this.options.container.appendChild(this.theRulerDOM);
        this.options.sides.forEach((side) => {
            this.constructRuler(this.theRulerDOM, side);
        });
        this.constructCorner(this.theRulerDOM, this.options.cornerSides);
        this.options.container.addEventListener('mouseup', this.mouseup);
    }

    private constructRuler = (container: HTMLElement, alignment: string): void => {
        const dimension: number = alignment === 'left' || alignment === 'right' ? this.VERTICAL : this.HORIZONTAL;
        const rulerStyle: string = dimension === this.VERTICAL ? 'rul_ruler_Vertical' : 'rul_ruler_Horizontal';
        const element: HTMLCanvasElement = document.createElement('canvas');

        this.utils.addClasss(element, ['rul_ruler', rulerStyle, 'rul_align_' + alignment]);
        const canvas = container.appendChild(element);
        this.rulerz[alignment] = this.rulerConstructor(canvas, this.options, dimension);
        this.rulerz[alignment].drawRuler(container.offsetWidth, this.options.rulerHeight);
        this.positionRuler(this.rulerz[alignment], alignment);
        this.attachListeners(container, this.rulerz[alignment]);
    };

    private mouseup = (e: MouseEvent): void => {
        this.guides.forEach((guide) => {
            if (guide.line && guide.line.stopDrag) {
                guide.line.stopDrag();
            }
        });
    };

    private constructGuide = (dimension: number, x: number, y: number, e: MouseEvent | null, isSet: boolean = false): void => {
        let guideIndex: number;
        let moveCB = (line: GuideLine, x: number, y: number) => {
            const coor = line.dimension === this.VERTICAL ? x : y;
            if (!line.assigned()) {
                if (coor > this.options.rulerHeight) {
                    line.assigned(true);
                }
                return;
            }

            if (coor < this.options.rulerHeight) {
                this.guides.some((guideLine, index) => {
                    if (guideLine.line === line) {
                        guideIndex = index;
                        return true;
                    }
                    return false;
                });
                line.destroy();
                this.guides.splice(guideIndex, 1);
            }
        };

        const guide = document.createElement('div') as DraggableElement;
        const guideStyle = dimension === this.VERTICAL ? 'rul_lineVer' : 'rul_lineHor';
        const curDelta = dimension === this.VERTICAL ? this.CUR_DELTA_X : this.CUR_DELTA_Y;
        
        guide.title = 'Double click to delete';
        guide.dataset.id = this.guides.length.toString();
        this.utils.addClasss(guide, ['rul_line', guideStyle]);
        
        const appendedGuide = this.theRulerDOM.appendChild(guide) as DraggableElement;
        if (!appendedGuide) return;
        
        if (dimension === this.VERTICAL) {
            appendedGuide.style.left = this.utils.pixelize(x - this.options.container.getBoundingClientRect().left);
            if (isSet) appendedGuide.style.left = this.utils.pixelize(Math.round(x / this.CUR_SCALE + this.options.rulerHeight - this.SCROLL_X));
        } else {
            appendedGuide.style.top = this.utils.pixelize(y - this.options.container.getBoundingClientRect().top);
            if (isSet) appendedGuide.style.top = this.utils.pixelize(Math.round(y / this.CUR_SCALE + this.options.rulerHeight - this.SCROLL_Y));
        }
        
        const wrapper = this.options.container.querySelector('.rul_wrapper') as HTMLElement;
        if (!wrapper) return;

        this.guides.push({
            dimension: dimension,
            line: this.guideLine(appendedGuide, wrapper, dimension, this.options, curDelta, moveCB, e, this.CUR_SCALE)
        });
    };

    private attachListeners = (container: HTMLElement, curRul: RulerInstance): void => {
        const mousedown = (e: MouseEvent) => {
            this.constructGuide(curRul.dimension, e.clientX, e.clientY, e);
        };

        curRul.canvas.addEventListener('mousedown', mousedown);
        curRul.clearListeners = () => {
            curRul.canvas.removeEventListener('mousedown', mousedown);
        };
    };

    private positionRuler = (curRuler, alignment) => {
        curRuler.canvas.style.left = this.utils.pixelize(-((curRuler.canvas.width / 2) - curRuler.canvas.height));
        switch (alignment) {
            case 'top':
                curRuler.orgPos = parseInt(curRuler.canvas.style.left);
                break;
            case 'left':
                curRuler.canvas.style.top = this.utils.pixelize(-curRuler.canvas.height - 1);
                curRuler.orgPos = parseInt(curRuler.canvas.style.top);
                this.rotateRuler(curRuler, 90);
                break;
        }
    };

    private rotateRuler = (curRuler, angle) => {
        const rotation = 'rotate(' + angle + 'deg)';
        const origin = this.utils.pixelize(Math.abs(parseInt(curRuler.canvas.style.left))) + ' 100%';
        curRuler.canvas.style.webkitTransform = rotation;
        curRuler.canvas.style.MozTransform = rotation;
        curRuler.canvas.style.OTransform = rotation;
        curRuler.canvas.style.msTransform = rotation;
        curRuler.canvas.style.transform = rotation;
        curRuler.canvas.style.webkitTransformOrigin = origin;
        curRuler.canvas.style.MozTransformOrigin = origin;
        curRuler.canvas.style.OTransformOrigin = origin;
        curRuler.canvas.style.msTransformOrigin = origin;
        curRuler.canvas.style.transformOrigin = origin;
    };

    private constructCorner = (container, cornerSides) => {
        const cornerDraw = (container: HTMLElement, side: string): Corner => {
            const corner = document.createElement('div'),
                cornerStyle = 'rul_corner' + side.toUpperCase();

            corner.title = 'Clear Guide lines';
            this.utils.addClasss(corner, ['rul_corner', cornerStyle, this.options.cornerIcon]);
            corner.style.width = this.utils.pixelize(this.options.rulerHeight + 1);
            corner.style.height = this.utils.pixelize(this.options.rulerHeight);
            corner.style.lineHeight = this.utils.pixelize(this.options.rulerHeight);
            return container.appendChild(corner);
        }

        const mousedown = (e: MouseEvent) => {
            e.stopPropagation();
            this.clearGuides();
        }

        cornerSides.forEach(function (side) {
            const corner = cornerDraw(container, side);
            corner.addEventListener('mousedown', mousedown);
            corner.destroy = function () {
                corner.removeEventListener('mousedown', mousedown);
                corner.parentNode?.removeChild(corner);
            };
            this.corners.push(corner);
        }.bind(this));
    }

    private clearGuides = () => {
        this.guides.forEach(function (guide) {
            guide.line.destroy();
        });
        this.guides = [];
    };

    private removeGuide = (id) => {
        const last = this.guides.length - 1;
        [this.guides[id], this.guides[last]] = [this.guides[last], this.guides[id]];
        this.guides.pop();
    };

    private toggleGuideVisibility = (val: boolean): void => {
        const func = val ? 'show' : 'hide';
        this.guides.forEach((guide) => {
            if (guide.line && typeof guide.line[func] === 'function') {
                guide.line[func]();
            }
        });
    };

    private toggleRulerVisibility = (val: boolean): void => {
        const state = val ? 'block' : 'none';
        if (this.theRulerDOM) {
            this.theRulerDOM.style.display = state;
        }
        const trackers = this.options.container.querySelectorAll('.rul_tracker');
        trackers.forEach((tracker) => {
            if (tracker instanceof HTMLElement) {
                tracker.style.display = state;
            }
        });
    };

    private getGuides = () => {
        return this.guides.map(function (guide) {
            return {
                posX: Math.round((parseInt(guide.line.guideLine.style.left) - this.options.rulerHeight + this.SCROLL_X) * this.CUR_SCALE),
                posY: Math.round((parseInt(guide.line.guideLine.style.top) - this.options.rulerHeight + this.SCROLL_Y) * this.CUR_SCALE),
                dimension: guide.dimension
            }
        }.bind(this));
    };

    private setGuides = (_guides) => {
        if (!_guides || !_guides.length) {
            return
        }
        _guides.forEach(function (guide) {
            this.constructGuide(guide.dimension, guide.posX, guide.posY, null, true)
        }.bind(this));
    };

    private destroy = () => {
        this.clearGuides();
        for (let rul in this.rulerz) {
            if (this.rulerz.hasOwnProperty(rul)) {
                this.rulerz[rul].destroy();
            }
        }
        this.corners.forEach(function (corner) {
            corner.destroy?.();
        });
        this.options.container.removeEventListener('mouseup', this.mouseup);
        this.theRulerDOM.parentNode?.removeChild(this.theRulerDOM);
    };

    private rulerConstructor(_canvas, options, rulDimension) {
        let canvas = _canvas,
            context = canvas.getContext('2d'),
            rulThickness = 0,
            rulLength = 0,
            rulScale = 1,
            dimension = rulDimension || 2,
            orgPos = 0,
            tracker = document.createElement('div');

        const getLength = () => {
            return rulLength;
        };

        const getThickness = () => {
            return rulThickness;
        };

        const getScale = () => {
            return rulScale;
        };

        const setScale = (newScale) => {
            rulScale = parseFloat(newScale);
            this.drawPoints &&this.drawPoints();
            return rulScale;
        };

        const drawRuler = (_rulerLength, _rulerThickness, _rulerScale) => {
            rulLength = canvas.width = _rulerLength * 4;
            rulThickness = canvas.height = _rulerThickness;
            rulScale = _rulerScale || rulScale;
            context.strokeStyle = options.strokeStyle;
            context.fillStyle = options.fillStyle;
            context.font = options.fontSize + ' ' + options.fontFamily;
            context.lineWidth = options.lineWidth;
            context.beginPath();
            this.drawPoints && this.drawPoints();
            context.stroke();
        };

        const drawPoints = () => {
            let pointLength = 0,
                label: string = '',
                delta = 0,
                draw = false,
                lineLengthMax = 0,
                lineLengthMed = rulThickness / 2,
                lineLengthMin = rulThickness / 2;

            for (let pos = 0; pos <= rulLength; pos += 1) {
                delta = ((rulLength / 2) - pos);
                draw = false;
                label = '';

                if (delta % 50 === 0) {
                    pointLength = lineLengthMax;
                    label = Math.round(Math.abs(delta) * rulScale).toString();
                    draw = true;
                } else if (delta % 25 === 0) {
                    pointLength = lineLengthMed;
                    draw = true;
                } else if (delta % 5 === 0) {
                    pointLength = lineLengthMin;
                    draw = true;
                }
                if (draw) {
                    context.moveTo(pos + 0.5, rulThickness + 0.5);
                    context.lineTo(pos + 0.5, pointLength + 0.5);
                    context.fillText(label, pos + 1.5, (rulThickness / 2) + 1);
                }
            }
        };

        const mousemove = (e) => {
            let x = e.clientX, y = e.clientY;

            if (e.target.tagName === 'IFRAME') {
                const zoom = getScale() ** -1;
                x = x * zoom + e.target.getBoundingClientRect().left;
                y = y * zoom + e.target.getBoundingClientRect().top;
            }

            if (dimension === 2) {
                tracker.style.left = this.utils.pixelize(x - this.options.container.getBoundingClientRect().left);
            } else {
                tracker.style.top = this.utils.pixelize(y - this.options.container.getBoundingClientRect().top);
            }
        };

        const destroy = () => {
            this.options.container.removeEventListener('mousemove', mousemove);
            tracker.parentNode?.removeChild(tracker);
            this.clearListeners && this.clearListeners();
        };

        const initTracker = () => {
            tracker = this.options.container.appendChild(tracker);
            this.utils.addClasss(tracker, 'rul_tracker');
            const height = this.utils.pixelize(this.options.rulerHeight);
            if (dimension === 2) {
                tracker.style.height = height;
            } else {
                tracker.style.width = height;
            }
            this.options.container.addEventListener('mousemove', mousemove);
        };

        if (options.enableMouseTracking) {
            initTracker();
        }

        return {
            getLength,
            getThickness,
            getScale,
            setScale,
            dimension,
            orgPos,
            canvas,
            context,
            drawRuler,
            drawPoints,
            destroy
        }
    }

    private guideLine = (
        line: DraggableElement,
        dragContainer: HTMLElement,
        lineDimension: number,
        options: Required<RulerOptions>,
        curDelta: number,
        movecb: (line: GuideLine, x: number, y: number) => void,
        event: MouseEvent | null,
        scale: number
    ): GuideLine => {
        let self: GuideLine;
        const guideLine = line;
        let _curScale = scale || 1;
        let _assigned = false;
        let _curPosDelta = curDelta || 0;
        const dimension = lineDimension || 2;
        let _moveCB = movecb || function () { };

        const curPosDelta = (val?: number) => {
            if (typeof val === 'undefined') {
                return _curPosDelta;
            }
            return (_curPosDelta = val);
        };

        const assigned = (val?: boolean) => {
            if (typeof val === 'undefined') {
                return _assigned;
            }
            return (_assigned = val);
        };

        const curScale = (val?: number) => {
            if (typeof val === 'undefined') {
                return _curScale;
            }
            return (_curScale = val);
        };

        const draggable = {
            cv: () => {
                return this.options.canvas;
            },
            move: (xpos: number, ypos: number) => {
                guideLine.style.left = this.utils.pixelize(xpos);
                guideLine.style.top = this.utils.pixelize(ypos);
                this.updateToolTip(xpos, ypos);
                _moveCB(self, xpos, ypos);
            },
            startMoving: (evt: MouseEvent) => {
                draggable.cv().style.pointerEvents = 'none';
                this.utils.addClasss(guideLine, ['rul_line_dragged']);
                const posX = evt ? evt.clientX : 0;
                const posY = evt ? evt.clientY : 0;
                const divTop = parseInt(guideLine.style.top || '0');
                const divLeft = parseInt(guideLine.style.left || '0');
                const eWi = parseInt(guideLine.offsetWidth.toString());
                const eHe = parseInt(guideLine.offsetHeight.toString());
                const cWi = parseInt(dragContainer.offsetWidth.toString());
                const cHe = parseInt(dragContainer.offsetHeight.toString());
                const cursor = dimension === 2 ? 'ns-resize' : 'ew-resize';

                this.options.container.style.cursor = cursor;
                guideLine.style.cursor = cursor;
                const diffX = posX - divLeft;
                const diffY = posY - divTop;

                document.onmousemove = (evt: MouseEvent) => {
                    const posX = evt.clientX;
                    const posY = evt.clientY;
                    let aX = posX - diffX;
                    let aY = posY - diffY;

                    if (aX < 0) aX = 0;
                    if (aY < 0) aY = 0;
                    if (aX + eWi > cWi) aX = cWi - eWi;
                    if (aY + eHe > cHe) aY = cHe - eHe;

                    draggable.move(aX, aY);
                };
                this.showToolTip(evt);
            },
            stopMoving: () => {
                draggable.cv().style.pointerEvents = this.canvasPointerEvents;
                this.options.container.style.cursor = '';
                guideLine.style.cursor = '';
                document.onmousemove = null;
                this.hideToolTip(new MouseEvent('mouseout'));
                this.utils.removeClasss(guideLine, ['rul_line_dragged']);
            }
        };

        const destroy = () => {
            draggable.stopMoving();
            _moveCB = () => {};
            guideLine.removeEventListener('mousedown', mousedown);
            guideLine.removeEventListener('mouseup', mouseup);
            guideLine.removeEventListener('dblclick', dblclick);
            guideLine.parentNode?.removeChild(guideLine);
        };

        const hide = () => {
            guideLine.style.display = 'none';
        };

        const show = () => {
            guideLine.style.display = 'block';
        };

        const mousedown = (e: MouseEvent) => {
            e.stopPropagation();
            draggable.startMoving(e);
        };

        const mouseup = (e: MouseEvent) => {
            draggable.stopMoving();
        };

        const dblclick = (e: MouseEvent) => {
            e.stopPropagation();
            destroy();
            this.api.removeGuide(guideLine.dataset.id);
        };

        guideLine.addEventListener('mousedown', mousedown);
        guideLine.addEventListener('mouseup', mouseup);
        guideLine.addEventListener('dblclick', dblclick);
        
        if (event) {
            draggable.startMoving(event);
        }

        self = {
            setAsDraggable: draggable,
            startDrag: draggable.startMoving,
            stopDrag: draggable.stopMoving,
            destroy,
            curScale,
            assigned,
            curPosDelta,
            guideLine,
            dimension,
            hide,
            show
        };

        return self;
    };

    private showToolTip = (e: MouseEvent): void => {
        if (!this.options.enableToolTip || !e.target) {
            return;
        }
        const guideLine = e.target as StyleElement;
        this.utils.addClasss(guideLine, 'rul_tooltip');
    };

    private hideToolTip = (e: MouseEvent): void => {
        if (!e.target) return;
        const guideLine = e.target as StyleElement;
        this.utils.removeClasss(guideLine, 'rul_tooltip');
    };

    private updateToolTip = (x: number, y: number): void => {
        const guideLine = document.querySelector('.rul_line') as StyleElement;
        if (!guideLine) return;
        
        const value = y 
            ? Math.round((y - this.options.rulerHeight - 1 - this.CUR_DELTA_Y) * this.CUR_SCALE)
            : Math.round((x - this.options.rulerHeight - 1 - this.CUR_DELTA_X) * this.CUR_SCALE);
        
        guideLine.dataset.tip = `${value}px`;
    };

    private getPos = () => {
        return {
            x: this.CUR_DELTA_X,
            y: this.CUR_DELTA_Y
        };
    };

    private setPos = (values: { x: number; y: number }) => {
        let orgX: string = '0',
            orgY: string = '0',
            deltaX = 0,
            deltaY = 0;

        Object.keys(this.rulerz).forEach((key) => {
            const curRul = this.rulerz[key];
            if (curRul.dimension === this.VERTICAL) {
                orgY = curRul.canvas.style.top || '0';
                curRul.canvas.style.top = this.utils.pixelize(curRul.orgPos + parseInt(values.y.toString()));
                deltaY = parseInt(orgY) - parseInt(curRul.canvas.style.top || '0');
            } else {
                orgX = curRul.canvas.style.left || '0';
                curRul.canvas.style.left = this.utils.pixelize(curRul.orgPos + parseInt(values.x.toString()));
                deltaX = parseInt(orgX) - parseInt(curRul.canvas.style.left || '0');
            }
        });

        this.guides.forEach((guide) => {
            const guideLine = guide.line.guideLine as StyleElement;
            if (guide.dimension === this.HORIZONTAL) {
                guideLine.style.top = this.utils.pixelize(parseInt(guideLine.style.top || '0') - deltaY);
                guide.line.curPosDelta(parseInt(values.y.toString()));
            } else {
                guideLine.style.left = this.utils.pixelize(parseInt(guideLine.style.left || '0') - deltaX);
                guide.line.curPosDelta(parseInt(values.x.toString()));
            }
        });

        this.CUR_DELTA_X = parseInt(values.x.toString());
        this.CUR_DELTA_Y = parseInt(values.y.toString());
    };

    private setScale = (newScale: number) => {
        let curPos: number, orgDelta: number, curScaleFac: number;
        Object.keys(this.rulerz).forEach((key) => {
            const rul = this.rulerz[key];
            rul.context.clearRect(0, 0, rul.canvas.width, rul.canvas.height);
            rul.context.beginPath();
            rul.setScale(newScale);
            rul.context.stroke();
            this.CUR_SCALE = newScale;
        });

        this.guides.forEach((guide) => {
            const guideLine = guide.line.guideLine as StyleElement;
            if (guide.dimension === this.HORIZONTAL) {
                curPos = parseInt(guideLine.style.top);
                orgDelta = this.options.rulerHeight + 1;
                curScaleFac = parseFloat(newScale.toString()) / guide.line.curScale();
                guideLine.style.top = this.utils.pixelize(((curPos - orgDelta - this.CUR_DELTA_Y) / curScaleFac) + orgDelta + this.CUR_DELTA_Y);
                guide.line.curScale(newScale);
            } else {
                curPos = parseInt(guideLine.style.left);
                orgDelta = this.options.rulerHeight + 1;
                curScaleFac = parseFloat(newScale.toString()) / guide.line.curScale();
                guideLine.style.left = this.utils.pixelize(((curPos - orgDelta - this.CUR_DELTA_X) / curScaleFac) + orgDelta + this.CUR_DELTA_X);
                guide.line.curScale(newScale);
            }
        });
    };

    private setScroll = (values: { x: number; y: number }) => {
        this.SCROLL_X = values.x;
        this.SCROLL_Y = values.y;
    };
}