import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { SliderOptions, SliderElements, SliderThumb, SliderOrientation } from './types';

export class Slider extends Component {
  private valueState: ReturnType<typeof createControllableState<number[]>>;
  private elements: SliderElements;
  private min: number;
  private max: number;
  private step: number;
  private orientation: SliderOrientation;
  private disabled: boolean;
  private name: string | undefined;
  private form: string | undefined;
  private inverted: boolean;
  private minStepsBetweenThumbs: number;
  private thumbs: SliderThumb[] = [];
  private activeThumbIndex: number = 0;
  private isDragging: boolean = false;
  private startValues: number[] = [];

  constructor(element: HTMLElement, options: SliderOptions = {}) {
    super(element, options);

    this.valueState = createControllableState<number[]>({
      prop: options.value,
      defaultProp: options.defaultValue ?? [options.min ?? 0],
      onChange: options.onValueChange,
    });

    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.step = options.step ?? 1;
    this.orientation = options.orientation ?? 'horizontal';
    this.disabled = options.disabled ?? false;
    this.name = options.name;
    this.form = options.form;
    this.inverted = options.inverted ?? false;
    this.minStepsBetweenThumbs = options.minStepsBetweenThumbs ?? 0;

    this.elements = {
      root: element,
      track: null as any,
      range: null as any,
      thumbs: [],
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    this.elements.track = this.querySelector('[data-slider-track]') || this.createElement('span', {
      'data-slider-track': '',
      'role': 'slider'
    });

    this.elements.range = this.querySelector('[data-slider-range]') || this.createElement('span', {
      'data-slider-range': ''
    });

    // Find existing thumbs or create default ones
    const existingThumbs = this.querySelectorAll('[data-slider-thumb]');
    if (existingThumbs.length > 0) {
      this.elements.thumbs = Array.from(existingThumbs);
    } else {
      // Create a default thumb
      const thumb = this.createElement('span', {
        'data-slider-thumb': '',
        'role': 'slider',
        'tabindex': '0'
      });
      this.elements.thumbs = [thumb];
    }

    // Add track and range to the root if they don't exist
    if (!this.querySelector('[data-slider-track]')) {
      this.element.appendChild(this.elements.track);
    }
    if (!this.querySelector('[data-slider-range]')) {
      this.elements.track.appendChild(this.elements.range);
    }

    // Add thumbs to the track if they don't exist
    this.elements.thumbs.forEach((thumb, index) => {
      if (!this.querySelector(`[data-slider-thumb]:nth-child(${index + 1})`)) {
        this.elements.track.appendChild(thumb);
      }
    });
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-slider', '');
    this.setAttribute(this.element, 'aria-orientation', this.orientation);

    // Set up track
    this.setAttribute(this.elements.track, 'data-slider-track', '');
    this.setAttribute(this.elements.track, 'aria-orientation', this.orientation);

    // Set up range
    this.setAttribute(this.elements.range, 'data-slider-range', '');

    // Set up thumbs
    this.elements.thumbs.forEach((thumb, index) => {
      this.setAttribute(thumb, 'data-slider-thumb', '');
      this.setAttribute(thumb, 'role', 'slider');
      this.setAttribute(thumb, 'tabindex', '0');
      this.setAttribute(thumb, 'aria-valuemin', this.min.toString());
      this.setAttribute(thumb, 'aria-valuemax', this.max.toString());
      this.setAttribute(thumb, 'aria-valuenow', '0');
    });
  }

  private setupEventListeners(): void {
    // Listen for value changes
    this.valueState.subscribe((values: number[]) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('valueChange', { detail: { value: values } }));
    });

    // Handle track clicks
    this.addEventListener(this.elements.track, 'click', (e) => this.handleTrackClick(e));

    // Handle thumb events
    this.elements.thumbs.forEach((thumb, index) => {
      this.addEventListener(thumb, 'pointerdown', (e) => this.handleThumbPointerDown(e, index));
      this.addEventListener(thumb, 'keydown', (e) => this.handleThumbKeydown(e, index));
      this.addEventListener(thumb, 'focus', () => this.activeThumbIndex = index);
    });

