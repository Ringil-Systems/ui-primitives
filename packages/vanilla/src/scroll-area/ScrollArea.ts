import { Component } from '../core/Component';
import type { ScrollAreaOptions, ScrollAreaElements, ScrollAreaType, Direction } from './types';

export class ScrollArea extends Component {
  private elements: ScrollAreaElements;
  private type: ScrollAreaType;
  private dir: Direction;
  private scrollHideDelay: number;
  private scrollbarXEnabled: boolean = false;
  private scrollbarYEnabled: boolean = false;
  private hideTimer: number | null = null;

  constructor(element: HTMLElement, options: ScrollAreaOptions = {}) {
    super(element, options);

    this.type = options.type ?? 'hover';
    this.dir = options.dir ?? 'ltr';
    this.scrollHideDelay = options.scrollHideDelay ?? 600;

    this.elements = {
      root: element,
      viewport: null as any,
      content: null as any,
      scrollbarX: null,
      scrollbarY: null,
      thumbX: null,
      thumbY: null,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create viewport
    this.elements.viewport = this.querySelector('[data-scroll-area-viewport]') || this.createElement('div', {
      'data-scroll-area-viewport': ''
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-scroll-area-content]') || this.createElement('div', {
      'data-scroll-area-content': '',
      'style': 'min-width: 100%; display: table;'
    });

    // Find or create scrollbars
    this.elements.scrollbarX = this.querySelector('[data-scroll-area-scrollbar-x]') || this.createElement('div', {
      'data-scroll-area-scrollbar-x': '',
      'role': 'scrollbar',
      'aria-orientation': 'horizontal'
    });

    this.elements.scrollbarY = this.querySelector('[data-scroll-area-scrollbar-y]') || this.createElement('div', {
      'data-scroll-area-scrollbar-y': '',
      'role': 'scrollbar',
      'aria-orientation': 'vertical'
    });

    // Find or create thumbs
    this.elements.thumbX = this.querySelector('[data-scroll-area-thumb-x]') || this.createElement('div', {
      'data-scroll-area-thumb-x': ''
    });

    this.elements.thumbY = this.querySelector('[data-scroll-area-thumb-y]') || this.createElement('div', {
      'data-scroll-area-thumb-y': ''
    });

    // Add elements to DOM if they don't exist
    if (!this.querySelector('[data-scroll-area-viewport]')) {
      this.element.appendChild(this.elements.viewport);
    }
    if (!this.querySelector('[data-scroll-area-content]')) {
      this.elements.viewport.appendChild(this.elements.content);
    }
    if (!this.querySelector('[data-scroll-area-scrollbar-x]')) {
      this.element.appendChild(this.elements.scrollbarX);
    }
    if (!this.querySelector('[data-scroll-area-scrollbar-y]')) {
      this.element.appendChild(this.elements.scrollbarY);
    }
    if (!this.querySelector('[data-scroll-area-thumb-x]')) {
      this.elements.scrollbarX.appendChild(this.elements.thumbX);
    }
    if (!this.querySelector('[data-scroll-area-thumb-y]')) {
      this.elements.scrollbarY.appendChild(this.elements.thumbY);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-scroll-area', '');
    this.setAttribute(this.element, 'dir', this.dir);
    this.element.style.position = 'relative';

    // Set up viewport
    this.setAttribute(this.elements.viewport, 'data-scroll-area-viewport', '');
    this.elements.viewport.style.overflowX = 'hidden';
    this.elements.viewport.style.overflowY = 'hidden';
    (this.elements.viewport.style as any).webkitOverflowScrolling = 'touch';

    // Set up content
    this.setAttribute(this.elements.content, 'data-scroll-area-content', '');
    this.elements.content.style.minWidth = '100%';
    this.elements.content.style.display = 'table';

    // Set up scrollbars
    if (this.elements.scrollbarX) {
      this.setAttribute(this.elements.scrollbarX, 'data-scroll-area-scrollbar-x', '');
      this.setAttribute(this.elements.scrollbarX, 'role', 'scrollbar');
      this.setAttribute(this.elements.scrollbarX, 'aria-orientation', 'horizontal');
    }

    if (this.elements.scrollbarY) {
      this.setAttribute(this.elements.scrollbarY, 'data-scroll-area-scrollbar-y', '');
      this.setAttribute(this.elements.scrollbarY, 'role', 'scrollbar');
      this.setAttribute(this.elements.scrollbarY, 'aria-orientation', 'vertical');
    }

    // Set up thumbs
    if (this.elements.thumbX) {
      this.setAttribute(this.elements.thumbX, 'data-scroll-area-thumb-x', '');
    }
    if (this.elements.thumbY) {
      this.setAttribute(this.elements.thumbY, 'data-scroll-area-thumb-y', '');
    }
  }

  private setupEventListeners(): void {
    // Handle viewport scroll
    this.addEventListener(this.elements.viewport, 'scroll', (e) => this.handleScroll(e));

    // Handle viewport mouse events for hover type
    if (this.type === 'hover') {
      this.addEventListener(this.elements.viewport, 'mouseenter', () => this.showScrollbars());
      this.addEventListener(this.elements.viewport, 'mouseleave', () => this.hideScrollbars());
    }

    // Handle scrollbar interactions
    if (this.elements.scrollbarX) {
      this.addEventListener(this.elements.scrollbarX, 'mousedown', (e) => this.handleScrollbarMouseDown(e, 'x'));
    }
    if (this.elements.scrollbarY) {
      this.addEventListener(this.elements.scrollbarY, 'mousedown', (e) => this.handleScrollbarMouseDown(e, 'y'));
    }

    // Handle thumb interactions
    if (this.elements.thumbX) {
      this.addEventListener(this.elements.thumbX, 'mousedown', (e) => this.handleThumbMouseDown(e, 'x'));
    }
    if (this.elements.thumbY) {
      this.addEventListener(this.elements.thumbY, 'mousedown', (e) => this.handleThumbMouseDown(e, 'y'));
    }

    // Handle resize
    this.addEventListener(window, 'resize', () => this.updateScrollbars());
  }

  private handleScroll(event: Event): void {
    const viewport = event.target as HTMLElement;
    this.dispatchEvent(new CustomEvent('scroll', {
      detail: {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft
      }
    }));
    this.updateThumbs();
  }

  private handleScrollbarMouseDown(event: Event, axis: 'x' | 'y'): void {
    event.preventDefault();
    const scrollbar = event.currentTarget as HTMLElement;
    const rect = scrollbar.getBoundingClientRect();
    const clientPos = axis === 'x' ? (event as MouseEvent).clientX : (event as MouseEvent).clientY;
    const scrollbarPos = axis === 'x' ? rect.left : rect.top;
    const scrollbarSize = axis === 'x' ? rect.width : rect.height;
    const clickPos = clientPos - scrollbarPos;
    const percentage = clickPos / scrollbarSize;
    
    const viewport = this.elements.viewport;
    const maxScroll = axis === 'x' 
      ? viewport.scrollWidth - viewport.clientWidth
      : viewport.scrollHeight - viewport.clientHeight;
    
    const newScroll = percentage * maxScroll;
    
    if (axis === 'x') {
      viewport.scrollLeft = newScroll;
    } else {
      viewport.scrollTop = newScroll;
    }
  }

  private handleThumbMouseDown(event: Event, axis: 'x' | 'y'): void {
    event.preventDefault();
    event.stopPropagation();
    
    const thumb = event.currentTarget as HTMLElement;
    const startPos = axis === 'x' ? (event as MouseEvent).clientX : (event as MouseEvent).clientY;
    const startScroll = axis === 'x' ? this.elements.viewport.scrollLeft : this.elements.viewport.scrollTop;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = axis === 'x' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;
      const scrollbarSize = axis === 'x' 
        ? this.elements.scrollbarX!.offsetWidth 
        : this.elements.scrollbarY!.offsetHeight;
      const viewportSize = axis === 'x' 
        ? this.elements.viewport.clientWidth 
        : this.elements.viewport.clientHeight;
      const contentSize = axis === 'x' 
        ? this.elements.viewport.scrollWidth 
        : this.elements.viewport.scrollHeight;
      
      const scrollRatio = delta / (scrollbarSize - viewportSize);
      const newScroll = startScroll + (scrollRatio * (contentSize - viewportSize));
      
      if (axis === 'x') {
        this.elements.viewport.scrollLeft = newScroll;
      } else {
        this.elements.viewport.scrollTop = newScroll;
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private updateScrollbars(): void {
    const viewport = this.elements.viewport;
    const content = this.elements.content;
    
    this.scrollbarXEnabled = content.scrollWidth > viewport.clientWidth;
    this.scrollbarYEnabled = content.scrollHeight > viewport.clientHeight;
    
    this.updateDisplay();
  }

  private updateThumbs(): void {
    const viewport = this.elements.viewport;
    const content = this.elements.content;
    
    if (this.elements.thumbX && this.scrollbarXEnabled && this.elements.scrollbarX) {
      const scrollRatio = viewport.scrollLeft / (content.scrollWidth - viewport.clientWidth);
      const thumbWidth = Math.max(20, (viewport.clientWidth / content.scrollWidth) * this.elements.scrollbarX.offsetWidth);
      this.elements.thumbX.style.width = `${thumbWidth}px`;
      this.elements.thumbX.style.left = `${scrollRatio * (this.elements.scrollbarX.offsetWidth - thumbWidth)}px`;
    }
    
    if (this.elements.thumbY && this.scrollbarYEnabled && this.elements.scrollbarY) {
      const scrollRatio = viewport.scrollTop / (content.scrollHeight - viewport.clientHeight);
      const thumbHeight = Math.max(20, (viewport.clientHeight / content.scrollHeight) * this.elements.scrollbarY.offsetHeight);
      this.elements.thumbY.style.height = `${thumbHeight}px`;
      this.elements.thumbY.style.top = `${scrollRatio * (this.elements.scrollbarY.offsetHeight - thumbHeight)}px`;
    }
  }

  private showScrollbars(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.updateDisplay();
  }

  private hideScrollbars(): void {
    if (this.type === 'hover') {
      this.hideTimer = window.setTimeout(() => {
        this.updateDisplay();
      }, this.scrollHideDelay);
    }
  }

  private updateDisplay(): void {
    const shouldShowX = this.scrollbarXEnabled && (this.type === 'always' || this.type === 'scroll');
    const shouldShowY = this.scrollbarYEnabled && (this.type === 'always' || this.type === 'scroll');
    
    if (this.elements.scrollbarX) {
      this.elements.scrollbarX.style.display = shouldShowX ? 'block' : 'none';
    }
    if (this.elements.scrollbarY) {
      this.elements.scrollbarY.style.display = shouldShowY ? 'block' : 'none';
    }
    
    this.updateThumbs();
  }

  public scrollTo(x?: number, y?: number): void {
    if (x !== undefined) {
      this.elements.viewport.scrollLeft = x;
    }
    if (y !== undefined) {
      this.elements.viewport.scrollTop = y;
    }
  }

  public getScrollPosition(): { scrollLeft: number; scrollTop: number } {
    return {
      scrollLeft: this.elements.viewport.scrollLeft,
      scrollTop: this.elements.viewport.scrollTop
    };
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: ScrollAreaOptions = {}): ScrollArea {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new ScrollArea(element, options);
  }

  protected cleanup(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    
    this.elements = null as any;
  }
}
