declare module 'isotope-layout' {
  interface IsotopeOptions {
    itemSelector: string;
    originLeft: boolean;
    layoutMode: string;
    masonry?: {
      columnWidth: string;
      gutter?: number;
      originLeft?: boolean;
      horizontalOrder?: boolean;
    };
    packery?: {
      gutter?: number;
      columnWidth?: string | number;
      rowHeight?: string | number;
    };
    transitionDuration?: string;
    stagger?: number;
    hiddenStyle?: {
      opacity: number;
    };
    visibleStyle?: {
      opacity: number;
    };
    filter?: string;
  }

  class Isotope {
    constructor(element: HTMLElement, options: IsotopeOptions);
    destroy(): void;
    layout(): void;
    arrange(options?: Partial<IsotopeOptions>): void;
  }

  export default Isotope;
} 

