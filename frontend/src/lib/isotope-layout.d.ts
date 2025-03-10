declare module 'isotope-layout' {
  interface IsotopeOptions {
    itemSelector: string;
    layoutMode: string;
    masonry?: {
      columnWidth: string;
      gutter?: number;
    };
    // Add other options as needed
  }

  class Isotope {
    constructor(element: HTMLElement, options: IsotopeOptions);
    destroy(): void;
    layout(): void;
    arrange(options?: Partial<IsotopeOptions>): void;
  }

  export = Isotope;
} 