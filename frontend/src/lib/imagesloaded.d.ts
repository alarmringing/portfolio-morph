declare module 'imagesloaded' {
  export interface ImagesLoadedInstance {
    images: Array<{ img: HTMLImageElement; isLoaded: boolean }>;
    progressedCount: number;
    hasAnyBroken: boolean;
    isComplete: boolean;
  }

  export interface LoadingImage {
    img: HTMLImageElement;
    isLoaded: boolean;
  }

  export interface ImagesLoadedOptions {
    background?: boolean | string;
  }

  export interface ImagesLoadedEvents {
    always: () => void;
    done: () => void;
    fail: () => void;
    progress: (instance: ImagesLoadedInstance, image: LoadingImage) => void;
  }

  export interface ImagesLoaded {
    on<K extends keyof ImagesLoadedEvents>(
      event: K,
      listener: ImagesLoadedEvents[K]
    ): this;
    off<K extends keyof ImagesLoadedEvents>(
      event: K,
      listener: ImagesLoadedEvents[K]
    ): this;
    once<K extends keyof ImagesLoadedEvents>(
      event: K,
      listener: ImagesLoadedEvents[K]
    ): this;
  }

  function imagesLoaded(
    element: Element | string | NodeList | Array<Element>,
    options?: ImagesLoadedOptions
  ): ImagesLoaded;

  export default imagesLoaded;
}