    // Handle global pointer events
    this.addEventListener(document, 'pointermove', (e) => this.handlePointerMove(e));
    this.addEventListener(document, 'pointerup', (e) => this.handlePointerUp(e));
  }

  private handleTrackClick(event: Event): void {
    if (this.disabled) return;

    const rect = this.elements.track.getBoundingClientRect();
    const clientX = (event as PointerEvent).clientX;
    const clientY = (event as PointerEvent).clientY;
    
    let percentage: number;
    if (this.orientation === 'horizontal') {
      percentage = (clientX - rect.left) / rect.width;
    } else {
      percentage = (clientY - rect.top) / rect.height;
    }

    if (this.inverted) {
      percentage = 1 - percentage;
    }

    const value = this.min + (this.max - this.min) * percentage;
    this.updateValue(value, this.activeThumbIndex);
  }

  private handleThumbPointerDown(event: Event, index: number): void {
    if (this.disabled) return;

    event.preventDefault();
    this.isDragging = true;
    this.activeThumbIndex = index;
    this.startValues = [...this.valueState.getValue()];
    
    const thumb = this.elements.thumbs[index];
    if (thumb) {
      thumb.setPointerCapture((event as PointerEvent).pointerId);
    }
  }

  private handlePointerMove(event: Event): void {
    if (!this.isDragging || this.disabled) return;

    const rect = this.elements.track.getBoundingClientRect();
    const clientX = (event as PointerEvent).clientX;
    const clientY = (event as PointerEvent).clientY;
    
    let percentage: number;
    if (this.orientation === 'horizontal') {
      percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    } else {
      percentage = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    if (this.inverted) {
      percentage = 1 - percentage;
    }

    const value = this.min + (this.max - this.min) * percentage;
    this.updateValue(value, this.activeThumbIndex);
  }

  private handlePointerUp(event: Event): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    const currentValues = this.valueState.getValue();
    
    // Check if values have changed
    const hasChanged = JSON.stringify(this.startValues) !== JSON.stringify(currentValues);
    if (hasChanged) {
      this.dispatchEvent(new CustomEvent('valueCommit', { detail: { value: currentValues } }));
    }

    const thumb = this.elements.thumbs[this.activeThumbIndex];
    if (thumb) {
      thumb.releasePointerCapture((event as PointerEvent).pointerId);
    }
  }

  private handleThumbKeydown(event: Event, index: number): void {
    if (this.disabled) return;

    const key = (event as KeyboardEvent).key;
    const currentValue = this.valueState.getValue()[index] || this.min;
    let newValue = currentValue;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault();
        newValue = Math.min(this.max, currentValue + this.step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault();
        newValue = Math.max(this.min, currentValue - this.step);
        break;
      case 'Home':
        event.preventDefault();
        newValue = this.min;
        break;
      case 'End':
        event.preventDefault();
        newValue = this.max;
        break;
      case 'PageUp':
        event.preventDefault();
        newValue = Math.min(this.max, currentValue + this.step * 10);
        break;
      case 'PageDown':
        event.preventDefault();
        newValue = Math.max(this.min, currentValue - this.step * 10);
        break;
      default:
        return;
    }

    this.updateValue(newValue, index);
    this.dispatchEvent(new CustomEvent('valueCommit', { detail: { value: this.valueState.getValue() } }));
  }

  private updateValue(value: number, index: number): void {
    const values = [...this.valueState.getValue()];
    values[index] = this.snapToStep(value);
    this.valueState.setValue(values);
  }

  private snapToStep(value: number): number {
    const steps = Math.round((value - this.min) / this.step);
    return this.min + steps * this.step;
  }

  private updateDisplay(): void {
    const values = this.valueState.getValue();
    
    // Update thumb positions and attributes
    this.elements.thumbs.forEach((thumb, index) => {
      const value = values[index] || this.min;
      const percentage = (value - this.min) / (this.max - this.min);
      
      if (this.orientation === 'horizontal') {
        const position = this.inverted ? 100 - percentage * 100 : percentage * 100;
        thumb.style.left = `${position}%`;
      } else {
        const position = this.inverted ? 100 - percentage * 100 : percentage * 100;
        thumb.style.top = `${position}%`;
      }

      this.setAttribute(thumb, 'aria-valuenow', value.toString());
      this.setDataAttribute(thumb, 'state', 'checked');
    });

    // Update range
    if (values.length > 1) {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const minPercentage = (minValue - this.min) / (this.max - this.min);
      const maxPercentage = (maxValue - this.min) / (this.max - this.min);
      
      if (this.orientation === 'horizontal') {
        const start = this.inverted ? 100 - maxPercentage * 100 : minPercentage * 100;
        const end = this.inverted ? 100 - minPercentage * 100 : maxPercentage * 100;
        this.elements.range.style.left = `${start}%`;
        this.elements.range.style.width = `${end - start}%`;
      } else {
        const start = this.inverted ? 100 - maxPercentage * 100 : minPercentage * 100;
        const end = this.inverted ? 100 - minPercentage * 100 : maxPercentage * 100;
        this.elements.range.style.top = `${start}%`;
        this.elements.range.style.height = `${end - start}%`;
      }
    } else {
      const value = values[0] || this.min;
      const percentage = (value - this.min) / (this.max - this.min);
      
      if (this.orientation === 'horizontal') {
        const position = this.inverted ? 100 - percentage * 100 : percentage * 100;
        this.elements.range.style.left = '0%';
        this.elements.range.style.width = `${position}%`;
      } else {
        const position = this.inverted ? 100 - percentage * 100 : percentage * 100;
        this.elements.range.style.top = '0%';
        this.elements.range.style.height = `${position}%`;
      }
    }

    // Update disabled state
    if (this.disabled) {
      this.setAttribute(this.element, 'data-disabled', '');
      this.setAttribute(this.element, 'aria-disabled', 'true');
    } else {
      this.element.removeAttribute('data-disabled');
      this.element.removeAttribute('aria-disabled');
    }
  }

  public setValue(values: number[]): void {
    this.valueState.setValue(values);
  }

  public getValue(): number[] {
    return this.valueState.getValue();
  }

  public setValueAtIndex(value: number, index: number): void {
    const values = [...this.valueState.getValue()];
    values[index] = this.snapToStep(value);
    this.valueState.setValue(values);
  }

  public getValueAtIndex(index: number): number {
    return this.valueState.getValue()[index] || this.min;
  }

  public enable(): void {
    this.disabled = false;
    this.updateDisplay();
  }

  public disable(): void {
    this.disabled = true;
    this.updateDisplay();
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: SliderOptions = {}): Slider {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Slider(element, options);
  }

  protected cleanup(): void {
    this.valueState = null as any;
    this.elements = null as any;
    this.thumbs = [];
  }
}
