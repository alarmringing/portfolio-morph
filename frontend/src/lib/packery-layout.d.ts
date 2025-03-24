declare module 'packery-layout' {
  interface PackeryOptions {
    itemSelector: string;
    columnWidth?: string | number;
    rowHeight?: string | number;
    gutter?: number;
    percentPosition?: boolean;
    stamp?: string;
    originLeft?: boolean;
    originTop?: boolean;
    containerStyle?: object;
    transitionDuration?: string;
    resize?: boolean;
    initLayout?: boolean;
    horizontal?: boolean;
    isHorizontal?: boolean;
  }

  class Packery {
    constructor(element: HTMLElement, options: PackeryOptions);
    layout(): void;
    reloadItems(): void;
    getItemElements(): HTMLElement[];
    getItem(element: HTMLElement): any;
    fit(element: HTMLElement, x?: number, y?: number): void;
    stamp(elements: HTMLElement | HTMLElement[]): void;
    unstamp(elements: HTMLElement | HTMLElement[]): void;
    appended(elements: HTMLElement | HTMLElement[]): void;
    prepended(elements: HTMLElement | HTMLElement[]): void;
    addItems(elements: HTMLElement | HTMLElement[]): void;
    remove(elements: HTMLElement | HTMLElement[]): void;
    destroy(): void;
    getSize(): { width: number, height: number };
    on(eventName: string, listener: Function): void;
    off(eventName: string, listener: Function): void;
    once(eventName: string, listener: Function): void;
    emitEvent(eventName: string, args: any[]): void;
    shiftLayout(): void;
    needsResizeLayout(): boolean;
    bindResize(): void;
    unbindResize(): void;
    sortItemsByPosition(): void;
    arrange(options?: any): void;
  }

  export default Packery;
}

declare module 'isotope-packery' {
  // This module automatically registers itself with Isotope
  // No need to export anything specific
} 