import { Component } from '../core/Component';
import { LabelOptions } from './types';

export class Label extends Component {
  constructor(element: HTMLElement, options: LabelOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const { htmlFor } = this.options as LabelOptions;
    
    this.setupElement();
    
    if (htmlFor) {
      this.setAttribute(this.element, 'for', htmlFor);
    }
  }

  private setupElement(): void {
    // Set up event listeners for preventing text selection
    this.addEventListener(this.element, 'mousedown', (e) => this.handleMouseDown(e as MouseEvent));
  }

  private handleMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Only prevent text selection if clicking inside the label itself
    if (target.closest('button, input, select, textarea')) return;

    // Prevent text selection when double clicking label
    if (!event.defaultPrevented && event.detail > 1) {
      event.preventDefault();
    }
  }

  public setFor(htmlFor: string): void {
    this.setAttribute(this.element, 'for', htmlFor);
  }

  public getFor(): string | null {
    return this.getAttribute(this.element, 'for');
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: LabelOptions = {}): Label {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Label(element, options);
  }
}
