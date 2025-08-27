import { Component } from '../core/Component';
import type { ProgressOptions, ProgressElements, ProgressState } from './types';

const DEFAULT_MAX = 100;

export class Progress extends Component {
  private elements: ProgressElements;
  private value: number | null;
  private max: number;
  private getValueLabel: (value: number, max: number) => string;

  constructor(element: HTMLElement, options: ProgressOptions = {}) {
    super(element, options);

    this.value = options.value ?? null;
    this.max = this.validateMax(options.max);
    this.getValueLabel = options.getValueLabel ?? this.defaultGetValueLabel;

    // Validate value
    if (this.value !== null && !this.isValidValue(this.value)) {
      console.error(this.getInvalidValueError(this.value.toString()));
      this.value = null;
    }

    this.elements = {
      root: element,
      indicator: null as any,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create indicator
    this.elements.indicator = this.querySelector('[data-progress-indicator]') || this.createElement('div', {
      'data-progress-indicator': ''
    });

    // Add indicator to DOM if it doesn't exist
    if (!this.querySelector('[data-progress-indicator]')) {
      this.element.appendChild(this.elements.indicator);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-progress', '');
    this.setAttribute(this.element, 'role', 'progressbar');
    this.setAttribute(this.element, 'aria-valuemax', this.max.toString());
    this.setAttribute(this.element, 'aria-valuemin', '0');

    // Set up indicator
    this.setAttribute(this.elements.indicator, 'data-progress-indicator', '');
  }

  private updateDisplay(): void {
    const state = this.getProgressState();
    const valueLabel = this.value !== null ? this.getValueLabel(this.value, this.max) : undefined;

    // Update root attributes
    this.setAttribute(this.element, 'aria-valuenow', this.value !== null ? this.value.toString() : '');
    if (valueLabel) {
      this.setAttribute(this.element, 'aria-valuetext', valueLabel);
    } else {
      this.element.removeAttribute('aria-valuetext');
    }
    this.setDataAttribute(this.element, 'state', state);
    this.setDataAttribute(this.element, 'value', this.value?.toString() || null);
    this.setDataAttribute(this.element, 'max', this.max.toString());

    // Update indicator attributes
    this.setDataAttribute(this.elements.indicator, 'state', state);
    this.setDataAttribute(this.elements.indicator, 'value', this.value?.toString() || null);
    this.setDataAttribute(this.elements.indicator, 'max', this.max.toString());

    // Update indicator width for visual progress
    if (this.value !== null) {
      const percentage = (this.value / this.max) * 100;
      this.elements.indicator.style.width = `${percentage}%`;
    } else {
      // For indeterminate state, you might want to add animation
      this.elements.indicator.style.width = '0%';
    }

    // Dispatch change event
    this.dispatchEvent(new CustomEvent('valueChange', {
      detail: { value: this.value, max: this.max }
    }));
  }

  private getProgressState(): ProgressState {
    if (this.value === null) return 'indeterminate';
    if (this.value === this.max) return 'complete';
    return 'loading';
  }

  private defaultGetValueLabel(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }

  private isValidValue(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value <= this.max && value >= 0;
  }

  private validateMax(max: number | undefined): number {
    if (max !== undefined && this.isValidMax(max)) {
      return max;
    }
    if (max !== undefined) {
      console.error(this.getInvalidMaxError(max.toString()));
    }
    return DEFAULT_MAX;
  }

  private isValidMax(max: number): boolean {
    return typeof max === 'number' && !isNaN(max) && max > 0;
  }

  private getInvalidValueError(propValue: string): string {
    return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`Progress\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
  }

  private getInvalidMaxError(propValue: string): string {
    return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
  }

  public setValue(value: number | null): void {
    if (value !== null && !this.isValidValue(value)) {
      console.error(this.getInvalidValueError(value.toString()));
      return;
    }
    this.value = value;
    this.updateDisplay();
  }

  public setMax(max: number): void {
    const validatedMax = this.validateMax(max);
    this.max = validatedMax;
    
    // Revalidate current value
    if (this.value !== null && !this.isValidValue(this.value)) {
      console.error(this.getInvalidValueError(this.value.toString()));
      this.value = null;
    }
    
    this.updateDisplay();
  }

  public getValue(): number | null {
    return this.value;
  }

  public getMax(): number {
    return this.max;
  }

  public getState(): ProgressState {
    return this.getProgressState();
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: ProgressOptions = {}): Progress {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Progress(element, options);
  }

  protected cleanup(): void {
    this.elements = null as any;
  }
}
