import { Component } from '../core/Component';
import { SeparatorOptions, SeparatorOrientation } from './types';

const DEFAULT_ORIENTATION: SeparatorOrientation = 'horizontal';
const ORIENTATIONS: SeparatorOrientation[] = ['horizontal', 'vertical'];

export class Separator extends Component {
  private orientation: SeparatorOrientation = 'horizontal';
  private decorative: boolean = false;

  constructor(element: HTMLElement, options: SeparatorOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      orientation = DEFAULT_ORIENTATION,
      decorative = false
    } = this.options as SeparatorOptions;

    this.orientation = this.isValidOrientation(orientation) ? orientation : DEFAULT_ORIENTATION;
    this.decorative = decorative;

    this.setupElement();
  }

  private setupElement(): void {
    // Set data attribute for styling
    this.setDataAttribute(this.element, 'orientation', this.orientation);

    // Set ARIA attributes
    if (this.decorative) {
      this.setAttribute(this.element, 'role', 'none');
    } else {
      this.setAttribute(this.element, 'role', 'separator');
      // `aria-orientation` defaults to `horizontal` so we only need it if `orientation` is vertical
      if (this.orientation === 'vertical') {
        this.setAttribute(this.element, 'aria-orientation', 'vertical');
      }
    }
  }

  private isValidOrientation(orientation: any): orientation is SeparatorOrientation {
    return ORIENTATIONS.includes(orientation);
  }

  public setOrientation(orientation: SeparatorOrientation): void {
    if (this.isValidOrientation(orientation)) {
      this.orientation = orientation;
      this.setDataAttribute(this.element, 'orientation', orientation);
      
      if (!this.decorative) {
        if (orientation === 'vertical') {
          this.setAttribute(this.element, 'aria-orientation', 'vertical');
        } else {
          this.element.removeAttribute('aria-orientation');
        }
      }
    }
  }

  public setDecorative(decorative: boolean): void {
    this.decorative = decorative;
    
    if (decorative) {
      this.setAttribute(this.element, 'role', 'none');
      this.element.removeAttribute('aria-orientation');
    } else {
      this.setAttribute(this.element, 'role', 'separator');
      if (this.orientation === 'vertical') {
        this.setAttribute(this.element, 'aria-orientation', 'vertical');
      }
    }
  }

  public getOrientation(): SeparatorOrientation {
    return this.orientation;
  }

  public isDecorative(): boolean {
    return this.decorative;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: SeparatorOptions = {}): Separator {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Separator(element, options);
  }
}
