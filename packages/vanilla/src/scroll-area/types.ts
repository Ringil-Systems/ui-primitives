export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';
export type Direction = 'ltr' | 'rtl';

export interface ScrollAreaOptions {
  type?: ScrollAreaType;
  dir?: Direction;
  scrollHideDelay?: number;
}

export interface ScrollAreaElements {
  root: HTMLElement;
  viewport: HTMLElement;
  content: HTMLElement;
  scrollbarX: HTMLElement | null;
  scrollbarY: HTMLElement | null;
  thumbX: HTMLElement | null;
  thumbY: HTMLElement | null;
}

export interface ScrollAreaEvents {
  scroll: CustomEvent<{ scrollTop: number; scrollLeft: number }>;
}
