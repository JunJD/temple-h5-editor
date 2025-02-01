interface Utils {
    extend: (...args: any[]) => any;
    pixelize: (val: number | string) => string;
    prependChild: (container: HTMLElement, element: HTMLElement) => HTMLElement;
    addClasss: (element: HTMLElement, classNames: string | string[]) => HTMLElement;
    removeClasss: (element: HTMLElement, classNames: string | string[]) => HTMLElement;
}

export const utils: Utils = {
    extend(...args: any[]) {
        for (let i = 1; i < args.length; i++)
            for (let key in args[i])
                if (args[i].hasOwnProperty(key))
                    args[0][key] = args[i][key];
        return args[0];
    },
    pixelize(val: number | string) {
        return val + 'px';
    },
    prependChild(container: HTMLElement, element: HTMLElement) {
        return container.insertBefore(element, container.firstChild);
    },
    addClasss(element: HTMLElement, classNames: string | string[]) {
        if (!(classNames instanceof Array)) {
            classNames = [classNames];
        }

        classNames.forEach(function (name) {
            element.className += ' ' + name;
        });

        return element;
    },
    removeClasss(element: HTMLElement, classNames: string | string[]) {
        let curCalsss = element.className;
        if (!(classNames instanceof Array)) {
            classNames = [classNames];
        }

        classNames.forEach(function (name) {
            curCalsss = curCalsss.replace(name, '');
        });
        element.className = curCalsss;
        return element;
    }
}