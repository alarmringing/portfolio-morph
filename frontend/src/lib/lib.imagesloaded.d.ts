declare module 'imagesloaded' {
  interface ImagesLoadedOptions {
    background?: boolean | string;
  }

  interface ImagesLoadedInstance {
    images: Array<{ img: HTMLImageElement }>;
    elements: Array<HTMLElement>;
    on(event: 'always' | 'done' | 'fail' | 'progress', listener: (instance?: ImagesLoadedInstance) => void): void;
    off(event: 'always' | 'done' | 'fail' | 'progress', listener: (instance?: ImagesLoadedInstance) => void): void;
  }

  interface ImagesLoaded {
    (elem: Element | NodeList | Array<Element> | string, callback?: (instance?: ImagesLoadedInstance) => void): ImagesLoadedInstance;
    (elem: Element | NodeList | Array<Element> | string, options: ImagesLoadedOptions, callback?: (instance?: ImagesLoadedInstance) => void): ImagesLoadedInstance;
  }

  const imagesLoaded: ImagesLoaded;
  export = imagesLoaded;
} 