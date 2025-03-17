declare module 'isotope-layout' {
  interface IsotopeOptions {
    itemSelector: string;
    layoutMode: string;
    masonry?: {
      columnWidth: string;
      gutter?: number;
      originLeft?: boolean;
      horizontalOrder?: boolean;
    };
    transitionDuration?: string;
    stagger?: number;
    hiddenStyle?: {
      opacity: number;
    };
    visibleStyle?: {
      opacity: number;
    };
  }

  class Isotope {
    constructor(element: HTMLElement, options: IsotopeOptions);
    destroy(): void;
    layout(): void;
    arrange(options?: Partial<IsotopeOptions>): void;
  }

  export = Isotope;
} 