import { Component } from '../core/Component';
import type { AspectRatioOptions, AspectRatioElements } from './types';

export class AspectRatio extends Component {
  private elements: AspectRatioElements;
  private ratio: number;

  constructor(element: HTMLElement, options: AspectRatioOptions = {}) {
    super(element, options);

    this.ratio = options.ratio ?? 1;

    this.elements = {
      root: element,
      wrapper: null as any,
      content: null as any,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create wrapper
    this.elements.wrapper = this.querySelector('[data-aspect-ratio-wrapper]') || this.createElement('div', {
      'data-aspect-ratio-wrapper': ''
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-aspect-ratio-content]') || this.createElement('div', {
      'data-aspect-ratio-content': ''
    });

    // Add elements to DOM if they don't exist
    if (!this.querySelector('[data-aspect-ratio-wrapper]')) {
      this.element.appendChild(this.elements.wrapper);
    }
    if (!this.querySelector('[data-aspect-ratio-content]')) {
      this.elements.wrapper.appendChild(this.elements.content);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-aspect-ratio', '');
  }

  private updateDisplay(): void {
    // Set wrapper styles for aspect ratio
    this.elements.wrapper.style.position = 'relative';
    this.elements.wrapper.style.width = '100%';
    this.elements.wrapper.style.paddingBottom = `${100 / this.ratio}%`;

    // Set content styles to fill the wrapper
    this.elements.content.style.position = 'absolute';
    this.elements.content.style.top = '0';
    this.elements.content.style.right = '0';
    this.elements.content.style.bottom = '0';
    this.elements.content.style.left = '0';
  }

  public setRatio(ratio: number): void {
    this.ratio = ratio;
    this.updateDisplay();
  }

  public getRatio(): number {
    return this.ratio;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: AspectRatioOptions = {}): AspectRatio {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new AspectRatio(element, options);
  }

  protected cleanup(): void {
    this.elements = null as any;
  }
}
