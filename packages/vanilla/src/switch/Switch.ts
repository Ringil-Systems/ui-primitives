import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { SwitchOptions, SwitchElements, SwitchEvents } from './types';

export class Switch extends Component {
  private checkedState: ReturnType<typeof createControllableState<boolean>>;
  private elements: SwitchElements;
  private required: boolean;
  private disabled: boolean;
  private value: string;
  private name: string | undefined;
  private form: string | undefined;
  private hasConsumerStoppedPropagation: boolean = false;

  constructor(element: HTMLElement, options: SwitchOptions = {}) {
    super(element, options);

    this.checkedState = createControllableState<boolean>({
      prop: options.checked,
      defaultProp: options.defaultChecked ?? false,
      onChange: options.onCheckedChange,
    });

    this.required = options.required ?? false;
    this.disabled = options.disabled ?? false;
    this.value = options.value ?? 'on';
    this.name = options.name;
    this.form = options.form;

    this.elements = {
      root: element,
      thumb: null as any,
      bubbleInput: null as any,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    this.elements.thumb = this.querySelector('[data-switch-thumb]') || this.createElement('span', {
      'data-switch-thumb': '',
      'role': 'presentation'
    });

    // Create bubble input for form integration
    this.elements.bubbleInput = this.createElement('input', {
      'type': 'checkbox',
      'aria-hidden': 'true',
      'tabindex': '-1',
      'style': 'position: absolute; pointer-events: none; opacity: 0; margin: 0;'
    }) as HTMLInputElement;

    // Add thumb and bubble input to the root if they don't exist
    if (!this.querySelector('[data-switch-thumb]')) {
      this.element.appendChild(this.elements.thumb);
    }
    this.element.appendChild(this.elements.bubbleInput);
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'type', 'button');
    this.setAttribute(this.element, 'role', 'switch');
    this.setAttribute(this.element, 'data-switch', '');

    if (this.name) {
      this.setAttribute(this.elements.bubbleInput, 'name', this.name);
    }
    if (this.form) {
      this.setAttribute(this.elements.bubbleInput, 'form', this.form);
    }

    this.setAttribute(this.elements.bubbleInput, 'value', this.value);
    this.setAttribute(this.elements.bubbleInput, 'required', this.required ? 'true' : 'false');
  }

  private setupEventListeners(): void {
    // Listen for checked state changes
    this.checkedState.subscribe((checked: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('checkedChange', { detail: { checked } }));
    });

    // Handle click events
    this.addEventListener(this.element, 'click', (e) => this.handleClick(e));
  }

  private handleClick(event: Event): void {
    if (this.disabled) return;

    const isFormControl = this.form || !!this.element.closest('form');
    
    this.checkedState.setValue(!this.checkedState.getValue());
    
    if (isFormControl) {
      this.hasConsumerStoppedPropagation = event.defaultPrevented;
      if (!this.hasConsumerStoppedPropagation) {
        event.stopPropagation();
      }
    }
  }

  private updateDisplay(): void {
    const checked = this.checkedState.getValue() as boolean;
    
    // Update root attributes
    this.setAttribute(this.element, 'aria-checked', checked.toString());
    this.setAttribute(this.element, 'aria-required', this.required.toString());
    this.setDataAttribute(this.element, 'state', checked ? 'checked' : 'unchecked');
    
    if (this.disabled) {
      this.setAttribute(this.element, 'data-disabled', '');
      this.setAttribute(this.element, 'disabled', '');
    } else {
      this.element.removeAttribute('data-disabled');
      this.element.removeAttribute('disabled');
    }

    // Update thumb attributes
    this.setDataAttribute(this.elements.thumb, 'state', checked ? 'checked' : 'unchecked');
    if (this.disabled) {
      this.setAttribute(this.elements.thumb, 'data-disabled', '');
    } else {
      this.elements.thumb.removeAttribute('data-disabled');
    }

    // Update bubble input
    this.elements.bubbleInput.checked = checked;
    this.elements.bubbleInput.required = this.required;
    this.elements.bubbleInput.disabled = this.disabled;
  }

  public setChecked(checked: boolean): void {
    this.checkedState.setValue(checked);
  }

  public getChecked(): boolean {
    return this.checkedState.getValue() as boolean;
  }

  public toggle(): void {
    this.setChecked(!this.getChecked());
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
  static create(selector: string | HTMLElement, options: SwitchOptions = {}): Switch {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Switch(element, options);
  }

  protected cleanup(): void {
    this.checkedState = null as any;
    this.elements = null as any;
  }
}
